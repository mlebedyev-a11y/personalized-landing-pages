import type { Finding as FindingType } from "@/lib/types";
import { CATEGORY_STYLES } from "@/lib/taxonomy";

const CATEGORY_LABEL: Record<string, string> = {
  capacity: "Capacity",
  foresight: "Foresight",
  variability: "Variability",
  priority: "Priority",
  knowledge: "Knowledge",
  integration: "Integration",
};

export function Finding({
  index,
  finding,
  responseAlreadyShown,
}: {
  index: number;
  finding: FindingType;
  responseAlreadyShown: boolean;
}) {
  const response = finding.response;
  const style = CATEGORY_STYLES[finding.category];
  const Icon = style.icon;

  return (
    <div
      className="rounded-[8px] border p-6"
      style={{
        backgroundColor: style.tint,
        borderColor: style.ring,
        borderLeft: `4px solid ${style.color}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-8 w-8 flex-none items-center justify-center rounded-full font-mono text-xs font-medium text-white"
          style={{ backgroundColor: style.color }}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider"
          style={{ color: style.color, borderColor: style.ring, backgroundColor: "rgba(255,255,255,0.55)" }}
        >
          <Icon size={12} strokeWidth={2.25} />
          {CATEGORY_LABEL[finding.category] ?? finding.category}
        </span>
      </div>

      <h3 className="mt-3.5 text-xl font-medium leading-snug text-foreground">{finding.name}</h3>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[var(--ink-dim)]">{finding.symptom}</p>

      {response && !responseAlreadyShown && (
        <div className="mt-5 rounded-[6px] border bg-white px-5 py-4" style={{ borderColor: style.ring }}>
          <p
            className="font-mono text-[11px] font-medium uppercase tracking-wide"
            style={{ color: style.color }}
          >
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
          style={{ color: style.color, backgroundColor: "rgba(255,255,255,0.6)" }}
        >
          Response — {response.name}, above
        </p>
      )}
    </div>
  );
}
