// Structured extract of ICP.md, Flexciton_Master_Knowledge_Base.md, and value prop.md.
// Hand-curated once so page generation is deterministic and doesn't need a runtime LLM call.
// Source of truth for any future edits is still the markdown docs in the project root.

export type Category = "capacity" | "foresight" | "variability" | "priority" | "knowledge" | "integration";

export interface Pain {
  id: string;
  name: string;
  symptom: string;
  value: string; // the Flexciton value/resolution
  proof: string;
  personaIds: string[];
  category: Category;
}

export interface Product {
  id: string;
  name: string;
  value: string;
  proof?: string;
  buyWhen: string;
  painIds: string[];
}

export interface CaseStudyStat {
  value: string;
  label: string;
}

export interface CaseStudy {
  id: string;
  company: string;
  segmentIds: string[];
  personaIds: string[];
  painIds: string[];
  headline: string;
  stats: CaseStudyStat[];
  quote?: string;
  quoteAttribution?: string;
  strategicRelevance: string;
}

export interface Persona {
  id: string;
  name: string;
  titleKeywords: string[];
  caresAbout: string[];
  fears: string[];
  leadMessage: string;
  trigger: string;
  painIds: string[];
}

export interface Segment {
  id: string;
  name: string;
  companyKeywords: string[];
}

export const CORE_VALUE_PROP = {
  oneLiner:
    "Flexciton turns the ~10% of fab capacity that legacy schedulers leave on the floor into output — without capex — by replacing rules-based dispatching with autonomous mathematical optimisation that adapts to your fab in real time.",
  fourLines: [
    "Capacity without capex — fabs find 6–9% additional throughput in their existing equipment within 12 months.",
    "Autonomous, not automated — the system adapts to tool downs, recipe changes, and mix shifts without IE intervention.",
    "Closed-loop planning to execution — business plan → wafer starts → fab-wide schedule → toolset schedule, all from one optimisation engine.",
    "Proven where it matters — Seagate Springtown, Western Digital, Renesas, Microchip, Diodes, Amkor, Nexperia, NXP.",
  ],
};

export const SEGMENTS: Segment[] = [
  { id: "tier1-idm", name: "Tier 1 IDM", companyKeywords: ["seagate", "western digital", "wd"] },
  {
    id: "power-compound-semi",
    name: "Power & compound semiconductor",
    companyKeywords: ["renesas", "nexperia"],
  },
  {
    id: "mid-size",
    name: "Mid-size / specialty IDM",
    companyKeywords: ["microchip", "diodes", "vishay", "onsemi"],
  },
  {
    id: "osat-backend",
    name: "OSAT / backend (assembly, test, packaging)",
    companyKeywords: ["amkor", "utac", "lumentum"],
  },
  {
    id: "foundry-legacy-fps",
    name: "Foundry running a legacy FPS-type scheduler",
    companyKeywords: ["nxp", "skywater"],
  },
  {
    id: "specialty-foundry",
    name: "Specialty foundry (200mm)",
    companyKeywords: ["tower semiconductor", "polar semiconductor", "semefab"],
  },
];

