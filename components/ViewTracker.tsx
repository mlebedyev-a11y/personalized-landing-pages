"use client";

import { useEffect } from "react";

export function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    const key = `flexciton:notified:${slug}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    fetch("/api/notify-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
      keepalive: true,
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { ts?: string | null } | null) => {
        // Stash the Slack message id so Flexi Q&A from this visit threads under it.
        if (data?.ts) {
          try {
            sessionStorage.setItem(`flexciton:thread:${slug}`, data.ts);
          } catch {
            /* sessionStorage unavailable */
          }
        }
      })
      .catch(() => {
        // Best-effort notification; a failed Slack ping should never affect the page.
      });
  }, [slug]);

  return null;
}
