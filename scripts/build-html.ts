// Reads data/generated/<slug>.json and emits a self-contained, colourful
// HTML+CSS page per lead to public/html/<slug>.html (plus public/html/index.html).
// No JavaScript, no framework, no build step — every page is one portable file
// you can open locally, email, or host anywhere.
// Run with: npm run build:html   (also runs automatically after `npm run match`)

import fs from "node:fs";
import path from "node:path";
import { LOGO_SVG } from "../lib/brand";
import type { Brief } from "../lib/types";

const GENERATED_DIR = path.resolve(__dirname, "..", "data", "generated");
const OUT_DIR = path.resolve(__dirname, "..", "public", "html");

// One accent per finding category — the same palette the React page uses (lib/taxonomy.ts),
// pulled in here so the standalone file has zero imports at runtime.
const CATEGORY: Record<string, { label: string; color: string; tint: string; ring: string }> = {
  capacity: { label: "Capacity", color: "#4164FF", tint: "#EEF1FF", ring: "#C7D1FF" },
  foresight: { label: "Foresight", color: "#B45309", tint: "#FEF3E2", ring: "#F6D9AE" },
  variability: { label: "Variability", color: "#7C3AED", tint: "#F3EEFE", ring: "#DCC9FB" },
  priority: { label: "Priority", color: "#0D9488", tint: "#E7FAF7", ring: "#B3EEE5" },
  knowledge: { label: "Knowledge", color: "#BE185D", tint: "#FDF0F6", ring: "#F6C6DD" },
  integration: { label: "Integration", color: "#475569", tint: "#F1F4F7", ring: "#D5DEE6" },
};

const TIER: Record<string, { label: string; bg: string; fg: string }> = {
  primary: { label: "Primary fit", bg: "#4164FF", fg: "#ffffff" },
  relevant: { label: "Relevant next", bg: "#ECEFFF", fg: "#131E4C" },
  adjacent: { label: "Platform context", bg: "#F1F4F7", fg: "#5b6672" },
};

// Accent cycle for the four value-strip cards.
const STRIP_ACCENTS = ["#4164FF", "#0D9488", "#7C3AED", "#B45309"];

