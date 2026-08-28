import Link from "next/link";
import { getAllSlugs, getBrief } from "@/lib/leads";

export default function Home() {
  const leads = getAllSlugs()
    .map((slug) => getBrief(slug))
    .filter((b) => b !== null);

  return (
    <main className="mx-auto max-w-2xl flex-1 px-6 py-16">
      <h1 className="text-2xl font-semibold text-foreground">Personalized pages</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Internal index — not linked from any generated page. Grab a URL below to send to a
        prospect.
      </p>
      <ul className="mt-8 divide-y divide-brand-secondary">
        {leads.map((lead) => (
          <li key={lead.slug} className="py-4">
            <Link href={`/l/${lead.slug}`} className="font-medium text-brand-link underline">
              /l/{lead.slug}
            </Link>
            <p className="mt-1 text-sm text-foreground/70">
              {lead.name} — {lead.title}, {lead.company}
            </p>
          </li>
        ))}
        {leads.length === 0 && (
          <li className="py-4 text-sm text-foreground/60">
            No pages generated yet. Run <code>npm run match</code> after adding leads to{" "}
            <code>leads.csv</code>.
          </li>
        )}
      </ul>
    </main>
  );
}