// Pain layer — value prop.md §4 (the messaging matrix), cross-referenced with Master KB §4.
export const PAINS: Pain[] = [
  {
    id: "capacity-on-floor",
    name: "Capacity left on the floor at ~100% utilisation",
    symptom:
      "The fab is utilised near 100% but customers are still asking for more capacity, and new tools are too expensive or too slow to install.",
    value: "6–9% fab-wide throughput uplift on the same equipment.",
    proof: "Seagate +6.5–8.7% fab-wide throughput; Western Digital ~+25% daily moves.",
    personaIds: ["vp-ops", "fab-gm"],
    category: "capacity",
  },
  {
    id: "otd-slipping",
    name: "OTD slipping under customer pressure",
    symptom:
      "Customers are escalating about delivery dates, and lateness is creeping up as quarter-end OTD commitments tighten.",
    value: "Variance reduction and predictable delivery.",
    proof: "Seagate −30% cycle time std dev, −10% late lots; 200mm foundry POC −14.6% lateness.",
    personaIds: ["vp-ops", "director-customer-ops", "director-planning"],
    category: "foresight",
  },
  {
    id: "manual-planning",
    name: "Manual, reactive planning consuming senior headcount",
    symptom:
      "Wafer starts planning is a multi-day, multi-person manual process every week, run out of spreadsheets by one to three senior planners.",
    value: "Days-long manual planning collapses to hours; plans regenerate every 45 minutes autonomously.",
    proof: "Skyworks pattern — multiple FTEs, weekend-long process eliminated.",
    personaIds: ["director-planning", "capacity-planning-manager"],
    category: "capacity",
  },
  {
    id: "ie-rules-treadmill",
    name: "IE rules-tuning treadmill",
    symptom:
      "Industrial Engineers spend most of their time tuning and retuning scheduler rules — every product introduction, tool down, or recipe change triggers another round.",
    value: "Zero rules. Define the objective; the optimiser absorbs recipe changes, tool downs, and new products.",
    proof: "A single furnace toolset can carry 1,500 rules — all removed.",
    personaIds: ["ie-manager", "director-ie", "automation-manager"],
    category: "variability",
  },
  {
    id: "late-bottlenecks",
    name: "Bottlenecks discovered after they hit production",
    symptom:
      "WIP backs up, the dashboard turns red, and the team scrambles to figure out which of five possible fixes actually moves the needle.",
    value: "Spotlight identifies bottlenecks 1–4 weeks ahead, quantifies each, and ranks the actions.",
    proof: "NXP: one flagged recipe qualification recovered ~0.2% of moves; bottleneck confirmed 3 days later.",
    personaIds: ["fab-gm", "ie-manager"],
    category: "foresight",
  },
  {
    id: "diffusion-timelink",
    name: "Timelink, batching, and queue-time conflict at diffusion",
    symptom:
      "The diffusion area is the chronic fab bottleneck; batching trade-offs are made on gut feel and timelink violations cause scrap and rework.",
    value: "Multi-objective optimisation resolves the three-way trade-off natively.",
    proof: "Renesas: −29% timelink violations, −22% number of batches, −11% queue time, −36% rework.",
    personaIds: ["process-engineering-manager", "ie-manager", "fab-gm"],
    category: "variability",
  },
  {
    id: "cross-shift-coordination",
    name: "Cross-shift, cross-team coordination failures",
    symptom:
      "Day shift sets priorities, night shift drifts, and the morning meeting wastes 20 minutes reconstructing what happened.",
    value: "One ranked action list across all teams, re-simulated as conditions change.",
    proof: "100+ daily users per fab post-Spotlight rollout.",
    personaIds: ["fab-gm"],
    category: "priority",
  },
  {
    id: "tribal-knowledge",
    name: "Tribal knowledge walking out the door",
    symptom:
      "A senior planner or IE leader is retiring or moving on with 15–30 years of fab knowledge encoded only in spreadsheets and in their head.",
    value: "The model becomes auditable, transferable, runnable, and persistent software.",
    proof: "Diodes / Vishay continuity-risk pattern.",
    personaIds: ["director-ie", "capacity-planning-manager"],
    category: "knowledge",
  },
  {
    id: "high-mix",
    name: "High product mix breaking the scheduler",
    symptom:
      "Mix is increasing and every new product requires a schedule rule update and a long change-and-test cycle before it runs efficiently.",
    value: "MILP treats recipe enablement and product attributes as constraints; new products absorbed automatically.",
    proof: "Higher mix actually shrinks the optimiser's search space.",
    personaIds: ["ie-manager", "director-planning", "process-engineering-manager"],
    category: "variability",
  },
  {
    id: "disruption-recovery",
    name: "Slow recovery from tool downs and mix shifts",
    symptom:
      "One tool goes offline, schedules need reworking by hand, and the rest of the fab feels the disruption for days.",
    value: "Re-optimises every 30 seconds to a few minutes; disruptions absorbed autonomously.",
    proof: "Spotlight recovery study: −10% queue time downstream, +38% faster lot recovery.",
    personaIds: ["ie-manager", "automation-manager"],
    category: "foresight",
  },
  {
    id: "mes-aps-scar-tissue",
    name: "Scar tissue from a failed MES/APS transition",
    symptom:
      "A previous APS or MES transition failed or under-delivered, and the team is skeptical of any new scheduling software.",
    value: "Purpose-built for semiconductor, modular, 4-day Spotlight setup vs. a multi-quarter failed APS.",
    proof: "Lumentum pattern — \"tools that were supposed to automate scheduling but created more manual work.\"",
    personaIds: ["vp-ops", "director-ie", "mes-it-manager"],
    category: "integration",
  },
  {
    id: "strategic-capacity-excel",
    name: "Strategic capacity questions answered in Excel",
    symptom:
      "A multi-million-dollar capex or scenario decision rests on a static capacity model built and maintained by one or two people in spreadsheets.",
    value: "Flex Capacitor: dynamic, tool-level scenario modelling in hours, not weeks, with an auditable trail.",
    proof: "AMS Osram conversion; 200mm foundry POC $6.8M annual revenue impact.",
    personaIds: ["vp-ops", "cfo", "director-planning"],
    category: "capacity",
  },
];

