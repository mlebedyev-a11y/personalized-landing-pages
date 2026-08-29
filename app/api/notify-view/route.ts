import { NextResponse } from "next/server";
import { getBrief } from "@/lib/leads";
import { postSlackMessage } from "@/lib/slack";

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

  const text = `🔔 *${brief.name}* (${brief.title}, ${brief.company}) just opened their personalized page: /l/${brief.slug}`;

  // The returned `ts` is this message's id — the client stashes it so Flexi Q&A
  // from the same visit can be posted as threaded replies under this notification.
  const posted = await postSlackMessage(text);
  return NextResponse.json({
    ok: true,
    notified: posted !== null,
    ts: posted?.ts ?? null,
  });
}
