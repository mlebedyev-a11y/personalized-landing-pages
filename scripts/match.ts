// Reads ../leads.csv, matches each lead to a persona/segment/findings/case-study
// using data/content-kb.ts (and data/accounts.ts for researched account overrides),
// and writes one content brief per lead to data/generated/<slug>.json.
// Run with: npm run match

import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import {
  PAINS,
  PRODUCTS,
  PERSONAS,
  SEGMENTS,
  CASE_STUDIES,
  CORE_VALUE_PROP,
  type Pain,
  type Product,
  type CaseStudy,
  type Category,
} from "../data/content-kb";
import { findAccountContext } from "../data/accounts";

const ROOT = path.resolve(__dirname, "..", "..");
const LEADS_CSV = path.join(ROOT, "leads.csv");
const GENERATED_DIR = path.resolve(__dirname, "..", "data", "generated");

interface LeadRow {
  name: string;
  title: string;
  company: string;
  linkedin_url?: string;
  segment_override?: string;
  case_study_override?: string;
  slug?: string;
}

interface Finding {
  id: string;
  name: string;
  symptom: string;
  response: Product | null;
  category: Category;
}

interface PlatformOverviewEntry {
  product: Product;
  tier: "primary" | "relevant" | "adjacent";
  note: string;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

// A short, doc-reference-looking id for the dossier letterhead, e.g. "FLX-260826-BSP".
function buildReferenceId(slug: string, generatedAt: string): string {
  const date = generatedAt.slice(2, 10).replace(/-/g, "");
  const initials = slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  return `FLX-${date}-${initials}`;
}

function matchPersona(title: string) {
  const t = title.toLowerCase();
  for (const persona of PERSONAS) {
    if (persona.id === "general") continue;
    if (persona.titleKeywords.some((kw) => t.includes(kw))) {
      return persona;
    }
  }
  return PERSONAS.find((p) => p.id === "general")!;
}

function matchSegment(company: string, override?: string) {
  if (override) {
    const bySlug = SEGMENTS.find((s) => s.id === override || slugify(s.name) === slugify(override));
    if (bySlug) return bySlug;
  }
  const c = company.toLowerCase();
  for (const segment of SEGMENTS) {
    if (segment.companyKeywords.some((kw) => c.includes(kw))) {
      return segment;
    }
  }
  return null;
}

function selectPains(personaId: string, count = 3): Pain[] {
  const persona = PERSONAS.find((p) => p.id === personaId)!;
  const ranked = persona.painIds
    .map((id) => PAINS.find((p) => p.id === id))
    .filter((p): p is Pain => Boolean(p));
  return ranked.slice(0, count);
}

function productForPain(pain: Pain): Product | null {
  return PRODUCTS.find((p) => p.painIds.includes(pain.id)) ?? null;
}

function scoreCaseStudy(cs: CaseStudy, segmentId: string | null, personaId: string, painIds: string[]): number {
  let score = 0;
  if (segmentId && cs.segmentIds.includes(segmentId)) score += 10;
  if (cs.personaIds.includes(personaId)) score += 5;
  score += cs.painIds.filter((id) => painIds.includes(id)).length * 2;
  return score;
}

function selectCaseStudy(
  segmentId: string | null,
  personaId: string,
  painIds: string[],
  override?: string
): CaseStudy {
  if (override) {
    const forced = CASE_STUDIES.find(
      (cs) => cs.id === override || slugify(cs.company) === slugify(override)
    );
    if (forced) return forced;
  }
  let best = CASE_STUDIES[0];
  let bestScore = -1;
  for (const cs of CASE_STUDIES) {
    const score = scoreCaseStudy(cs, segmentId, personaId, painIds);
    if (score > bestScore) {
      bestScore = score;
      best = cs;
    }
  }
  // No meaningful overlap at all -> fall back to the flagship platform reference.
  if (bestScore <= 0) {
    return CASE_STUDIES.find((cs) => cs.id === "seagate")!;
  }
  return best;
}

function main() {
  const csvRaw = fs.readFileSync(LEADS_CSV, "utf-8");
  const parsed = Papa.parse<LeadRow>(csvRaw, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
    transform: (v) => v.trim(),
  });
  if (parsed.errors.length) {
    console.error("CSV parse errors:", parsed.errors);
  }

