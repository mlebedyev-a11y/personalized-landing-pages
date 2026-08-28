import type { Finding as FindingType } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/taxonomy";

export function Finding({
  index,
  finding,
  responseAlreadyShown,
}: {
  index: number;
  finding: FindingType;
  responseAlreadyShown: boolean;
}) {
  const refCode = finding.id.toUpperCase().replace(/-/g, "·");
  const response = finding.response;
  const style = CATEGORY_STYLES[finding.category];
  const Icon = style.icon;

  return (
    <div className={index > 0 ? "border-t border-line pt-10" : ""}>
      <div className="grid gap-5 sm:grid-cols-[3.25rem_1fr]">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-full"
          style={{ backgroundColor: style.tint }}
        >
          <Icon size={20} strokeWidth={2} style={{ color: style.color }} />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">
            Ref. {refCode}
          </p>
          <h3 className="mt-1 text-xl font-medium leading-snug text-foreground">{finding.name}</h3>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--ink-dim)]">{finding.symptom}</p>

          {response && !responseAlreadyShown && (
            <div
              className="mt-5 rounded-[6px] border pl-4 pr-5 py-4"
              style={{ borderColor: style.ring, backgroundColor: style.tint }}
            >
              <p className="font-mono text-[11px] font-medium uppercase tracking-wide" style={{ color: style.color }}>
                Response — {response.name}
              </p>
              <p className="mt-1.5 text-[15px] leading-7 text-foreground">{response.value}</p>
              {response.proof && (
                <p className="mt-2 font-mono text-[13px] text-[var(--ink-dim)]">{response.proof}</p>
              )}
            </div>
          )}

          {response && responseAlreadyShown && (
            <p
              className="mt-5 inline-block rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wide"
              style={{ color: style.color, backgroundColor: style.tint }}
            >
              Response — {response.name}, above
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