// value prop.md §7
export const PRODUCTS: Product[] = [
  {
    id: "flex-planner",
    name: "Flex Planner",
    value:
      "Translates ERP customer orders into accurate, capacity-constrained production plans; generates daily wafer starts and weekly schedules, refreshed every 45 minutes.",
    proof: "Seagate −30% cycle time std dev, −10% late lots, −10% cycle time during a ramp while WIP grew 16%.",
    buyWhen: "Manual wafer starts planning, ERP-to-fab disconnect, OTD-driven engagements.",
    painIds: ["manual-planning", "otd-slipping"],
  },
  {
    id: "flex-global",
    name: "Flex Global",
    value:
      "Schedules the whole fab 24 hours ahead and sets lot priorities for all toolsets, refreshed every 30 minutes, preventing a local fix from breaking flow elsewhere.",
    buyWhen: "Complex re-entrant flows, cross-area bottleneck migration, timelink coordination across the line.",
    painIds: ["late-bottlenecks", "cross-shift-coordination"],
  },
  {
    id: "flex-local",
    name: "Flex Local",
    value:
      "The autonomous toolset scheduler where the MILP engine does its heaviest lifting — batching, timelinks, changeovers, hot lots, monitor wafers, reticles — with minimal IE intervention.",
    proof:
      "Seagate lithography +9.4% throughput, deposition +10% throughput and +138% batch size; Renesas furnace −29% timelink violations.",
    buyWhen: "A specific chronic bottleneck area (diffusion, lithography) — prove it on one area, scale from there.",
    painIds: ["diffusion-timelink", "ie-rules-treadmill", "high-mix"],
  },
  {
    id: "spotlight",
    name: "Spotlight",
    value:
      "Surfaces upcoming production constraints 1–4 weeks before they hit the line, quantifies the impact of each, and recommends ranked, assignable actions. No scheduler replacement, 4-day setup.",
    proof:
      "NXP verification: one flagged recipe qualification recovered ~0.2% of moves. Aggregate: +8–10% throughput, +20–25% cycle time predictability, −30% manual interventions.",
    buyWhen:
      "Exploratory engagement, mid-size fab, morning-meeting/bottleneck-visibility pain, rebuilding credibility after a failed APS project.",
    painIds: ["late-bottlenecks", "disruption-recovery", "mes-aps-scar-tissue"],
  },
  {
    id: "autotune",
    name: "Autotune",
    value:
      "Managers set and adjust the trade-off weights between competing fab KPIs (cycle time vs. throughput) with no rules and no code.",
    buyWhen: "Strategic priority shifts such as quarter-end or a hot customer push.",
    painIds: ["cross-shift-coordination"],
  },
  {
    id: "flex-aps",
    name: "Flex APS",
    value:
      "The same optimisation engine repackaged for backend terminology and constraints — BoMs with hundreds of sub-parts, chained QTimers, multi-line scheduling, setup collisions.",
    buyWhen: "Backend / assembly, test, and advanced packaging sites still running Excel and rules.",
    painIds: ["ie-rules-treadmill", "manual-planning"],
  },
  {
    id: "flex-capacitor",
    name: "Flex Capacitor",
    value:
      "A capacity planning application that models the fab dynamically under real constraints, with AI-accelerated scenario creation and analysis.",
    proof: "AMS Osram conversion pattern; 200mm foundry POC $6.8M estimated annual revenue increase.",
    buyWhen: "Strategic capacity or capex decisions currently modelled in Excel by one or two planners.",
    painIds: ["strategic-capacity-excel", "tribal-knowledge"],
  },
];

