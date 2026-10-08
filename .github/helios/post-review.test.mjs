// Run with: node --test .github/helios/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import helios from "./post-review.js";

const { commentableLines, partition, summary, finish } = helios;

const patch = [
  "@@ -10,4 +10,5 @@ export function f() {",
  " const a = 1;",
  "-const b = 2;",
  "+const b = 3;",
  "+const c = 4;",
  " return a;",
  "\\ No newline at end of file",
].join("\n");
const files = [
  { filename: "lib/f.ts", patch },
  { filename: "public/logo.png" },
];
const finding = (over) => ({
  path: "lib/f.ts",
  line: 11,
  side: "RIGHT",
  severity: "blocker",
  title: "Wrong value",
  body: "Use 2.",
  ...over,
});

test("commentableLines maps hunk rows to old and new line numbers", () => {
  const lines = commentableLines(patch);
  assert.deepEqual([...lines.RIGHT], [10, 11, 12, 13]);
  assert.deepEqual([...lines.LEFT], [10, 11, 12]);
  assert.equal(commentableLines(undefined).RIGHT.size, 0);
});

test("partition keeps in-diff findings as comments and moves the rest to notes", () => {
  const { comments, offDiff } = partition(
    [
      finding(),
      finding({ line: 11, side: "LEFT", severity: "nit" }),
      finding({ line: 40 }),
      finding({ path: "public/logo.png", line: 1 }),
      finding({ path: "missing.ts" }),
      finding({ start_line: 3, line: 12 }),
    ],
    files,
  );
  assert.equal(comments.length, 2);
  assert.deepEqual(comments[0].comment, {
    path: "lib/f.ts",
    line: 11,
    side: "RIGHT",
    body: "🔴 **Blocker: Wrong value**\n\nUse 2.",
  });
  assert.equal(comments[1].comment.side, "LEFT");
  assert.equal(offDiff.length, 4);
});

test("partition supports ranges and suggestions", () => {
  const { comments } = partition(
    [finding({ start_line: 11, line: 12, suggestion: "const b = 2;\n" })],
    files,
  );
  const c = comments[0].comment;
  assert.equal(c.start_line, 11);
  assert.equal(c.start_side, "RIGHT");
  assert.match(c.body, /```suggestion\nconst b = 2;\n```$/);
});

test("summary matches the agreed format", () => {
  assert.equal(
    summary({ ok: true, sha: "565ec4d6abcdef", seconds: 86.94, posted: 3 }),
    [
      "## Helios Review Complete",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Review ID | `565ec4d6` |",
      "| Duration | 86.9s |",
      "| Status | Success |",
      "",
      "Review comments have been posted inline on the changed files.",
    ].join("\n"),
  );
  assert.match(
    summary({ ok: true, sha: "abc", seconds: 1, posted: 0 }),
    /No issues found\.$/,
  );
  const failed = summary({
    ok: false,
    seconds: 2,
    posted: 0,
    runUrl: "https://x/run",
  });
  assert.match(failed, /^## Helios Review Failed/);
  assert.match(failed, /\| Review ID \| `n\/a` \|/);
  assert.match(failed, /\[See the workflow run\]\(https:\/\/x\/run\)/);
  const notes = summary({
    ok: true,
    sha: "abc",
    seconds: 1,
    posted: 0,
    offDiff: [finding({ line: 40, body: "a\nb" })],
  });
  assert.doesNotMatch(notes, /No issues found/);
  assert.match(notes, /- 🔴 `lib\/f.ts:40`: \*\*Wrong value\*\*\. a b$/);
});

function fakeGithub({ failBatch = false, failSingle = () => false } = {}) {
  const calls = [];
  const rec = (name, fn) => async (args) => {
    calls.push([name, args]);
    return fn ? fn(args) : { data: {} };
  };
  return {
    calls,
    paginate: async () => files,
    rest: {
      pulls: {
        listFiles: () => {},
        createReview: rec("createReview", () => {
          if (failBatch) throw new Error("422");
          return { data: {} };
        }),
        createReviewComment: rec("createReviewComment", (a) => {
          if (failSingle(a)) throw new Error("422");
          return { data: {} };
        }),
      },
      reactions: {
        createForIssueComment: rec("createForIssueComment"),
        createForPullRequestReviewComment: rec(
          "createForPullRequestReviewComment",
        ),
      },
      issues: { createComment: rec("createComment") },
    },
  };
}
const context = { repo: { owner: "o", repo: "r" } };
const core = { info() {}, warning() {} };
const start = {
  commentKind: "issue",
  commentId: "5",
  prNumber: "7",
  startedAt: String(Date.now()),
};

test("finish posts one review, keeps 👀 and adds 🚀, then comments the summary", async () => {
  const github = fakeGithub();
  await finish({
    github,
    context,
    core,
    start,
    ok: true,
    findings: [finding(), finding({ line: 40 })],
    sha: "deadbeefcafe",
  });
  assert.deepEqual(
    github.calls.map((c) => c[0]),
    ["createReview", "createForIssueComment", "createComment"],
  );
  assert.equal(github.calls[0][1].comments.length, 1);
  assert.equal(github.calls[0][1].commit_id, "deadbeefcafe");
  assert.equal(github.calls[1][1].content, "rocket");
  assert.match(
    github.calls[2][1].body,
    /Review comments have been posted inline[\s\S]*Other notes/,
  );
});

test("finish falls back to single comments and notes the rejected ones", async () => {
  const github = fakeGithub({
    failBatch: true,
    failSingle: (a) => a.line === 12,
  });
  await finish({
    github,
    context,
    core,
    start,
    ok: true,
    findings: [finding(), finding({ line: 12, title: "Bad anchor" })],
    sha: "s",
  });
  assert.equal(
    github.calls.filter((c) => c[0] === "createReviewComment").length,
    2,
  );
  assert.match(
    github.calls.at(-1)[1].body,
    /`lib\/f.ts:12`: \*\*Bad anchor\*\*/,
  );
});

test("finish on failure adds 😕 on a review comment and posts the failed summary", async () => {
  const github = fakeGithub();
  await finish({
    github,
    context,
    core,
    start: { ...start, commentKind: "review" },
    ok: false,
    runUrl: "https://x/run",
  });
  assert.deepEqual(
    github.calls.map((c) => c[0]),
    ["createForPullRequestReviewComment", "createComment"],
  );
  assert.equal(github.calls[0][1].content, "confused");
  assert.match(github.calls[1][1].body, /Helios Review Failed/);
});
