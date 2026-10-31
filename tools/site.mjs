// The site's pages in reader order. The rail, the previous and next links and
// the checks all read this list, so a new page is added here first.
//
//   file   the page
//   label  its name in the menu
//   group  the menu heading it sits under
//   n      the number shown beside it in the menu (lifecycle phases only)
//   obj    the control objectives file in objectives/, when the page has one

export const GROUPS = ["Framework", "Lifecycle", "Cross-cutting disciplines", "Operating model"];

export const PAGES = [
  { file: "index.html", label: "Overview", group: "Framework" },
  { file: "compliance-alignment.html", label: "Objectives and obligations", group: "Framework", obj: "objectives" },

  { file: "lifecycle-plan.html", label: "Plan", group: "Lifecycle", n: "1", obj: "plan" },
  { file: "lifecycle-design.html", label: "Design", group: "Lifecycle", n: "2", obj: "design" },
  { file: "lifecycle-build.html", label: "Build", group: "Lifecycle", n: "3", obj: "build" },
  { file: "lifecycle-run.html", label: "Run", group: "Lifecycle", n: "4", obj: "run" },
  { file: "lifecycle-change.html", label: "Change", group: "Lifecycle", n: "5", obj: "change" },
  { file: "lifecycle-decommission.html", label: "Decommission", group: "Lifecycle", n: "6", obj: "decommission" },

  { file: "network.html", label: "Network", group: "Cross-cutting disciplines", obj: "network" },
  { file: "security-risk.html", label: "Security and risk", group: "Cross-cutting disciplines", obj: "security" },
  { file: "performance-qa.html", label: "Performance and quality", group: "Cross-cutting disciplines", obj: "performance" },
  { file: "financial-governance.html", label: "Financial governance", group: "Cross-cutting disciplines", obj: "financial" },
  { file: "organizational-enablement.html", label: "Organizational enablement", group: "Cross-cutting disciplines", obj: "enablement" },
  { file: "assurance.html", label: "Assurance", group: "Cross-cutting disciplines", obj: "assurance" },
  { file: "continuous-improvement.html", label: "Continuous improvement", group: "Cross-cutting disciplines", obj: "improvement" },

  { file: "operating-model.html", label: "Risk tiers", group: "Operating model" },
];

export const VERSION = "3.0";

export const TIERS = [
  { n: 1, name: "Exploratory" },
  { n: 2, name: "Operational" },
  { n: 3, name: "Critical" },
  { n: 4, name: "Strategic" },
];

export const CHECKERS = {
  internal: "internal audit",
  outside: "an outside auditor",
  partner: "a partner",
};