const esc = (s: string): string =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function page(brief: Brief): string {
  const generatedDate = new Date(brief.generatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const primaryTrigger = brief.persona.trigger.split(",")[0].trim();

  const shown = new Set<string>();
  const findingsHtml = brief.findings
    .map((f, i) => {
      const c = CATEGORY[f.category] ?? CATEGORY.integration;
      const repeat = f.response ? shown.has(f.response.id) : false;
      if (f.response) shown.add(f.response.id);
      const responseHtml =
        f.response && !repeat
          ? `<div class="response" style="border-color:${c.ring}">
               <p class="response-label" style="color:${c.color}">Response — ${esc(f.response.name)}</p>
               <p class="response-value">${esc(f.response.value)}</p>
               ${f.response.proof ? `<p class="response-proof">${esc(f.response.proof)}</p>` : ""}
             </div>`
          : f.response && repeat
            ? `<p class="response-ref" style="color:${c.color};background:${c.tint}">Response — ${esc(
                f.response.name,
              )}, above</p>`
            : "";
      return `<article class="finding" style="--accent:${c.color};--tint:${c.tint};--ring:${c.ring}">
        <div class="finding-head">
          <span class="finding-num" style="background:${c.color}">${String(i + 1).padStart(2, "0")}</span>
          <span class="pill" style="color:${c.color};border-color:${c.ring};background:${c.tint}">${c.label}</span>
        </div>
        <h3>${esc(f.name)}</h3>
        <p class="symptom">${esc(f.symptom)}</p>
        ${responseHtml}
      </article>`;
    })
    .join("\n");

  const platformHtml = brief.platformOverview
    .map((e) => {
      const t = TIER[e.tier] ?? TIER.adjacent;
      return `<div class="product">
        <div class="product-name">
          <span>${esc(e.product.name)}</span>
          <span class="tier" style="background:${t.bg};color:${t.fg}">${t.label}</span>
        </div>
        <div class="product-body">
          <p class="muted">${esc(e.product.value)}</p>
          <p>${esc(e.note)}</p>
        </div>
      </div>`;
    })
    .join("\n");

  const stripHtml = brief.coreValueProp.fourLines
    .map((line, i) => {
      const [label, ...rest] = line.split(" — ");
      const detail = rest.join(" — ");
      const accent = STRIP_ACCENTS[i % STRIP_ACCENTS.length];
      return `<div class="strip-card" style="--accent:${accent}">
        <span class="strip-bar" style="background:${accent}"></span>
        <p class="strip-label">${esc(label)}</p>
        ${detail ? `<p class="strip-detail">${esc(detail)}</p>` : ""}
      </div>`;
    })
    .join("\n");

  const statsHtml =
    brief.caseStudy.stats.length > 0
      ? `<div class="stats">${brief.caseStudy.stats
          .map(
            (s) =>
              `<div class="stat"><p class="stat-value">${esc(s.value)}</p><p class="stat-label">${esc(
                s.label,
              )}</p></div>`,
          )
          .join("")}</div>`
      : "";

  const quoteHtml = brief.caseStudy.quote
    ? `<blockquote>&ldquo;${esc(brief.caseStudy.quote)}&rdquo;${
        brief.caseStudy.quoteAttribution
          ? `<footer>${esc(brief.caseStudy.quoteAttribution)}</footer>`
          : ""
      }</blockquote>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Flexciton — for ${esc(brief.name)}, ${esc(brief.company)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root{
    --paper:#ffffff; --ink:#1f2123; --ink-dim:#5b6068; --ink-faint:#8a8f97;
    --signal:#4164ff; --field:#ecefff; --deep:#131e4c; --line:#e3e5ea;
    --sans:"IBM Plex Sans",Arial,Helvetica,sans-serif;
    --mono:"IBM Plex Mono",ui-monospace,SFMono-Regular,Menlo,monospace;
  }
  *{box-sizing:border-box}
  html,body{margin:0;padding:0}
  body{background:var(--paper);color:var(--ink);font-family:var(--sans);line-height:1.6;
    -webkit-font-smoothing:antialiased;font-feature-settings:"ss01" 1}
  .wrap{max-width:760px;margin:0 auto;padding:0 24px}
  .mono{font-family:var(--mono)}
  .eyebrow{font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.16em;
    text-transform:uppercase;color:var(--signal);margin:0}
  .muted{color:var(--ink-dim)}
  h1,h2,h3{margin:0;font-weight:500;letter-spacing:-.01em}

  /* ---- Hero ---------------------------------------------------------- */
  header.hero{position:relative;overflow:hidden;color:#fff;
    background:linear-gradient(160deg,#0d1738 0%,#1a2c66 42%,#2f4bd1 100%)}
  header.hero::before{content:"";position:absolute;right:-160px;top:-200px;width:460px;height:460px;
    border-radius:50%;background:radial-gradient(circle,#5b78ff 0%,transparent 70%);opacity:.5}
  header.hero::after{content:"";position:absolute;left:-120px;bottom:-160px;width:380px;height:380px;
    border-radius:50%;background:radial-gradient(circle,#00d4c8 0%,transparent 70%);opacity:.22}
  .letterhead{position:relative;display:flex;align-items:center;justify-content:space-between;
    padding:22px 0;border-bottom:1px solid rgba(255,255,255,.16)}
  .letterhead svg{height:16px;width:auto;color:#fff}
  .letterhead .meta{text-align:right;font-family:var(--mono);font-size:11px;letter-spacing:.14em;
    text-transform:uppercase;color:rgba(255,255,255,.6);line-height:1.7}
  .hero-body{position:relative;padding:44px 0 52px}
  .hero-body .eyebrow{color:#9fb2ff}
  .prepared{margin:8px 0 0;font-size:18px}
  .prepared strong{font-weight:600}
  .prepared span{color:rgba(255,255,255,.68)}
  h1{margin-top:24px;font-size:40px;line-height:1.1;max-width:18ch}
  @media(max-width:640px){h1{font-size:30px}}
  .tags{margin-top:22px;display:flex;flex-wrap:wrap;gap:8px}
  .tag{font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;
    padding:5px 10px;border:1px solid rgba(255,255,255,.28);color:rgba(255,255,255,.85);border-radius:2px}
  .oneliner{margin-top:24px;max-width:60ch;color:rgba(255,255,255,.78);font-size:16px}
  .whynow{margin-top:28px;max-width:60ch;border-left:3px solid #00d4c8;padding-left:16px}
  .whynow .eyebrow{color:#5ff0e6}
  .whynow p{margin:6px 0 0;font-size:15px;color:#fff}

  /* ---- Value strip ------------------------------------------------- */
  .strip{background:var(--field);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
  .strip-grid{max-width:760px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:repeat(2,1fr)}
  @media(max-width:640px){.strip-grid{grid-template-columns:1fr}}
  .strip-card{position:relative;padding:24px 20px 24px 22px;border-bottom:1px solid #d7dbf3}
  .strip-card:nth-child(odd){border-right:1px solid #d7dbf3}
  @media(max-width:640px){.strip-card:nth-child(odd){border-right:0}}
  .strip-bar{position:absolute;left:0;top:20px;bottom:20px;width:3px;border-radius:2px}
  .strip-label{margin:0;font-weight:600;font-size:14px}
  .strip-detail{margin:6px 0 0;font-size:12.5px;color:var(--ink-dim)}

  /* ---- Sections --------------------------------------------------- */
  section{padding:60px 0}
  .section-head h2{margin-top:8px;font-size:24px;max-width:24ch}
  .section-head .lead{margin-top:12px;max-width:60ch;color:var(--ink-dim);font-size:15px}

  /* ---- Findings ------------------------------------------------- */
  .findings{margin-top:36px;display:flex;flex-direction:column;gap:20px}
  .finding{border:1px solid var(--ring);border-left:4px solid var(--accent);border-radius:8px;
    background:var(--tint);padding:24px}
  .finding-head{display:flex;align-items:center;gap:10px}
  .finding-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;
    border-radius:50%;color:#fff;font-family:var(--mono);font-size:12px;font-weight:500}
  .pill{font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;
    padding:4px 9px;border:1px solid;border-radius:999px}
  .finding h3{margin-top:14px;font-size:19px;line-height:1.35}
  .symptom{margin:12px 0 0;font-size:14.5px;color:var(--ink-dim);max-width:64ch}
  .response{margin-top:18px;background:#fff;border:1px solid;border-radius:6px;padding:16px 18px}
  .response-label{margin:0;font-family:var(--mono);font-size:11px;font-weight:500;letter-spacing:.06em;
    text-transform:uppercase}
  .response-value{margin:6px 0 0;font-size:14.5px;color:var(--ink)}
  .response-proof{margin:8px 0 0;font-family:var(--mono);font-size:12.5px;color:var(--ink-dim)}
  .response-ref{display:inline-block;margin-top:16px;padding:5px 12px;border-radius:999px;
    font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase}

  /* ---- Platform overview -------------------------------------- */
  .platform{margin-top:32px;border-top:1px solid var(--line)}
  .product{padding:20px 0;border-bottom:1px solid var(--line);display:grid;
    grid-template-columns:210px 1fr;gap:24px}
  @media(max-width:640px){.product{grid-template-columns:1fr;gap:8px}}
  .product-name{display:flex;flex-direction:column;align-items:flex-start;gap:8px;font-weight:600;font-size:15px}
  .tier{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;
    padding:3px 9px;border-radius:999px;font-weight:500}
  .product-body p{margin:0;font-size:14px}
  .product-body .muted{margin-bottom:6px}

  /* ---- Proof band ------------------------------------------- */
  .proof{position:relative;overflow:hidden;color:#fff;
    background:linear-gradient(155deg,#101a3d 0%,#1c2f6b 60%,#132a63 100%)}
  .proof::before{content:"";position:absolute;left:-100px;top:-100px;width:360px;height:360px;border-radius:50%;
    background:radial-gradient(circle,#4164ff 0%,transparent 70%);opacity:.35}
  .proof::after{content:"";position:absolute;right:-120px;bottom:-80px;width:320px;height:320px;border-radius:50%;
    background:radial-gradient(circle,#00d4c8 0%,transparent 70%);opacity:.16}
  .proof .inner{position:relative;padding:60px 0}
  .proof .eyebrow{color:#9fb2ff}
  .proof h2{margin-top:8px;font-size:26px}
  .proof .framing{margin-top:12px;max-width:60ch;font-style:italic;font-size:13px;color:rgba(255,255,255,.5)}
  .proof .headline{margin-top:14px;max-width:60ch;font-size:15px;color:rgba(255,255,255,.72)}
  .stats{margin-top:32px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
  @media(max-width:640px){.stats{grid-template-columns:repeat(2,1fr)}}
  .stat{border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);border-radius:6px;padding:16px}
  .stat-value{margin:0;font-family:var(--mono);font-size:26px;font-weight:500;color:#5ff0e6}
  .stat-label{margin:6px 0 0;font-size:12px;color:rgba(255,255,255,.6)}
  blockquote{margin:32px 0 0;border-left:3px solid #9fb2ff;padding-left:20px;font-style:italic;
    font-size:15px;color:rgba(255,255,255,.85)}
  blockquote footer{margin-top:12px;font-family:var(--mono);font-size:12px;font-style:normal;
    letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.5)}

  /* ---- Footer --------------------------------------------- */
  footer.cta{border-top:1px solid var(--line);padding:56px 0}
  footer.cta p{margin:0;max-width:60ch;font-size:16px}
  .colophon{margin-top:32px;border-top:1px solid var(--line);padding-top:24px;display:flex;
    justify-content:space-between;font-family:var(--mono);font-size:11px;letter-spacing:.14em;
    text-transform:uppercase;color:var(--ink-faint)}
</style>
</head>
<body>
<header class="hero">
  <div class="wrap">
    <div class="letterhead">
      ${LOGO_SVG}
      <div class="meta"><div>Ref. ${esc(brief.referenceId)}</div><div>${generatedDate}</div></div>
    </div>
  </div>
  <div class="wrap hero-body">
    <p class="eyebrow">Prepared for</p>
    <p class="prepared"><strong>${esc(brief.name)}</strong><span> — ${esc(brief.title)}, ${esc(
      brief.company,
    )}</span></p>
    <h1>${esc(brief.persona.leadMessage)}</h1>
    <div class="tags">
      <span class="tag">${esc(brief.persona.name)}</span>
      <span class="tag">Trigger: ${esc(primaryTrigger)}</span>
    </div>
    <p class="oneliner">${esc(brief.coreValueProp.oneLiner)}</p>
    ${
      brief.whyNow
        ? `<div class="whynow"><p class="eyebrow">Why now</p><p>${esc(brief.whyNow)}</p></div>`
        : ""
    }
  </div>
</header>

<div class="strip">
  <div class="strip-grid">
    ${stripHtml}
  </div>
</div>

<section class="wrap">
  <div class="section-head">
    <p class="eyebrow">What we matched to your role</p>
    <h2>${brief.findings.length} findings for a ${esc(
      brief.title.toLowerCase(),
    )} at ${esc(brief.company)}</h2>
  </div>
  <div class="findings">
    ${findingsHtml}
  </div>
</section>

<section class="wrap">
  <div class="section-head">
    <p class="eyebrow">The full platform</p>
    <h2>Every Flexciton product, ranked for ${esc(brief.company)}</h2>
    <p class="lead">Flexciton is a closed-loop stack, not a single tool. Here is where each layer
      stands relative to what ${esc(brief.company)} needs today.</p>
  </div>
  <div class="platform">
    ${platformHtml}
  </div>
</section>

<div class="proof">
  <div class="wrap inner">
    <p class="eyebrow">Proof, at a peer fab</p>
    <h2>${esc(brief.caseStudy.company)}</h2>
    ${brief.caseStudyFraming ? `<p class="framing">${esc(brief.caseStudyFraming)}</p>` : ""}
    <p class="headline">${esc(brief.caseStudy.headline)}</p>
    ${statsHtml}
    ${quoteHtml}
  </div>
</div>

<footer class="cta">
  <div class="wrap">
    <p>${esc(brief.firstName)}, if any of this reflects what ${esc(
      brief.company,
    )} is dealing with right now, reply to the email this page was linked from and we&rsquo;ll set up time to walk through it.</p>
    <div class="colophon"><span>Flexciton</span><span>${esc(brief.referenceId)}</span></div>
  </div>
</footer>
</body>
</html>
`;
}

function indexPage(briefs: Brief[]): string {
  const rows = briefs
    .map(
      (b) =>
        `<li><a href="./${b.slug}.html">${esc(b.name)} — ${esc(b.title)}, ${esc(
          b.company,
        )}</a></li>`,
    )
    .join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Flexciton — personalised pages (static)</title>
<style>body{font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:64px auto;padding:0 24px;color:#1f2123;line-height:1.6}
h1{font-size:20px}a{color:#4164ff}li{margin:8px 0}</style></head>
<body><h1>Personalised pages — standalone HTML</h1>
<p>Each link is one self-contained file (no JavaScript). Open, save, or attach to an email.</p>
<ul>${rows}</ul></body></html>
`;
}

function main() {
  if (!fs.existsSync(GENERATED_DIR)) {
    console.error(`No generated briefs at ${GENERATED_DIR}. Run \`npm run match\` first.`);
    process.exit(1);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs.readdirSync(GENERATED_DIR).filter((f) => f.endsWith(".json"));
  const briefs: Brief[] = [];
  for (const file of files) {
    const brief = JSON.parse(fs.readFileSync(path.join(GENERATED_DIR, file), "utf-8")) as Brief;
    briefs.push(brief);
    fs.writeFileSync(path.join(OUT_DIR, `${brief.slug}.html`), page(brief));
    console.log(`✔ ${brief.slug}.html`);
  }
  fs.writeFileSync(path.join(OUT_DIR, "index.html"), indexPage(briefs));
  console.log(`✔ index.html (${briefs.length} page${briefs.length === 1 ? "" : "s"}) -> public/html/`);
}

main();
