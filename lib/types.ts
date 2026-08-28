import type { CaseStudy, Category, Product } from "@/data/content-kb";

export interface Finding {
  id: string;
  name: string;
  symptom: string;
  response: Product | null;
  category: Category;
}

export interface PlatformOverviewEntry {
  product: Product;
  tier: "primary" | "relevant" | "adjacent";
  note: string;
}

export interface Brief {
  slug: string;
  referenceId: string;
  name: string;
  firstName: string;
  title: string;
  company: string;
  linkedinUrl: string | null;
  persona: {
    id: string;
    name: string;
    leadMessage: string;
    trigger: string;
  };
  segment: { id: string; name: string } | null;
  isGeneralFallback: boolean;
  isResearchedAccount: boolean;
  whyNow: string | null;
  findings: Finding[];
  platformOverview: PlatformOverviewEntry[];
  caseStudy: CaseStudy;
  caseStudyFraming: string | null;
  coreValueProp: { oneLiner: string; fourLines: string[] };
  generatedAt: string;
}
