#!/usr/bin/env node
// Architecture guardrails that ESLint can't express. Runs in CI (`architecture`
// job) and locally via `npm run check:architecture`. See CONTRIBUTING.md.
// Changing this file requires frontend-leads or engineering-manager approval (CODEOWNERS).
//
//   1. Legacy ratchet  — no NEW non-test files in legacy feature dirs.
//   2. Test co-location — every features/** model, view-model and view file
//                         has a sibling *.test.ts(x).
//   3. Feature shape    — every feature exposes a public index.ts.
//   4. No silencing     — no eslint-disable for boundary rules, no .only/.skip.
//
// Compares against ARCH_BASE_REF (default: origin/main) for rule 1.

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE_REF = process.env.ARCH_BASE_REF || "origin/main";
const IGNORED_DIRS = new Set(["node_modules", ".next", ".git", "coverage", "playwright-report", "test-results", ".claude"]);

const errors = [];
const fail = (rule, file, message) => errors.push({ rule, file, message });

const isTestFile = (file) => /\.(test|spec)\.tsx?$/.test(file);
const isSource = (file) => /\.tsx?$/.test(file) && !file.endsWith(".d.ts");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((entry) => {
    if (IGNORED_DIRS.has(entry)) return [];
    const full = path.join(dir, entry);
    return statSync(full).isDirectory() ? walk(full) : [path.relative(ROOT, full).split(path.sep).join("/")];
  });
}

function git(...args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

// ---------------------------------------------------------------------------
// 1. Legacy ratchet
// ---------------------------------------------------------------------------
const SHARED_COMPONENT_DIRS = ["ui", "shared", "icons", "motion"];

function isLegacyLocation(file) {
  if (file.startsWith("lib/queries/")) return true;
  if (!file.startsWith("components/")) return false;
  const [, first] = file.split("/");
  return !SHARED_COMPONENT_DIRS.includes(first);
}

let addedFiles = null;
try {
  const mergeBase = git("merge-base", "HEAD", BASE_REF);
  // Working tree vs merge-base (committed + staged + unstaged), plus untracked
  // files, so `npm run check` catches violations before anything is committed.
  const added = git("diff", "--name-only", "--diff-filter=A", mergeBase);
  const untracked = git("ls-files", "--others", "--exclude-standard");
  addedFiles = [...new Set(`${added}\n${untracked}`.split("\n").filter(Boolean))];
} catch {
  console.warn(`⚠ Could not diff against ${BASE_REF}; skipping the legacy ratchet check.`);
}

for (const file of addedFiles ?? []) {
  if (isSource(file) && !isTestFile(file) && isLegacyLocation(file)) {
    fail(
      "legacy-ratchet",
      file,
      "New code must live in features/<feature>/{model,view-model,view}. Legacy dirs (lib/queries, components/<feature>) are closed to new files.",
    );
  }
}

// ---------------------------------------------------------------------------
// 2 + 3. Feature shape and test co-location
// ---------------------------------------------------------------------------
const LAYERS = new Set(["model", "view-model", "view"]);

const featuresDir = path.join(ROOT, "features");
const features = existsSync(featuresDir)
  ? readdirSync(featuresDir).filter((f) => statSync(path.join(featuresDir, f)).isDirectory())
  : [];

for (const feature of features) {
  const files = walk(path.join(featuresDir, feature));
  const fileSet = new Set(files);

  if (!fileSet.has(`features/${feature}/index.ts`)) {
    fail("feature-shape", `features/${feature}/`, "Every feature must expose its public API from index.ts.");
  }

  for (const file of files) {
    const [, , layer, ...rest] = file.split("/");
    if (rest.length === 0) {
      if (file !== `features/${feature}/index.ts`) {
        fail("feature-shape", file, "Feature files belong in model/, view-model/ or view/ — only index.ts sits at the root.");
      }
      continue;
    }
    if (!LAYERS.has(layer)) {
      fail("feature-shape", file, `Unknown layer "${layer}". Use model/, view-model/ or view/.`);
      continue;
    }
    if (!isSource(file) || isTestFile(file)) continue;
    const base = path.basename(file);
    if (base === "index.ts" || base.endsWith(".types.ts")) continue;

    const stem = file.replace(/\.tsx?$/, "");
    if (!fileSet.has(`${stem}.test.ts`) && !fileSet.has(`${stem}.test.tsx`)) {
      fail("test-colocation", file, `Missing sibling test: ${path.basename(stem)}.test.ts(x).`);
    }
  }
}

// ---------------------------------------------------------------------------
// 4. No silencing of guardrails
// ---------------------------------------------------------------------------
const DISABLE_BOUNDARY = /eslint-disable[^\n]*no-restricted-imports/;
const FOCUSED_OR_SKIPPED = /\b(?:it|test|describe)\.(?:only|skip|fixme)\s*\(/;

for (const file of walk(ROOT)) {
  if (!isSource(file) || file.startsWith("scripts/")) continue;
  const source = readFileSync(file, "utf8");
  if (DISABLE_BOUNDARY.test(source)) {
    fail("no-silencing", file, "Do not eslint-disable MVVM boundary rules. Fix the import, or ask frontend-leads to change the rule.");
  }
  if (isTestFile(file) && FOCUSED_OR_SKIPPED.test(source)) {
    fail("no-silencing", file, "Remove .only/.skip/.fixme — every test must run in CI.");
  }
}

// ---------------------------------------------------------------------------
if (errors.length > 0) {
  console.error(`\n✖ Architecture check failed (${errors.length} problem${errors.length === 1 ? "" : "s"}):\n`);
  for (const { rule, file, message } of errors) console.error(`  [${rule}] ${file}\n      ${message}`);
  console.error("\nSee CONTRIBUTING.md → Architecture.\n");
  process.exit(1);
}
console.log(`✔ Architecture check passed (${features.length} feature${features.length === 1 ? "" : "s"}).`);
