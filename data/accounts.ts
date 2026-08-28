// Account-level research overrides — used when generic title-keyword persona matching
// would produce a technically-wrong pitch (e.g. assuming an existing legacy-scheduled
// fab for a company that hasn't finished building its first one yet).
//
// Researched via web search (blacksemi.com, SemiWiki CEO interview, Aug 2026). Facts used:
// - Black Semiconductor: German deep-tech startup (f. 2020), ~140 people, building FabONE —
//   the first 300mm facility integrating graphene photonics + electronics in one flow.
// - FabONE cleanroom construction underway; tool move-in begins H2 2026; pilot production
//   targeted early 2027; volume production targeted 2029.
// - Acquired Applied Nanolayers (Netherlands, "BNL") in March 2025 — an existing 200mm
//   industrial graphene line currently running demo-wafer runs that feed process learning
//   into the FabONE ramp.
// - No prior fab of this kind exists anywhere, so there is no legacy scheduler to displace
//   and no industry-standard capacity model to inherit.

import type { Category } from "./content-kb";

export interface AccountFinding {
  id: string;
  name: string;
  symptom: string;
  responseProductId: string;
  category: Category;
}

export interface ProductRelevance {
  tier: "primary" | "relevant" | "adjacent";
  note: string;
}

export interface AccountContext {
  companyMatchKeywords: string[];
  heroLeadMessage: string;
  whyNow: string;
  findings: AccountFinding[];
  caseStudyId: string;
  caseStudyFraming: string;
  productRelevance: Record<string, ProductRelevance>;
}

export const ACCOUNT_CONTEXTS: AccountContext[] = [
  {
    companyMatchKeywords: ["black semiconductor"],
    heroLeadMessage:
      "Model FabONE's ramp — pilot in 2027, volume in 2029 — before the automation stack around it has finished being built.",
    whyNow:
      "FabONE's cleanroom build is underway and tool move-in begins in the second half of 2026 — the capacity and scheduling model built alongside that installation is the one every ramp decision through 2029 gets measured against.",
    findings: [
      {
        id: "ramp-with-no-precedent",
        name: "A ramp with no industry precedent to plan against",
        symptom:
          "FabONE is the first 300mm facility built to integrate graphene photonics and electronics in a single production flow. There is no existing capacity model to inherit — the plan for 2027 pilot output and 2029 volume production has to be built from first principles, years before the tools for full-scale production are even ordered.",
        responseProductId: "flex-capacitor",
        category: "capacity",
      },
      {
        id: "commissioning-bottlenecks",
        name: "Bottlenecks discovered during commissioning, not before it",
        symptom:
          "As tool move-in begins and FabONE moves from cleanroom construction into demonstration and pilot runs, dozens of new process steps — CVD growth, epitaxial transfer, interface engineering, dielectric capping — are being characterized at once. Finding out which one is the constraint after it stalls a run costs a commissioning cycle the team doesn't have to spare.",
        responseProductId: "spotlight",
        category: "foresight",
      },
      {
        id: "inherent-high-mix",
        name: "High mix before \"production\" has even started",
        symptom:
          "Every pilot lot through a first-of-kind graphene process line is, in effect, a new product introduction. Recipes are still being tuned as the 200mm demo line at Black Semiconductor Netherlands feeds learning into the 300mm pilot at FabONE. A scheduler built for steady-state, low-mix operation fights this from day one.",
        responseProductId: "flex-local",
        category: "variability",
      },
      {
        id: "shifting-priorities-during-bringup",
        name: "Priorities that change faster than a rules engine can be retuned",
        symptom:
          "Commissioning yield, pilot throughput, and early customer-sample timelines can each be the top priority in the same month during a fab bring-up. Encoding that trade-off in static rules means retuning them every time the priority shifts.",
        responseProductId: "autotune",
        category: "priority",
      },
    ],
    caseStudyId: "200mm-foundry",
    caseStudyFraming:
      "No fab has run this process before, so there's no exact precedent — the closest available proof point is the pattern of proving capacity impact fast, at small scale, before a full commitment.",
    productRelevance: {
      "flex-capacitor": {
        tier: "primary",
        note: "The multi-year, first-principles scenario model for the 2027 → 2029 ramp.",
      },
      spotlight: {
        tier: "primary",
        note: "Forward-looking constraint visibility during tool move-in and commissioning, with a 4-day setup that doesn't compete for a stretched team's time.",
      },
      "flex-local": {
        tier: "primary",
        note: "Absorbs the recipe-by-recipe variability of a process still being characterized, without a rules rebuild each time.",
      },
      autotune: {
        tier: "primary",
        note: "Re-weights commissioning yield vs. pilot throughput vs. customer-sample timelines as priorities shift, with no code.",
      },
      "flex-planner": {
        tier: "relevant",
        note: "Becomes the daily wafer-starts layer once FabONE is drawing on committed demand rather than demo and pilot runs alone.",
      },
      "flex-global": {
        tier: "adjacent",
        note: "Matters once FabONE has more than one interacting bottleneck area to coordinate fab-wide — a post-pilot concern.",
      },
      "flex-aps": {
        tier: "adjacent",
        note: "Not relevant today — FabONE is a frontend wafer facility; this applies to backend assembly, test, and packaging operations.",
      },
    },
  },
];

export function findAccountContext(company: string): AccountContext | null {
  const c = company.toLowerCase();
  return ACCOUNT_CONTEXTS.find((ctx) => ctx.companyMatchKeywords.some((kw) => c.includes(kw))) ?? null;
}
