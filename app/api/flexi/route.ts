import Anthropic from "@anthropic-ai/sdk";
import { getBrief } from "@/lib/leads";
import {
  buildSystemPrompt,
  postFlexiTranscriptToSlack,
  FLEXI_MODEL,
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_CHARS,
  type FlexiMessage,
} from "@/lib/flexi";
import { isSlackTs } from "@/lib/slack";

export const runtime = "nodejs";
export const maxDuration = 30;

// --- Lightweight per-IP rate limit -----------------------------------------
// In-memory fixed window. Resets on cold start / is per serverless instance —
// fine as an abuse damper at this volume. Move to Vercel KV / Upstash if needed.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQ_PER_WINDOW = 20;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    // opportunistic cleanup so the map can't grow unbounded
    for (const [k, v] of hits) {
      if (v.every((t) => now - t >= WINDOW_MS)) hits.delete(k);
    }
  }
  return recent.length > MAX_REQ_PER_WINDOW;
}

function isFlexiMessage(x: unknown): x is FlexiMessage {
  if (typeof x !== "object" || x === null) return false;
  const m = x as Record<string, unknown>;
  return (
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    m.content.trim().length > 0 &&
    m.content.length <= MAX_MESSAGE_CHARS
  );
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid body" }, { status: 400 });
  }

  const { slug, messages, threadTs } = (body ?? {}) as {
    slug?: unknown;
    messages?: unknown;
    threadTs?: unknown;
  };
  const thread = isSlackTs(threadTs) ? threadTs : undefined;

  if (typeof slug !== "string" || !slug) {
    return Response.json({ error: "missing slug" }, { status: 400 });
  }
  const brief = getBrief(slug);
  if (!brief) {
    return Response.json({ error: "unknown slug" }, { status: 404 });
  }

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    messages.length > MAX_HISTORY_MESSAGES ||
    !messages.every(isFlexiMessage) ||
    messages[messages.length - 1].role !== "user"
  ) {
    return Response.json({ error: "invalid messages" }, { status: 400 });
  }

  // Trust only role + content; drop anything else the client sent.
  const history: FlexiMessage[] = (messages as FlexiMessage[]).map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not set; Flexi is unavailable");
    return Response.json({ error: "unavailable" }, { status: 503 });
  }

  const { stable, personalized } = buildSystemPrompt(brief);
  const client = new Anthropic();

  const stream = client.messages.stream({
    model: FLEXI_MODEL,
    max_tokens: 800,
    system: [
      { type: "text", text: stable, cache_control: { type: "ephemeral" } },
      { type: "text", text: personalized },
    ],
    messages: history,
  });

  const encoder = new TextEncoder();
  const lastUserMessage = history[history.length - 1].content;

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await stream.finalMessage();
        const answer = final.content
          .filter((b): b is Anthropic.TextBlock => b.type === "text")
          .map((b) => b.text)
          .join("");
        // Awaited, not fire-and-forget: on Vercel the function is frozen the
        // moment the response finishes, so an un-awaited post never runs. The
        // answer text is already flushed to the client above, so this only
        // delays the stream's close by the length of one Slack call.
        await postFlexiTranscriptToSlack(brief, lastUserMessage, answer, thread);
      } catch (err) {
        console.error("Flexi stream error", err);
        controller.enqueue(
          encoder.encode(
            "\n\n(Sorry — I hit a problem answering that. Try again, or reply to the email this page came from.)",
          ),
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
