import { Zap, RefreshCw, Workflow, Award, type LucideIcon } from "lucide-react";
import { LOGO_SVG } from "@/lib/brand";
import type { Brief } from "@/lib/types";

const VALUE_ICONS: LucideIcon[] = [Zap, RefreshCw, Workflow, Award];
// One accent per value-strip card — echoes the finding-category palette.
const STRIP_ACCENTS = ["#4164FF", "#0D9488", "#7C3AED", "#B45309"];

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
    <header className="relative overflow-hidden text-white">
      {/* Coloured gradient panel */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #0d1738 0%, #1a2c66 42%, #2f4bd1 100%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-48 h-[28rem] w-[28rem] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, #5b78ff 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -bottom-40 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #00d4c8 0%, transparent 70%)" }}
      />

      {/* Letterhead */}
      <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <div className="h-4 w-[100px] text-white" dangerouslySetInnerHTML={{ __html: LOGO_SVG }} />
        <div className="text-right font-mono text-[11px] uppercase tracking-widest text-white/60">
          <div>Ref. {brief.referenceId}</div>
          <div>{generatedDate}</div>
        </div>
      </div>
      <div className="relative border-t border-white/15" />

      <div className="relative mx-auto max-w-3xl px-6 pb-14 pt-10">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-[#9fb2ff]">
          Prepared for
        </p>
        <p className="mt-2 text-lg">
          <span className="font-semibold">{brief.name}</span>
          <span className="text-white/70"> — {brief.title}, {brief.company}</span>
        </p>

        <h1 className="mt-6 max-w-2xl text-[2.5rem] font-medium leading-[1.08] tracking-tight sm:text-5xl">
          {brief.persona.leadMessage}
        </h1>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-[2px] border border-white/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white/85">
            {brief.persona.name}
          </span>
          <span className="rounded-[2px] border border-white/25 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide text-white/85">
            Trigger: {primaryTrigger}
          </span>
        </div>

        <p className="mt-6 max-w-xl text-base leading-7 text-white/75">
          {brief.coreValueProp.oneLiner}
        </p>

        {brief.whyNow && (
          <div className="mt-8 max-w-xl border-l-2 pl-4" style={{ borderColor: "#00d4c8" }}>
            <p className="font-mono text-[11px] uppercase tracking-widest" style={{ color: "#5ff0e6" }}>
              Why now
            </p>
            <p className="mt-1.5 text-[15px] leading-7 text-white">{brief.whyNow}</p>
          </div>
        )}
      </div>

      {/* Four-line value strip */}
      <div className="relative border-t border-white/15 bg-white">
        <div className="mx-auto grid max-w-3xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {brief.coreValueProp.fourLines.map((line, i) => {
            const { label, detail } = splitLine(line);
            const Icon = VALUE_ICONS[i] ?? Zap;
            const accent = STRIP_ACCENTS[i % STRIP_ACCENTS.length];
            return (
              <div
                key={i}
                className="relative border-line px-6 py-6 [&:not(:last-child)]:border-b lg:[&:not(:last-child)]:border-b-0 lg:[&:not(:last-child)]:border-r"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-6 bottom-6 w-[3px] rounded-full"
                  style={{ backgroundColor: accent }}
                />
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${accent}1a` }}
                >
                  <Icon size={16} strokeWidth={2} style={{ color: accent }} />
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
