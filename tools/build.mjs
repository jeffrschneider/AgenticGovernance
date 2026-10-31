#!/usr/bin/env node
// Writes the shared parts of every page from tools/site.mjs and objectives/*.json.
//
//   node tools/build.mjs          rewrite the generated parts in place
//   node tools/build.mjs --check  change nothing; exit 1 if any page is out of date
//
// Each page is hand-written HTML. The builder only replaces what sits between
// these markers, and leaves everything else alone:
//
//   <!-- BEGIN head -->        fonts, stylesheet, icon, theme bootstrap
//   <!-- BEGIN rail -->        the left menu, with this page highlighted
//   <!-- BEGIN objectives -->  the control objectives and the quick reference
//   <!-- BEGIN pager -->       previous and next, in reader order
//   <!-- BEGIN foot -->        the footer and the closing script
//
// each closed by the matching <!-- END name -->.
//
// Node 22, no dependencies.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, GROUPS, VERSION, TIERS, CHECKERS } from "./site.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// Objective text may carry a few inline tags (<a>, <b>, <i>, <code>); everything else is escaped.
const rich = (s) => esc(s).replace(/&lt;(\/?)(b|i|code)&gt;/g, "<$1$2>")
  .replace(/&lt;a href="([^"]+)"&gt;/g, '<a href="$1">').replace(/&lt;\/a&gt;/g, "</a>");

