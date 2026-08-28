import { notFound } from "next/navigation";
import { getAllSlugs, getBrief } from "@/lib/leads";
import { Hero } from "@/components/Hero";
import { Finding } from "@/components/Finding";
import { PlatformOverview } from "@/components/PlatformOverview";
import { ProofBand } from "@/components/ProofBand";
import { ViewTracker } from "@/components/ViewTracker";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export default async function LeadPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brief = getBrief(slug);
  if (!brief) notFound();

  return (
    <main className="flex-1 bg-background">
      <ViewTracker slug={brief.slug} />
      <Hero brief={brief} />

      <section className="mx-auto max-w-3xl px-6 py-16">
        <p className="font-mono text-[11px] uppercase tracking-widest text-brand-primary">
          What we matched to your role
        </p>
        <h2 className="mt-2 max-w-xl text-2xl font-medium leading-snug text-foreground">
          {brief.findings.length} findings for a {brief.title.toLowerCase()} at {brief.company}
        </h2>

        <div className="mt-10 space-y-10">
          {(() => {
            const shownProductIds = new Set<string>();
            return brief.findings.map((finding, i) => {
              const responseAlreadyShown = finding.response ? shownProductIds.has(finding.response.id) : false;
              if (finding.response) shownProductIds.add(finding.response.id);
              return (
                <Finding
                  key={finding.id}
                  index={i}
                  finding={finding}
                  responseAlreadyShown={responseAlreadyShown}
                />
              );
            });
          })()}
        </div>
      </section>

      <PlatformOverview entries={brief.platformOverview} company={brief.company} />

      <ProofBand caseStudy={brief.caseStudy} framing={brief.caseStudyFraming} />

      <footer className="border-t border-line bg-background py-14">
        <div className="mx-auto max-w-3xl px-6">
          <p className="max-w-xl text-base leading-7 text-foreground">
            {brief.firstName}, if any of this reflects what {brief.company} is dealing with
            right now, reply to the email this page was linked from and we&apos;ll set up time
            to walk through it.
          </p>
          <div className="mt-8 flex items-center justify-between border-t border-line pt-6 font-mono text-[11px] uppercase tracking-widest text-[var(--ink-faint)]">
            <span>Flexciton</span>
            <span>{brief.referenceId}</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
