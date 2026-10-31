#!/usr/bin/env node
// Checks every page of the site for the house rules, without the network.
//
//   node tools/check-site.mjs
//
// It fails, naming the page and the text, when it finds:
//   - a link to a page of this site that does not exist, or to a section
//     (#id) that the page it points at does not have;
//   - an em dash, as the character or as &mdash;, &#8212; or &#x2014;
//     (use a colon, a comma or a new sentence instead);
//   - the words "beta", "draft", "coming soon" or "in production";
//   - a link to app.agentmesh.ai (link https://agentmesh.ai instead);
//   - the Tailwind CDN, or the old sponsor's name;
//   - a page in tools/site.mjs that is missing, or an HTML page that the
//     menu does not list;
//   - a control objective without four tier requirements, evidence, and who
//     may check it (tools/build.mjs enforces the same when it writes them).
//
// Node 22, no dependencies.

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES } from "./site.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pages = readdirSync(root).filter((f) => f.endsWith(".html")).sort();
const html = new Map(pages.map((p) => [p, readFileSync(join(root, p), "utf8")]));
const ids = new Map(pages.map((p) => [p, new Set([...html.get(p).matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]))]));
const failures = [];
const fail = (page, why) => failures.push(`${page}: ${why}`);

// Text a reader sees: no scripts, styles or tags, and entities left as written.
const prose = (s) => s.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<style[\s\S]*?<\/style>/g, " ")
  .replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ");

const BANNED = [
  [/—|&mdash;|&#8212;|&#x2014;/i, "an em dash"],
  [/\bbeta\b/i, '"beta"'],
  [/\bdrafts?\b/i, '"draft"'],
  [/\bcoming soon\b/i, '"coming soon"'],
  [/\bin production\b/i, '"in production"'],
  [/legendary/i, "the old sponsor's name"],
];

for (const page of pages) {
  const src = html.get(page);
  const text = prose(src);
  for (const [re, what] of BANNED) {
    const m = text.match(new RegExp(`.{0,40}${re.source}.{0,40}`, re.flags));
    if (m) fail(page, `${what}: "${m[0].replace(/\s+/g, " ").trim()}"`);
  }
  if (/app\.agentmesh\.ai/i.test(src)) fail(page, "links app.agentmesh.ai; link https://agentmesh.ai");
  if (/cdn\.tailwindcss\.com|lucide/i.test(src)) fail(page, "loads the Tailwind CDN or the Lucide icon script");
  if (!/Sponsored by <a href="https:\/\/agentmesh\.ai">AgentMesh<\/a>/.test(src)) fail(page, 'has no "Sponsored by AgentMesh" credit');
  for (const [, href] of src.matchAll(/\bhref="([^"]+)"/g)) {
    if (/^[a-z]+:/i.test(href)) continue; // other sites are not checked here
    const [file, frag] = href.split("#");
    const target = file === "" ? page : file;
    if (!target.endsWith(".html")) { if (!existsSync(join(root, target))) fail(page, `links ${href}, which does not exist`); continue; }
    if (!html.has(target)) { fail(page, `links ${href}: no page ${target}`); continue; }
    if (frag && !ids.get(target).has(frag)) fail(page, `links ${href}: no id "${frag}" on ${target}`);
  }
}

const listed = new Set(PAGES.map((p) => p.file));
for (const p of PAGES) if (!html.has(p.file)) fail(p.file, "is in tools/site.mjs but does not exist");
for (const p of pages) if (!listed.has(p) && p !== "404.html") fail(p, "is not in the menu (tools/site.mjs)");

for (const p of PAGES.filter((x) => x.obj)) {
  const file = join(root, "objectives", p.obj + ".json");
  if (!existsSync(file)) { fail(p.file, `has no objectives/${p.obj}.json`); continue; }
  const { objectives } = JSON.parse(readFileSync(file, "utf8"));
  for (const o of objectives) {
    if (o.tiers?.length !== 4) fail(`objectives/${p.obj}.json`, `${o.id} needs four tier requirements`);
    if (!o.evidence) fail(`objectives/${p.obj}.json`, `${o.id} needs evidence`);
    if (!o.checkers?.length) fail(`objectives/${p.obj}.json`, `${o.id} needs who may check it`);
    const all = [o.title, o.statement, o.risk, o.metric, o.evidence, ...(o.tiers || [])].join(" ");
    for (const [re, what] of BANNED) if (re.test(all)) fail(`objectives/${p.obj}.json`, `${o.id} has ${what}`);
  }
}

if (failures.length) {
  console.error(`check-site: ${failures.length} problem(s)`);
  for (const f of failures) console.error("  " + f);
  process.exit(1);
}
console.log(`check-site: ${pages.length} pages, links, wording and objectives all pass`);
