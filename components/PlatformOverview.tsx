import type { PlatformOverviewEntry } from "@/lib/types";
import { PRODUCT_ICONS } from "@/lib/taxonomy";

const TIER_STYLE: Record<PlatformOverviewEntry["tier"], { label: string; bg: string; fg: string }> = {
  primary: { label: "Primary fit", bg: "#4164FF", fg: "#FFFFFF" },
  relevant: { label: "Relevant next", bg: "#ECEFFF", fg: "#131E4C" },
  adjacent: { label: "Platform context", bg: "#F1F4F7", fg: "#64748B" },
};

export function PlatformOverview({ entries, company }: { entries: PlatformOverviewEntry[]; company: string }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <p className="font-mono text-[11px] uppercase tracking-widest text-brand-primary">
        The full platform
      </p>
      <h2 className="mt-2 max-w-xl text-2xl font-medium leading-snug text-foreground">
        Every Flexciton product, ranked for {company}
      </h2>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--ink-dim)]">
        Flexciton is a closed-loop stack, not a single tool. Here is where each layer stands
        relative to what {company} needs today.
      </p>

      <div className="mt-8 divide-y divide-line border-t border-line">
        {entries.map(({ product, tier, note }) => {
          const Icon = PRODUCT_ICONS[product.id];
          const tierStyle = TIER_STYLE[tier];
          return (
            <div
              key={product.id}
              className="grid gap-3 py-5 transition-colors hover:bg-brand-secondary/25 sm:grid-cols-[13rem_1fr] sm:gap-6 sm:rounded-[6px] sm:px-3 sm:-mx-3"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-brand-secondary">
                  {Icon && <Icon size={16} strokeWidth={2} className="text-brand-link" />}
                </div>
                <div>
                  <p className="text-[15px] font-medium text-foreground">{product.name}</p>
                  <span
                    className="mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest"
                    style={{ backgroundColor: tierStyle.bg, color: tierStyle.fg }}
                  >
                    {tierStyle.label}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm leading-6 text-[var(--ink-dim)]">{product.value}</p>
                <p className="mt-1.5 text-sm leading-6 text-foreground">{note}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
