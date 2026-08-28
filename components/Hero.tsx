import { Zap, RefreshCw, Workflow, Award, type LucideIcon } from "lucide-react";
import { LOGO_SVG } from "@/lib/brand";
import type { Brief } from "@/lib/types";

const VALUE_ICONS: LucideIcon[] = [Zap, RefreshCw, Workflow, Award];

function splitLine(line: string): { label: string; detail: string } {
  const parts = line.split(" — ");
  return parts.length > 1
    ? { label: parts[0], detail: parts.slice(1).join(" — ") }
    : { label: line, detail: "" };
}

export function Hero({ brief }: { brief: Brief }) {
  const generatedDate = new Date(brief.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const primaryTrigger = brief.persona.trigger.split(",")[0].trim();

  return (
    <header className="relative overflow-hidden bg-background">
      {/* Decorative gradient backdrop, purely atmospheric */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[28rem] w-[28rem] rounded-full opacity-[0.14] blur-3xl"
        style={{ background: "radial-gradient(circle, #4164FF 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-24 h-80 w-80 rounded-full opacity-[0.10] blur-3xl"
        style={{ background: "radial-gradient(circle, #131E4C 0%, transparent 70%)" }}
      />

      {/* Letterhead */}
      <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <div className="h-4 w-[100px] text-foreground" dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
        <div className="text-right font-mono text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
          <div>Ref. {brief.referenceId}</div>
          <div>{generatedDate}</div>
        </div>
      </div>
      <div className="relative border-t border-line" />

      <div className="relative mx-auto max-w-3xl px-6 pb-14 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-brand-primary">
          Prepared for
        </p>
        <p className="mt-2 text-lg text-foreground">
          <span className="font-medium">{brief.name}</span>
          <span className="text-[var(--ink-dim)]"> — {brief.title}, {brief.company}</span>
        </p>

        <h1 className="mt-6 max-w-2xl text-[2.5rem] font-medium leading-[1.08] tracking-tight text-foreground sm:text-5xl">
          {brief.persona.leadMessage}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--ink-dim)]">
            {brief.persona.name}
          </span>
          <span className="border border-line px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-[var(--ink-dim)]">
            Trigger: {primaryTrigger}
          </span>
        </div>

        <p className="mt-6 max-w-xl text-base leading-7 text-[var(--ink-dim)]">
          {brief.coreValueProp.oneLiner}
        </p>

        {brief.whyNow && (
          <div className="mt-8 max-w-xl border-l-2 border-brand-link pl-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-brand-link">Why now</p>
            <p className="mt-1.5 text-[15px] leading-7 text-foreground">{brief.whyNow}</p>
          </div>
        )}
      </div>

      {/* Four-line value strip */}
      <div className="relative border-y border-line bg-brand-secondary/40">
        <div className="mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {brief.coreValueProp.fourLines.map((line, i) => {
            const { label, detail } = splitLine(line);
            const Icon = VALUE_ICONS[i] ?? Zap;
            return (
              <div
                key={i}
                className="border-line px-6 py-6 [&:not(:last-child)]:border-b lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Icon size={16} strokeWidth={2} className="text-brand-primary" />
                </div>
                <p className="mt-3 text-sm font-medium leading-snug text-foreground">{label}</p>
                {detail && (
                  <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-dim)]">{detail}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