  fs.mkdirSync(GENERATED_DIR, { recursive: true });

  const outRows: LeadRow[] = [];

  for (const row of parsed.data) {
    if (!row.name || !row.title || !row.company) continue;

    const persona = matchPersona(row.title);
    const segment = matchSegment(row.company, row.segment_override);
    const accountContext = findAccountContext(row.company);

    let findings: Finding[];
    let heroLeadMessage = persona.leadMessage;
    let whyNow: string | null = null;
    let caseStudy: CaseStudy;
    let caseStudyFraming: string | null = null;
    let platformOverview: PlatformOverviewEntry[];

    if (accountContext) {
      findings = accountContext.findings.map((f) => ({
        id: f.id,
        name: f.name,
        symptom: f.symptom,
        response: PRODUCTS.find((p) => p.id === f.responseProductId) ?? null,
        category: f.category,
      }));
      heroLeadMessage = accountContext.heroLeadMessage;
      whyNow = accountContext.whyNow;
      caseStudy = row.case_study_override
        ? selectCaseStudy(segment?.id ?? null, persona.id, [], row.case_study_override)
        : CASE_STUDIES.find((cs) => cs.id === accountContext.caseStudyId) ?? CASE_STUDIES[0];
      caseStudyFraming = accountContext.caseStudyFraming;
      platformOverview = PRODUCTS.map((product) => {
        const rel = accountContext.productRelevance[product.id];
        return { product, tier: rel?.tier ?? "adjacent", note: rel?.note ?? product.buyWhen };
      });
    } else {
      const pains = selectPains(persona.id);
      findings = pains.map((pain) => ({
        id: pain.id,
        name: pain.name,
        symptom: pain.symptom,
        response: productForPain(pain),
        category: pain.category,
      }));
      caseStudy = selectCaseStudy(
        segment?.id ?? null,
        persona.id,
        pains.map((p) => p.id),
        row.case_study_override
      );
      const primaryProductIds = new Set(findings.map((f) => f.response?.id).filter(Boolean));
      platformOverview = PRODUCTS.map((product) => {
        const isPrimary = primaryProductIds.has(product.id);
        const isRelevant = product.painIds.some((id) => persona.painIds.includes(id));
        return {
          product,
          tier: isPrimary ? "primary" : isRelevant ? "relevant" : "adjacent",
          note: product.buyWhen,
        } as PlatformOverviewEntry;
      });
    }

    const slug = row.slug?.trim() || slugify(`${row.company}-${firstName(row.name)}`);
    const generatedAt = new Date().toISOString();
    const referenceId = buildReferenceId(slug, generatedAt);

    const brief = {
      slug,
      referenceId,
      name: row.name.trim(),
      firstName: firstName(row.name),
      title: row.title.trim(),
      company: row.company.trim(),
      linkedinUrl: row.linkedin_url?.trim() || null,
      persona: {
        id: persona.id,
        name: persona.name,
        leadMessage: heroLeadMessage,
        trigger: persona.trigger,
      },
      segment: segment ? { id: segment.id, name: segment.name } : null,
      isGeneralFallback: persona.id === "general",
      isResearchedAccount: Boolean(accountContext),
      whyNow,
      findings,
      platformOverview,
      caseStudy,
      caseStudyFraming,
      coreValueProp: CORE_VALUE_PROP,
      generatedAt,
    };

    fs.writeFileSync(
      path.join(GENERATED_DIR, `${slug}.json`),
      JSON.stringify(brief, null, 2) + "\n"
    );

    console.log(
      `✔ ${row.name} (${row.title} @ ${row.company}) -> persona=${persona.id} segment=${
        segment?.id ?? "none"
      } account=${accountContext ? "researched" : "generic"} caseStudy=${caseStudy.id} -> /l/${slug}`
    );

    outRows.push({ ...row, slug });
  }

  // Write the resolved slug back into leads.csv so the same lead always maps to the same URL.
  const csvOut = Papa.unparse(outRows, { columns: parsed.meta.fields, newline: "\n" });
  fs.writeFileSync(LEADS_CSV, csvOut + "\n");
}

main();
