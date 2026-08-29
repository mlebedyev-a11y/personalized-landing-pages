// Persistent slug -> Slack thread `ts` map, so every visit and every Flexi
// message for one prospect page lands in a single Slack thread that lives
// forever (well, 120 days). Backed by Upstash Redis / Vercel KV via its REST
// API — no SDK dependency. Unconfigured (no REST url/token) => returns null and
// callers fall back to flat posting.

import { postSlackMessage } from "@/lib/slack";

const TTL_SECONDS = 60 * 60 * 24 * 120; // 120 days
const PENDING = "pending";
const key = (slug: string) => `flexi:thread:${slug}`;
const firstQKey = (slug: string) => `flexi:firstq:${slug}`;

function restCreds(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis<T = string>(
  ...command: (string | number)[]
): Promise<T | null> {
  const creds = restCreds();
  if (!creds) return null;
  try {
    const res = await fetch(creds.url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });
    const data = (await res.json()) as { result?: T; error?: string };
    if (data.error) {
      console.error("Redis error:", data.error);
      return null;
    }
    return data.result ?? null;
  } catch (err) {
    console.error("Redis fetch failed", err);
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * The Slack thread `ts` for this prospect page. Creates the thread root by
 * posting `rootText` on the first call for a slug; idempotent across serverless
 * instances (Redis SET NX + a short poll for the loser). Returns null when the
 * store or the Slack bot token isn't configured — callers then post flat.
 */
export async function getOrCreateThread(
  slug: string,
  rootText: string,
): Promise<string | null> {
  if (!restCreds()) return null;

  const existing = await redis<string>("GET", key(slug));
  if (existing && existing !== PENDING) return existing;

  if (!existing) {
    const claimed = await redis<string>(
      "SET",
      key(slug),
      PENDING,
      "NX",
      "EX",
      180,
    );
    if (claimed === "OK") {
      const posted = await postSlackMessage(rootText);
      if (!posted?.ts) {
        await redis("DEL", key(slug)); // release; retry on the next event
        return null;
      }
      await redis("SET", key(slug), posted.ts, "EX", TTL_SECONDS);
      return posted.ts;
    }
  }

  // Another instance is mid-create — wait briefly for the real ts.
  for (let i = 0; i < 12; i++) {
    await sleep(250);
    const ts = await redis<string>("GET", key(slug));
    if (ts && ts !== PENDING) return ts;
  }
  return null;
}

/** True for exactly one caller per slug — the one that should fold the first
 *  question into the thread root. */
export async function claimFirstQuestion(slug: string): Promise<boolean> {
  if (!restCreds()) return false;
  const ok = await redis<string>(
    "SET",
    firstQKey(slug),
    "1",
    "NX",
    "EX",
    TTL_SECONDS,
  );
  return ok === "OK";
}