// ICP.md §4 buyer personas
export const PERSONAS: Persona[] = [
  {
    id: "vp-ops",
    name: "VP Operations / VP Manufacturing",
    titleKeywords: [
      "vp operations",
      "vp of operations",
      "vice president of operations",
      "vp manufacturing",
      "vice president of manufacturing",
      "coo",
      "chief operating officer",
    ],
    caresAbout: [
      "capacity without capex",
      "OTD reliability",
      "capex protection",
      "quarterly commitments",
      "customer retention",
      "board-level defensibility of investment decisions",
    ],
    fears: [
      "customer escalation",
      "board capex pressure",
      "OTD slippage",
      "a multi-million-dollar capex decision that turns out wrong because the model behind it was a spreadsheet built by someone who has left",
    ],
    leadMessage: "Capacity without capex — the same equipment, 6–9% more throughput, no board-level capex ask.",
    trigger: "new leadership window, capacity ramp, OTD pressure, quarter-end stress, capacity expansion announcement",
    painIds: ["capacity-on-floor", "otd-slipping", "mes-aps-scar-tissue", "strategic-capacity-excel"],
  },
  {
    id: "fab-gm",
    name: "Fab GM / Managing Director",
    titleKeywords: [
      "fab gm",
      "general manager",
      "managing director",
      "site director",
      "site gm",
      "plant manager",
    ],
    caresAbout: [
      "site P&L and commitments",
      "talent retention",
      "plant continuity",
      "answering strategic questions from headquarters",
    ],
    fears: ["continuity risk", "site-level pressure from HQ"],
    leadMessage: "The fab that can model its own future is the fab that gets the next investment.",
    trigger: "new role (90–180 day window), site-level pressure",
    painIds: ["capacity-on-floor", "late-bottlenecks", "diffusion-timelink", "cross-shift-coordination"],
  },
  {
    id: "cfo",
    name: "CFO",
    titleKeywords: ["cfo", "chief financial officer"],
    caresAbout: ["capital allocation quality", "auditable decision trail", "payback modelling"],
    fears: ["a large capex decision made on an unauditable, single-person spreadsheet model"],
    leadMessage:
      "Flex Capacitor costs a fraction of a single poor capex decision, and less than the simulation tools it replaces.",
    trigger: "capex decision cycle, board scrutiny of capacity investment",
    painIds: ["strategic-capacity-excel"],
  },
  {
    id: "director-planning",
    name: "Director of Production Planning / Head of Capacity Planning",
    titleKeywords: [
      "director of production planning",
      "director of planning",
      "head of capacity planning",
      "head of production planning",
      "vp planning",
      "vp of planning",
    ],
    caresAbout: [
      "reducing manual planning effort",
      "OTD predictability",
      "improving the credibility of scenarios presented to leadership",
      "freeing senior planners for strategic work",
    ],
    fears: [
      "being asked a strategic question they cannot answer because the model takes two weeks to rebuild",
      "the capacity model becoming a single point of failure",
    ],
    leadMessage:
      "How long does it take to build a credible capacity scenario for a demand ramp? What if it happened the same afternoon the question was asked?",
    trigger: "wafer starts planning pain, ERP-to-fab disconnect, senior planner departure, demand ramp announcement",
    painIds: ["manual-planning", "otd-slipping", "high-mix", "strategic-capacity-excel"],
  },
  {
    id: "director-ie",
    name: "Director of Industrial Engineering / Operational Excellence",
    titleKeywords: [
      "director of industrial engineering",
      "director of ie",
      "operational excellence",
      "head of industrial engineering",
    ],
    caresAbout: [
      "IE productivity",
      "scheduler stability",
      "knowledge capture",
      "modernisation roadmap",
      "reducing person-dependent processes",
    ],
    fears: ["continuity risk", "legacy scheduler complaints"],
    leadMessage:
      "When was your capacity model last built from scratch? How much of it lives in one person's head?",
    trigger: "continuity risk, legacy scheduler complaints, smart manufacturing roadmap, IE modernisation initiative",
    painIds: ["tribal-knowledge", "mes-aps-scar-tissue", "ie-rules-treadmill"],
  },
  {
    id: "capacity-planning-manager",
    name: "Capacity Planning Manager",
    titleKeywords: ["capacity planning manager", "capacity planner"],
    caresAbout: ["capacity model accuracy", "planning horizon", "quarter-end performance"],
    fears: ["a capacity model that breaks under disruption right before a quarter-end review"],
    leadMessage: "A dynamic capacity model that plans 2–4 weeks ahead — utilisation and cycle time in one model.",
    trigger: "capacity model inadequacy under disruption, ramp planning",
    painIds: ["manual-planning", "tribal-knowledge"],
  },
  {
    id: "director-customer-ops",
    name: "Director of Customer Operations / VP Supply Chain",
    titleKeywords: [
      "director of customer operations",
      "vp supply chain",
      "vice president of supply chain",
      "head of customer operations",
    ],
    caresAbout: ["OTD predictability", "customer retention", "supply commitments"],
    fears: ["customer escalation", "contract renewal pressure"],
    leadMessage: "Predictable delivery, variance reduction — customers feel variance, not average.",
    trigger: "customer escalation, contract renewal pressure",
    painIds: ["otd-slipping"],
  },
  {
    id: "ie-manager",
    name: "Industrial Engineering Manager",
    titleKeywords: ["industrial engineering manager", "ie manager", "senior industrial engineer"],
    caresAbout: ["scheduler performance", "rule maintenance load", "integration", "fairness"],
    fears: ["a key engineer departure taking undocumented scheduling knowledge with them"],
    leadMessage: "We work with the IE team rather than around them — they own the integration.",
    trigger: "legacy scheduler pain, performance complaint, key engineer departure",
    painIds: ["ie-rules-treadmill", "diffusion-timelink", "high-mix", "disruption-recovery", "late-bottlenecks"],
  },
  {
    id: "automation-manager",
    name: "Automation Systems Manager",
    titleKeywords: [
      "automation systems manager",
      "automation manager",
      "fab automation manager",
      "manufacturing automation manager",
    ],
    caresAbout: [
      "integration with existing dispatch (FPS, AMAT RTD, Camstar/Promis)",
      "data pipeline stability",
      "technical risk of new software",
    ],
    fears: ["a scheduling project that requires ripping out or rebuilding the existing data pipeline"],
    leadMessage:
      "Read-only access to fab data, integrations with FabTime and Systema, no pipeline rebuild.",
    trigger: "modernisation initiatives",
    painIds: ["ie-rules-treadmill", "disruption-recovery", "mes-aps-scar-tissue"],
  },
  {
    id: "mes-it-manager",
    name: "MES / IT Manager",
    titleKeywords: ["mes manager", "it manager", "mes/it", "information technology manager"],
    caresAbout: ["data security", "cloud vs. on-prem deployment", "system stability"],
    fears: ["a repeat of a previous failed MES/APS rollout"],
    leadMessage: "Both deployment models available, lightweight integration, established with major MES systems.",
    trigger: "modernisation, smart manufacturing roadmap",
    painIds: ["mes-aps-scar-tissue"],
  },
  {
    id: "process-engineering-manager",
    name: "Process Engineering Manager",
    titleKeywords: [
      "process engineering manager",
      "diffusion manager",
      "lithography manager",
      "deposition manager",
      "metal etch manager",
      "epitaxy manager",
    ],
    caresAbout: ["diffusion, lithography, and deposition performance", "area-specific scrap and rework"],
    fears: ["a chronic bottleneck area that never gets fixed, only worked around"],
    leadMessage: "Area-specific proof: what happened at diffusion at Renesas can happen at yours.",
    trigger: "area bottleneck, scrap/rework problem",
    painIds: ["diffusion-timelink", "high-mix"],
  },
  // Fallback persona used when no title keyword matches (vague titles like "Manager", "Operations").
  {
    id: "general",
    name: "General fab / operations leadership",
    titleKeywords: [],
    caresAbout: [
      "getting more output from the fab without a capex cycle",
      "predictable, on-time delivery",
      "not being the fab that falls behind on modernisation",
    ],
    fears: ["capacity and delivery problems that manual, spreadsheet-based planning can no longer keep up with"],
    leadMessage: CORE_VALUE_PROP.oneLiner,
    trigger: "general modernisation and capacity pressure",
    painIds: ["capacity-on-floor", "otd-slipping", "manual-planning"],
  },
];

