"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import type { FlexiMessage } from "@/lib/flexi";

const MAX_USER_TURNS = 15;
const CAP_NOTICE =
  "That's a good place to pick this up with the team — reply to the email this page came from and they'll take it from here.";

type Props = { slug: string; firstName: string; company: string };

export function FlexiWidget({ slug, firstName, company }: Props) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<FlexiMessage[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = window.sessionStorage.getItem(`flexciton:flexi:${slug}`);
      if (saved) return JSON.parse(saved) as FlexiMessage[];
    } catch {
      /* sessionStorage unavailable — start fresh */
    }
    return [];
  });
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const storageKey = `flexciton:flexi:${slug}`;

  const greeting = useMemo(
    () =>
      `Hi ${firstName} — I'm Flexi. Ask me anything about how Flexciton would work for ${company}.`,
    [firstName, company],
  );

  // Persist transcript.
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages, storageKey]);

  // Keep pinned to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  const userTurns = messages.filter((m) => m.role === "user").length;
  const atCap = userTurns >= MAX_USER_TURNS;

  async function send() {
    const text = draft.trim();
    if (!text || streaming || atCap) return;

    const next: FlexiMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setDraft("");
    setError(null);
    setStreaming(true);

    try {
      const res = await fetch("/api/flexi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, messages: next }),
      });

      if (!res.ok || !res.body) {
        setError(
          res.status === 429
            ? "You've sent a lot of messages in a short window. Give it a few minutes."
            : res.status === 503
              ? "Flexi isn't available right now. Reply to the email this page came from and the team will help."
              : "Something went wrong. Try again in a moment.",
        );
        setStreaming(false);
        return;
      }

      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = m.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            content: copy[copy.length - 1].content + chunk,
          };
          return copy;
        });
      }
    } catch {
      setError("Connection dropped before I could finish. Try again.");
    } finally {
      setStreaming(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const shown: Array<FlexiMessage & { key: string }> = [
    { role: "assistant", content: greeting, key: "greeting" },
    ...messages.map((m, i) => ({ ...m, key: String(i) })),
  ];

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close Flexi" : "Ask Flexi"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-link text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
        style={{ boxShadow: "0 8px 30px rgba(19,30,76,0.35)" }}
      >
        {open ? (
          <X size={22} strokeWidth={2} />
        ) : (
          <span className="relative">
            <MessageCircle size={24} strokeWidth={2} />
            <span
              className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-brand-link"
              style={{ backgroundColor: "#00d4c8" }}
            />
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[80vh] flex-col overflow-hidden border border-line bg-background shadow-2xl sm:inset-x-auto sm:bottom-24 sm:right-5 sm:max-h-[70vh] sm:w-[380px] sm:rounded-[6px]"
          style={{ boxShadow: "0 20px 60px rgba(19,30,76,0.28)" }}
          role="dialog"
          aria-label="Flexi chat"
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 text-white"
            style={{ background: "linear-gradient(160deg, #0d1738 0%, #1a2c66 100%)" }}
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Sparkles size={14} strokeWidth={2} style={{ color: "#5ff0e6" }} />
                Flexi
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-white/55">
                Flexciton assistant
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="rounded-[2px] p-1 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {shown.map((m) => (
              <div
                key={m.key}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-[8px] rounded-br-[2px] bg-brand-primary px-3.5 py-2 text-[13.5px] leading-6 text-white"
                      : "max-w-[88%] whitespace-pre-wrap rounded-[8px] rounded-bl-[2px] bg-brand-secondary px-3.5 py-2 text-[13.5px] leading-6 text-foreground"
                  }
                >
                  {m.content || (streaming ? "…" : "")}
                </div>
              </div>
            ))}
            {error && (
              <p className="rounded-[4px] bg-[#fdecec] px-3 py-2 text-[12.5px] leading-5 text-[#a12626]">
                {error}
              </p>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-line px-3 py-3">
            {atCap ? (
              <p className="px-1 py-1 text-[12.5px] leading-5 text-[var(--ink-dim)]">
                {CAP_NOTICE}
              </p>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask about Flexciton…"
                  disabled={streaming}
                  className="max-h-28 flex-1 resize-none rounded-[4px] border border-line bg-background px-3 py-2 text-[13.5px] leading-6 text-foreground outline-none focus:border-brand-primary disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={streaming || !draft.trim()}
                  aria-label="Send"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-[4px] bg-brand-link text-white disabled:opacity-40"
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </div>
            )}
            <p className="mt-2 px-1 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-faint)]">
              Grounded in the Flexciton knowledge base
            </p>
          </div>
        </div>
      )}
    </>
  );
}
