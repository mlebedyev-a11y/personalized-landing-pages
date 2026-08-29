import { NextResponse } from "next/server";
import { getBrief } from "@/lib/leads";
import { postSlackMessage, threadRootText } from "@/lib/slack";
import { getOrCreateThread } from "@/lib/thread-store";

export async function POST(request: Request) {
  let slug: unknown;
  try {
    ({ slug } = await request.json());
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "missing slug" }, { status: 400 });
  }

  const brief = getBrief(slug);
  if (!brief) {
    return NextResponse.json({ error: "unknown slug" }, { status: 404 });
  }

  // Create the prospect's single Slack thread on the first-ever view (idempotent
  // — repeat views find the existing thread and do nothing). The thread root is
  // the "opened their page" notification.
  const threadTs = await getOrCreateThread(brief.slug, threadRootText(brief));

  let notified = threadTs !== null;
  if (!threadTs) {
    // No thread store / bot token: fall back to a flat one-off ping.
    const posted = await postSlackMessage(
      `🔔 *${brief.name}* (${brief.title}, ${brief.company}) opened their personalized page — /l/${brief.slug}`,
    );
    notified = posted !== null;
  }

  return NextResponse.json({ ok: true, notified });
}
