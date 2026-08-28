import type { CaseStudy } from "@/data/content-kb";

export function ProofBand({
  caseStudy,
  framing,
}: {
  caseStudy: CaseStudy;
  framing?: string | null;
}) {
  return (
    <div className="relative overflow-hidden bg-brand-link">
      {/* Decorative glow, purely atmospheric */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(circle, #4164FF 0%, transparent 70%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, #00D4C8 0%, transparent 70%)" }}
      />

      <div className="relative mx-auto max-w-3xl px-6 py-16 text-white">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#8FA0FF]">
          Proof, at a peer fab
        </p>
        <h2 className="mt-2 text-2xl font-medium leading-snug sm:text-3xl">{caseStudy.company}</h2>
        {framing && <p className="mt-3 max-w-2xl text-[13px] italic leading-6 text-white/50">{framing}</p>}
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-white/70">{caseStudy.headline}</p>

        {caseStudy.stats.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {caseStudy.stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-[6px] border border-white/10 bg-white/[0.06] px-4 py-4 backdrop-blur-sm"
              >
                <p className="font-mono text-2xl font-medium text-[#5FF0E6] sm:text-[1.75rem]">{stat.value}</p>
                <p className="mt-1 text-xs leading-snug text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {caseStudy.quote && (
          <blockquote className="mt-10 border-l-2 border-[#8FA0FF] pl-5 text-[15px] italic leading-7 text-white/80">
            &ldquo;{caseStudy.quote}&rdquo;
            {caseStudy.quoteAttribution && (
              <footer className="mt-3 font-mono text-xs not-italic uppercase tracking-wide text-white/50">
                {caseStudy.quoteAttribution}
              </footer>
            )}
          </blockquote>
        )}
      </div>
    </div>
  );
}
