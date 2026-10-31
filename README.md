# agenticgovernance.net

The Agentic Governance Framework: how an organization governs the agents it
builds, buys and relies on, and the relationships between them.

The framework has four parts:

- I. Objectives and obligations (`compliance-alignment.html`)
- II. The lifecycle: Plan, Design, Build, Run, Change and Decommission
  (`lifecycle-*.html`). Change feeds back into Design and Build.
- III. Cross-cutting disciplines: Network, Security and risk, Performance and
  quality, Financial governance, Organizational enablement, Assurance and
  Continuous improvement
- IV. The operating model and its four risk tiers (`operating-model.html`)

Every page except the home page and the operating model ends with control
objectives. Each objective says what each risk tier requires, the evidence
that proves it, and who may check it.

Published by GitHub Pages from `main`, at agenticgovernance.net (see `CNAME`).
**Merging to `main` publishes the site.**

## How the pages are made

Static HTML, one stylesheet (`site.css`) and one small script (`site.js`), in
the same family as agenticdevelopment.ai, agentmessaging.ai and
dev.agentmesh.ai: Space Grotesk display, IBM Plex body and mono, the left rail.
This site's accent is indigo.

Each page is written by hand, except for the parts between
`<!-- BEGIN name -->` and `<!-- END name -->` markers, which
`node tools/build.mjs` writes:

- `head`: fonts, stylesheet, icon, theme bootstrap
- `rail`: the menu, from `tools/site.mjs`, in reader order
- `objectives`: the control objectives, from `objectives/<name>.json`
- `pager`: previous and next
- `foot`: the footer

To add a page, add it to `tools/site.mjs`, write the page with the empty
markers, and run the builder. To change a control objective, edit its JSON
file and run the builder. Never edit inside the markers by hand.

## Checks

CI (`.github/workflows/checks.yml`) runs on every pull request. Run the same
checks before pushing (Node 22):

```bash
node tools/build.mjs --check     # the generated parts are up to date
node tools/check-site.mjs        # links, wording, sponsor credit, objectives
cd tools && npm ci && cd ..      # once, for the contrast gate
node tools/contrast-gate.mjs     # every page, light and dark, 1440 and 390 px
```

The contrast gate is the family's (from dev.agentmesh.ai and
agentmessaging.ai) with a second floor: every piece of text must clear 4.5:1,
and body text (paragraphs, list items, definitions and table cells) must
clear 7:1, in both themes. Use the tokens in `site.css`; never fade text with
opacity or an rgba() colour.

## Writing rules

- Full sentences. No fragments for rhythm, no "X, not Y", no headings built
  from two paired clauses.
- No em dashes, as the character or as `&mdash;`, `&#8212;` or `&#x2014;`.
  Use a colon, a comma or a new sentence.
- No "beta", "draft", "coming soon" or "in production".
- Name no AI vendors or models, and no customers.
- AgentMesh sponsors the site. It appears as "Sponsored by AgentMesh",
  linking https://agentmesh.ai (never app.agentmesh.ai), and in one plain
  line on the Network page. The site is a framework, not a sales page.
- The lifecycle's stages belong to the Agentic Development Lifecycle at
  https://agenticdevelopment.ai/stages.html. Link to its stages rather than
  describing them again.