function list(words) {
  if (words.length === 1) return words[0];
  return words.slice(0, -1).join(", ") + (words.length > 2 ? "," : "") + " and " + words.at(-1);
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const head = () => `<!-- BEGIN head -->
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&amp;family=IBM+Plex+Sans:wght@400;500;600;700&amp;family=Space+Grotesk:wght@500;700&amp;display=swap">
<link rel="stylesheet" href="site.css">
<script>try{if(localStorage.getItem("ag-theme")==="dark")document.documentElement.setAttribute("data-theme","dark")}catch(e){}</script>
<!-- END head -->`;

const MARK = `<svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" fill="var(--accent)"/><path fill="none" stroke="var(--bg)" stroke-width="2.4" stroke-linejoin="round" d="M16 5.5 7.5 9v6.5c0 5.6 3.6 9.9 8.5 11.5 4.9-1.6 8.5-5.9 8.5-11.5V9z"/><path fill="none" stroke="var(--bg)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m12 16 3 3 5.5-6"/></svg>`;

function rail(file) {
  const groups = GROUPS.map((g) => {
    const links = PAGES.filter((p) => p.group === g).map((p) => {
      const on = p.file === file;
      const n = p.n ? `<span class="n">${p.n}</span>` : "";
      return `    <a href="${p.file}"${on ? ' class="on" aria-current="page"' : ""}>${n}${esc(p.label)}</a>`;
    });
    return `    <div class="grp">${esc(g)}</div>\n${links.join("\n")}`;
  });
  return `<!-- BEGIN rail -->
<aside class="rail" id="sidenav">
  <div class="railhead">
    <a class="brand" href="index.html">${MARK}<span class="wm"><b>Agentic Governance</b>Framework</span></a>
    <button class="iconbtn theme" id="themebtn" type="button" aria-label="Switch between light and dark"><span class="to-dark">Dark</span><span class="to-light">Light</span></button>
    <button class="iconbtn menubtn" id="menubtn" type="button" aria-expanded="false" aria-controls="sidenav">Menu</button>
  </div>
  <nav aria-label="Pages">
${groups.join("\n")}
  </nav>
  <div class="foot">
    <p>The lifecycle's stages are defined by the <a href="https://agenticdevelopment.ai/stages.html">Agentic Development Lifecycle</a>.</p>
    <p>Sponsored by <a href="https://agentmesh.ai">AgentMesh</a>.</p>
  </div>
</aside>
<!-- END rail -->`;
}

function pager(file) {
  const i = PAGES.findIndex((p) => p.file === file);
  const prev = PAGES[i - 1], next = PAGES[i + 1];
  const a = (p, cls, word) => p ? `  <a class="${cls}" href="${p.file}"><small>${word}</small><span>${esc(p.label)}</span></a>` : "";
  return `<!-- BEGIN pager -->
<nav class="wrap pager" aria-label="Previous and next">
${[a(prev, "prev", "Previous"), a(next, "next", "Next")].filter(Boolean).join("\n")}
</nav>
<!-- END pager -->`;
}

const foot = () => `<!-- BEGIN foot -->
<footer class="sitefoot">
  <div class="wrap">
    <span>Agentic Governance Framework, version ${VERSION}</span>
    <span>Sponsored by <a href="https://agentmesh.ai">AgentMesh</a></span>
    <span>Lifecycle stages from the <a href="https://agenticdevelopment.ai/">Agentic Development Lifecycle</a></span>
  </div>
</footer>
<script src="site.js"></script>
<!-- END foot -->`;

function objectives(name) {
  const data = JSON.parse(readFileSync(join(root, "objectives", name + ".json"), "utf8"));
  const cards = data.objectives.map((o) => {
    if (!o.tiers || o.tiers.length !== 4) throw new Error(`${o.id}: needs four tier requirements`);
    if (!o.evidence || !o.checkers?.length) throw new Error(`${o.id}: needs evidence and who may check it`);
    const tiers = o.tiers.map((t, k) => `        <li><span class="tier t${k + 1}">Tier ${TIERS[k].n} ${TIERS[k].name}</span><br>${rich(t)}</li>`).join("\n");
    const who = cap(list(o.checkers.map((c) => CHECKERS[c] ?? (() => { throw new Error(`${o.id}: unknown checker ${c}`); })())));
    return `    <article class="obj" id="${o.id.toLowerCase()}">
      <header><span class="oid">${o.id}</span><h3>${esc(o.title)}</h3></header>
      <p class="stmt">${rich(o.statement)}</p>
      <dl class="facts">
        <div><dt>Risk addressed</dt><dd>${rich(o.risk)}</dd></div>
        <div><dt>Key metric</dt><dd>${rich(o.metric)}</dd></div>
      </dl>
      <p class="tierhead">What each tier requires (<a href="operating-model.html">the tiers</a>)</p>
      <ol class="tiers">
${tiers}
      </ol>
      <dl class="proof">
        <div><dt>Evidence</dt><dd>${rich(o.evidence)}</dd></div>
        <div><dt>Who may check it</dt><dd>${who}.</dd></div>
      </dl>
    </article>`;
  });
  const rows = data.objectives.map((o) => `      <tr><td data-h="ID"><a href="#${o.id.toLowerCase()}">${o.id}</a></td><td data-h="Objective">${esc(o.title)}</td><td data-h="Key metric">${rich(o.metric)}</td></tr>`);
  return `<!-- BEGIN objectives -->
<section class="band" id="objectives">
  <div class="wrap">
    <h2>Control objectives</h2>
    <p>There are ${data.objectives.length} control objectives here. Each one states what it asks for, the risk it addresses and how it is measured. It then says what each risk tier requires, what evidence proves it, and who may check that evidence. The <a href="operating-model.html">Operating Model</a> page explains the tiers.</p>
    <div class="objs">
${cards.join("\n")}
    </div>
    <h3 id="quick-reference">Quick reference</h3>
    <table class="qref">
      <thead><tr><th scope="col">ID</th><th scope="col">Objective</th><th scope="col">Key metric</th></tr></thead>
      <tbody>
${rows.join("\n")}
      </tbody>
    </table>
  </div>
</section>
<!-- END objectives -->`;
}

function replace(html, name, body, file) {
  const re = new RegExp(`<!-- BEGIN ${name}\\b[^>]*-->[\\s\\S]*?<!-- END ${name} -->`);
  if (!re.test(html)) throw new Error(`${file}: no <!-- BEGIN ${name} --> ... <!-- END ${name} --> markers`);
  return html.replace(re, () => body);
}

const stale = [];
for (const p of PAGES) {
  const path = join(root, p.file);
  const before = readFileSync(path, "utf8");
  let html = before;
  html = replace(html, "head", head(), p.file);
  html = replace(html, "rail", rail(p.file), p.file);
  if (p.obj) html = replace(html, "objectives", objectives(p.obj), p.file);
  html = replace(html, "pager", pager(p.file), p.file);
  html = replace(html, "foot", foot(), p.file);
  if (html !== before) {
    stale.push(p.file);
    if (!check) writeFileSync(path, html);
  }
}
if (check && stale.length) {
  console.error(`out of date, run node tools/build.mjs: ${stale.join(", ")}`);
  process.exit(1);
}
console.log(check ? `build: all ${PAGES.length} pages up to date` : `build: ${stale.length} of ${PAGES.length} pages rewritten`);