// Master KB §8 (verified customer proof only — §8.10 "active engagements" are prospect
// intelligence, not closed proof, and are deliberately excluded from the selectable pool
// per the "do not over-claim deployment status" guardrail).
export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "seagate",
    company: "Seagate Technology (Springtown, Northern Ireland)",
    segmentIds: ["tier1-idm"],
    personaIds: ["vp-ops", "fab-gm", "mes-it-manager"],
    painIds: ["capacity-on-floor", "otd-slipping"],
    headline:
      "Full-stack deployment (Flex Local + Flex Global + Flex Planner + AMAT RTD integration) at a 200mm fab running ~25% of global HDD recording head supply.",
    stats: [
      { value: "+6.5–8.7%", label: "fab-wide throughput" },
      { value: "−30%", label: "cycle-time std. dev. vs. target" },
      { value: "−10%", label: "late lots" },
      { value: "+138%", label: "deposition batch size" },
    ],
    quote:
      "Flexciton can make a decision for a tool knowing exactly what else is happening around it, what bottlenecks may be ahead, and what constraints are built into it. They can make the best decision not just for the tool, but for the entire fab. If we can make more semiconductors, that means a lot of money to us — a very significant number.",
    quoteAttribution: "Tina O'Donnell, Director of Wafer Factory IT, Seagate Technology",
    strategicRelevance:
      "The flagship Tier 1 IDM reference — use for any account with a mature, near-full-utilisation fab.",
  },
  {
    id: "western-digital",
    company: "Western Digital",
    segmentIds: ["tier1-idm"],
    personaIds: ["vp-ops", "fab-gm"],
    painIds: ["capacity-on-floor"],
    headline:
      "Selected over alternatives via formal RFP, deployed in 12 months during a memory ramp.",
    stats: [
      { value: "~+25%", label: "daily moves, deployed areas" },
      { value: "12 mo.", label: "RFP to full deployment" },
    ],
    strategicRelevance: "The \"ramp under pressure\" archetype — use for accounts announcing capacity expansion or new customer wins.",
  },
  {
    id: "renesas",
    company: "Renesas Electronics (US fab)",
    segmentIds: ["power-compound-semi"],
    personaIds: ["process-engineering-manager", "ie-manager", "fab-gm"],
    painIds: ["diffusion-timelink", "high-mix"],
    headline: "Flex Local deployed on a high-mix diffusion area.",
    stats: [
      { value: "−29%", label: "timelink violations" },
      { value: "−22%", label: "number of batches" },
      { value: "−11%", label: "queue time" },
      { value: "−36%", label: "rework" },
    ],
    strategicRelevance:
      "The diffusion/timelink reference for any compound semi, power, or automotive account.",
  },
  {
    id: "microchip",
    company: "Microchip Technology",
    segmentIds: ["mid-size"],
    personaIds: ["vp-ops"],
    painIds: ["capacity-on-floor"],
    headline: "Mid-size, mixed-signal automotive/industrial IDM — active, credible customer reference.",
    stats: [],
    strategicRelevance: "Mid-size IDM benchmark — use for Microchip-style accounts (Diodes, Vishay, Onsemi).",
  },
  {
    id: "diodes",
    company: "Diodes Incorporated",
    segmentIds: ["mid-size"],
    personaIds: ["director-ie", "capacity-planning-manager"],
    painIds: ["tribal-knowledge"],
    headline:
      "Continuity-risk archetype: capturing a departing senior planner's capacity model in software rather than losing it.",
    stats: [],
    strategicRelevance: "The \"tribal knowledge in software\" reference — a natural foot-in-door for Capacitor.",
  },
  {
    id: "nexperia",
    company: "Nexperia",
    segmentIds: ["power-compound-semi"],
    personaIds: ["ie-manager", "process-engineering-manager"],
    painIds: ["diffusion-timelink", "high-mix", "capacity-on-floor"],
    headline:
      "Active reference for a power-discrete, automotive-driven account: epitaxy changeover complexity, diffusion batching trade-offs, IE shortage, and high mix from frequent new product introductions.",
    stats: [],
    strategicRelevance: "Pairs naturally with Renesas for power-discrete or compound semi accounts.",
  },
  {
    id: "amkor",
    company: "Amkor Technology",
    segmentIds: ["osat-backend"],
    personaIds: ["director-planning", "director-ie"],
    painIds: ["manual-planning", "late-bottlenecks", "tribal-knowledge"],
    headline:
      "The flagship OSAT/backend reference: heavy reliance on manual scheduling and individual expertise, dynamic bottlenecks, and time-linked steps requiring rework when missed.",
    stats: [],
    strategicRelevance: "Use for any assembly, test, or advanced packaging (OSAT) account, paired with Flex APS.",
  },
  {
    id: "nxp",
    company: "NXP Semiconductors",
    segmentIds: ["foundry-legacy-fps"],
    personaIds: ["automation-manager", "mes-it-manager", "director-ie", "vp-ops", "ie-manager"],
    painIds: ["ie-rules-treadmill", "late-bottlenecks", "cross-shift-coordination", "mes-aps-scar-tissue"],
    headline:
      "Spotlight verification flagged a recipe qualification action the team would not otherwise have made that day — three days later the team confirmed a bottleneck had formed.",
    stats: [
      { value: "~0.2%", label: "moves recovered, single action" },
      { value: "1–2%", label: "est. compounding additional moves" },
      { value: "3 days", label: "until the bottleneck was confirmed" },
    ],
    strategicRelevance:
      "The flagship FPS-overlay reference — direct read-across to any fab running a legacy rules-based scheduler.",
  },
  {
    id: "200mm-foundry",
    company: "200mm specialty foundry (anonymised POC)",
    segmentIds: ["specialty-foundry"],
    personaIds: ["vp-ops", "director-planning"],
    painIds: ["otd-slipping", "strategic-capacity-excel"],
    headline: "30-day proof of concept.",
    stats: [
      { value: "+4.6%", label: "throughput" },
      { value: "−4.5%", label: "cycle time" },
      { value: "−14.6%", label: "lateness" },
      { value: "$6.8M", label: "est. annual revenue impact" },
    ],
    strategicRelevance: "The fastest-time-to-value POC archetype — overcomes \"we're too small for this\" objections.",
  },
];
