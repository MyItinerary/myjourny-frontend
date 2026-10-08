// Run with: node --test .github/helios/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import * as threads from "./threads.mjs";
import * as prompts from "./prompts.mjs";

const {
  parseFinding,
  toBotThreads,
  fetchBotThreads,
  formatThreadsForPrompt,
  dedupe,
  openBlockers,
  fetchThread,
  formatThreadForReply,
  sameLogin,
} = threads;
const BOT = "myjourny-review[bot]";

const node = (over = {}) => ({
  id: "T1",
  isResolved: false,
  isOutdated: false,
  path: "lib/f.ts",
  line: 11,
  originalLine: 9,
  comments: {
    nodes: [
      {
        databaseId: 1,
        body: "🔴 **Blocker: Wrong value**\n\nUse 2.",
        author: { login: "myjourny-review" },
      },
      { databaseId: 2, body: "Fixed in abc", author: { login: "dev" } },
      {
        databaseId: 3,
        body: "Confirmed, thanks!",
        author: { login: "myjourny-review" },
      },
    ],
  },
  ...over,
});

test("parseFinding reads severity and title from the bot's comment format", () => {
  assert.deepEqual(parseFinding("🟡 **Should fix: Missing await.**\n\nbody"), {
    severity: "should-fix",
    title: "Missing await.",
  });
  assert.equal(parseFinding("just a comment"), null);
});

test("sameLogin ignores the REST-only [bot] suffix", () => {
  assert.ok(sameLogin("myjourny-review", BOT));
  assert.ok(!sameLogin("someone", BOT));
});

test("toBotThreads keeps only threads the bot started, with replies", () => {
  const out = toBotThreads(
    [
      node(),
      node({ id: "T2", line: null, isResolved: true }),
      node({
        id: "T3",
        comments: {
          nodes: [
            {
              databaseId: 9,
              body: "🔴 **Blocker: x**",
              author: { login: "dev" },
            },
          ],
        },
      }),
      node({
        id: "T4",
        comments: {
          nodes: [
            {
              databaseId: 8,
              body: "no format",
              author: { login: "myjourny-review" },
            },
          ],
        },
      }),
    ],
    BOT,
  );
  assert.deepEqual(
    out.map((t) => t.id),
    ["T1", "T2"],
  );
  assert.deepEqual(out[0], {
    id: "T1",
    rootId: 1,
    resolved: false,
    outdated: false,
    path: "lib/f.ts",
    line: 11,
    severity: "blocker",
    title: "Wrong value",
    replies: [
      { author: "dev", fromBot: false, body: "Fixed in abc" },
      { author: "myjourny-review", fromBot: true, body: "Confirmed, thanks!" },
    ],
  });
  assert.equal(out[1].line, 9); // falls back to originalLine
});

test("fetchBotThreads follows pagination", async () => {
  const pages = [
    { nodes: [node()], pageInfo: { hasNextPage: true, endCursor: "c1" } },
    {
      nodes: [node({ id: "T2" })],
      pageInfo: { hasNextPage: false, endCursor: null },
    },
  ];
  const cursors = [];
  const github = {
    graphql: async (_q, vars) => {
      cursors.push(vars.cursor);
      return { repository: { pullRequest: { reviewThreads: pages.shift() } } };
    },
  };
  const out = await fetchBotThreads({
    github,
    owner: "o",
    repo: "r",
    number: 7,
    botLogin: BOT,
  });
  assert.deepEqual(cursors, [null, "c1"]);
  assert.equal(out.length, 2);
});

test("formatThreadsForPrompt lists state, issue and replies", () => {
  assert.equal(formatThreadsForPrompt([]), "");
  const [t] = toBotThreads([node()], BOT);
  const text = formatThreadsForPrompt([
    t,
    { ...t, resolved: true },
    { ...t, outdated: true, replies: [] },
  ]);
  assert.match(text, /^## Already raised on this PR/);
  assert.match(text, /- \[open\] blocker `lib\/f.ts:11`: Wrong value/);
  assert.match(text, /- \[resolved\] blocker/);
  assert.match(text, /- \[outdated\] blocker/);
  assert.match(text, / {2}- dev: "Fixed in abc"/);
  assert.match(text, / {2}- you: "Confirmed, thanks!"/);
});

test("dedupe matches same file and title, ignoring case and punctuation", () => {
  const prev = [{ path: "lib/f.ts", title: "Wrong value." }];
  const { kept, skipped } = dedupe(
    [
      { path: "lib/f.ts", title: "wrong VALUE" },
      { path: "lib/g.ts", title: "Wrong value" },
      { path: "lib/f.ts", title: "Another problem" },
    ],
    prev,
  );
  assert.equal(skipped.length, 1);
  assert.deepEqual(
    kept.map((f) => f.path + ":" + f.title),
    ["lib/g.ts:Wrong value", "lib/f.ts:Another problem"],
  );
});

test("openBlockers counts unresolved blocker threads only", () => {
  const out = openBlockers([
    { severity: "blocker", resolved: false },
    { severity: "blocker", resolved: true },
    { severity: "nit", resolved: false },
  ]);
  assert.equal(out.length, 1);
});

test("fetchThread returns the root and its replies in order", async () => {
  const github = {
    rest: { pulls: { listReviewComments: () => {} } },
    paginate: async () => [
      { id: 5, in_reply_to_id: 1 },
      { id: 1 },
      { id: 3, in_reply_to_id: 2 },
      { id: 4, in_reply_to_id: 1 },
    ],
  };
  const out = await fetchThread({
    github,
    owner: "o",
    repo: "r",
    pull_number: 7,
    rootId: 1,
  });
  assert.deepEqual(
    out.map((c) => c.id),
    [1, 4, 5],
  );
});

test("formatThreadForReply shows the hunk and who said what", () => {
  const text = formatThreadForReply(
    [
      {
        path: "lib/f.ts",
        line: 11,
        diff_hunk: "@@ -1 +1 @@\n+x",
        body: "🔴 **Blocker: Wrong**",
        user: { login: BOT },
      },
      { body: "Done", user: { login: "dev" } },
    ],
    BOT,
  );
  assert.match(text, /File: `lib\/f.ts`, line 11/);
  assert.match(text, /```diff\n@@ -1 \+1 @@\n\+x\n```/);
  assert.match(text, /### You\n\n🔴/);
  assert.match(text, /### @dev\n\nDone/);
});

test("prompts combine the trusted files with PR and thread context", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "helios-"));
  fs.writeFileSync(
    path.join(dir, "review-prompt.md"),
    "Diff origin/<base>...HEAD\n",
  );
  fs.writeFileSync(path.join(dir, "reply-prompt.md"), "Reply briefly.\n");
  const [t] = toBotThreads([node()], BOT);
  const review = prompts.buildReviewPrompt({
    dir,
    start: { baseRef: "main", prNumber: "7", title: "T", body: "" },
    threads: [t],
  });
  assert.match(review, /^Diff origin\/main\.\.\.HEAD/);
  assert.match(review, /- Number: #7/);
  assert.match(review, /\(none\)/);
  assert.match(review, /## Already raised on this PR/);
  const reply = prompts.buildReplyPrompt({
    dir,
    comments: [
      { path: "a", line: 1, diff_hunk: "h", body: "b", user: { login: BOT } },
    ],
    botLogin: BOT,
  });
  assert.match(reply, /^Reply briefly\.\n\n## The thread/);
});
