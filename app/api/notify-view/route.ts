import { NextResponse } from "next/server";
import { getBrief } from "@/lib/leads";

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

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not set; skipping Slack notification for", slug);
    return NextResponse.json({ ok: true, notified: false });
  }

  const text = `🔔 *${brief.name}* (${brief.title}, ${brief.company}) just opened their personalized page: /l/${brief.slug}`;

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return NextResponse.json({ ok: true, notified: res.ok });
  } catch (err) {
    console.error("Slack notify failed", err);
    return NextResponse.json({ ok: true, notified: false });
  }
}
