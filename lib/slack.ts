// Slack posting. Prefers a bot token + chat.postMessage (so messages can be
// threaded — a webhook can't return a message id or reply in-thread), and falls
// back to a classic Incoming Webhook when no bot token is configured. With
// neither configured, every call is a silent no-op.
//
//   SLACK_BOT_TOKEN + SLACK_CHANNEL_ID  → chat.postMessage, threading supported
//   SLACK_WEBHOOK_URL                    → webhook, flat messages only
//
// The bot user needs chat:write for its channel (chat:write.public covers any
// public channel without an invite).

const CHAT_POST_MESSAGE = "https://slack.com/api/chat.postMessage";

/**
 * Post a message to the configured channel. Pass `threadTs` to reply in-thread
 * (only honoured on the bot-token path).
 *
 * Returns:
 *  - `{ ts }`      posted via bot token; `ts` is the message id (a future `threadTs`)
 *  - `{ ts: null }` posted via webhook; no id available, so not threadable
 *  - `null`        not configured, or the post failed
 */
export async function postSlackMessage(
  text: string,
  threadTs?: string,
): Promise<{ ts: string | null } | null> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;

  if (token && channel) {
    try {
      const res = await fetch(CHAT_POST_MESSAGE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel,
          text,
          ...(threadTs ? { thread_ts: threadTs } : {}),
          unfurl_links: false,
          unfurl_media: false,
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        ts?: string;
        error?: string;
      };
      if (!data.ok) {
        console.error("Slack chat.postMessage failed:", data.error);
        return null;
      }
      return { ts: data.ts ?? null };
    } catch (err) {
      console.error("Slack post error", err);
      return null;
    }
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return null;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    return res.ok ? { ts: null } : null; // posted, but webhooks carry no message id
  } catch (err) {
    console.error("Slack webhook post error", err);
    return null;
  }
}

/** A Slack message `ts` looks like "1701234567.123456". */
export function isSlackTs(x: unknown): x is string {
  return typeof x === "string" && /^\d{10}\.\d{2,}$/.test(x);
}
