// Run with: node --test .github/helios/*.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  commentableLines,
  partition,
  summary,
  finish,
} from "./post-review.mjs";

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
      "## MyJourny Review Complete",
      "",
      "| Field | Value |",
      "|---|---|",
      "| Review ID | `565ec4d6` |",
      "| Duration | 86.9s |",
      "| Status | Success |",
      "| Open blockers | 0 |",
      "",
      "Review comments have been posted inline on the changed files.",
      "",
      "✅ `ai-review` check passed.",
    ].join("\n"),
  );
  assert.match(
    summary({ ok: true, sha: "abc", seconds: 1, posted: 0 }),
    /^No issues found\.$/m,
  );
  const failed = summary({
    ok: false,
    seconds: 2,
    posted: 0,
    runUrl: "https://x/run",
  });
  assert.match(failed, /^## MyJourny Review Failed/);
  assert.match(failed, /\| Review ID \| `n\/a` \|/);
  assert.doesNotMatch(failed, /Open blockers|ai-review/);
  assert.match(failed, /\[See the workflow run\]\(https:\/\/x\/run\)/);
  const notes = summary({
    ok: true,
    sha: "abc",
    seconds: 1,
    posted: 0,
    offDiff: [finding({ line: 40, body: "a\nb" })],
  });
  assert.doesNotMatch(notes, /No issues found/);
  assert.match(notes, /^- 🔴 `lib\/f.ts:40`: \*\*Wrong value\*\*\. a b$/m);
});

test("summary reports skipped repeats, open blockers and status errors", () => {
  const out = summary({
    ok: true,
    sha: "abc",
    seconds: 1,
    posted: 0,
    skipped: 2,
    blockers: 1,
    statusError: "Resource not accessible by integration",
  });
  assert.match(out, /^No new issues found\.$/m);
  assert.match(out, /^Skipped 2 issue\(s\) already raised/m);
  assert.match(out, /\| Open blockers \| 1 \|/);
  assert.match(out, /❌ `ai-review` check failing: 1 open blocker\(s\)/);
  assert.match(out, /⚠️ Could not update the `ai-review` check: Resource not/);
});

function fakeGithub({
  failBatch = false,
  failSingle = () => false,
  failStatus = false,
} = {}) {
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
      repos: {
        createCommitStatus: rec("createCommitStatus", (a) => {
          if (failStatus) throw new Error("Resource not accessible");
          return { data: a };
        }),
      },
    },
  };
}
const context = {
  repo: { owner: "o", repo: "r" },
  serverUrl: "https://github.com",
};
const core = { info() {}, warning() {} };
const start = {
  commentKind: "issue",
  commentId: "5",
  prNumber: "7",
  startedAt: String(Date.now()),
};

const names = (github) => github.calls.map((c) => c[0]);
const call = (github, name) => github.calls.find((c) => c[0] === name)[1];

test("finish posts one review, sets the check, keeps 👀 and adds 🚀, then comments", async () => {
  const github = fakeGithub();
  await finish({
    github,
    context,
    core,
    start,
    ok: true,
    findings: [finding({ severity: "nit" }), finding({ line: 40 })],
    sha: "deadbeefcafe",
  });
  assert.deepEqual(names(github), [
    "createReview",
    "createCommitStatus",
    "createForIssueComment",
    "createComment",
  ]);
  assert.equal(call(github, "createReview").comments.length, 1);
  assert.equal(call(github, "createReview").commit_id, "deadbeefcafe");
  assert.equal(call(github, "createForIssueComment").content, "rocket");
  // The off-diff blocker is a summary note, so it doesn't hold the check.
  assert.deepEqual(
    (({ sha, state, context: ctx }) => ({ sha, state, ctx }))(
      call(github, "createCommitStatus"),
    ),
    { sha: "deadbeefcafe", state: "success", ctx: "ai-review" },
  );
  assert.match(
    call(github, "createComment").body,
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
  // Only the comment that landed counts as an open blocker.
  assert.equal(call(github, "createCommitStatus").state, "failure");
  assert.match(
    call(github, "createCommitStatus").description,
    /^1 open blocker/,
  );
  assert.match(
    call(github, "createComment").body,
    /`lib\/f.ts:12`: \*\*Bad anchor\*\*/,
  );
});

test("finish skips repeats and counts earlier open blockers", async () => {
  const github = fakeGithub();
  const threads = [
    {
      path: "lib/f.ts",
      title: "wrong value!",
      severity: "nit",
      resolved: false,
    },
    {
      path: "lib/f.ts",
      title: "Old blocker",
      severity: "blocker",
      resolved: false,
    },
    {
      path: "lib/f.ts",
      title: "Fixed blocker",
      severity: "blocker",
      resolved: true,
    },
  ];
  await finish({
    github,
    context,
    core,
    start,
    ok: true,
    findings: [finding()],
    threads,
    sha: "s",
  });
  assert.deepEqual(names(github), [
    "createCommitStatus",
    "createForIssueComment",
    "createComment",
  ]);
  assert.equal(call(github, "createCommitStatus").state, "failure");
  const body = call(github, "createComment").body;
  assert.match(body, /Skipped 1 issue/);
  assert.match(body, /\| Open blockers \| 1 \|/);
});

test("finish on failure marks the check errored, adds 😕 and posts the failed summary", async () => {
  const github = fakeGithub();
  await finish({
    github,
    context,
    core,
    start: { ...start, commentKind: "review" },
    ok: false,
    sha: "s",
    runUrl: "https://x/run",
  });
  assert.deepEqual(names(github), [
    "createCommitStatus",
    "createForPullRequestReviewComment",
    "createComment",
  ]);
  assert.equal(call(github, "createCommitStatus").state, "error");
  assert.equal(call(github, "createCommitStatus").target_url, "https://x/run");
  assert.equal(
    call(github, "createForPullRequestReviewComment").content,
    "confused",
  );
  assert.match(call(github, "createComment").body, /MyJourny Review Failed/);
});

test("finish still posts the summary when the trigger comment was deleted", async () => {
  const github = fakeGithub();
  github.rest.reactions.createForIssueComment = async () => {
    throw new Error("Not Found");
  };
  const warnings = [];
  await finish({
    github,
    context,
    core: { info() {}, warning: (m) => warnings.push(m) },
    start,
    ok: true,
    findings: [finding()],
    sha: "s",
  });
  assert.deepEqual(names(github), [
    "createReview",
    "createCommitStatus",
    "createComment",
  ]);
  assert.match(warnings[0], /Could not react rocket/);
});

test("finish still posts the summary when the status can't be set", async () => {
  const github = fakeGithub({ failStatus: true });
  await finish({
    github,
    context,
    core,
    start,
    ok: true,
    findings: [],
    sha: "s",
  });
  assert.match(
    call(github, "createComment").body,
    /⚠️ Could not update the `ai-review` check: Resource not accessible/,
  );
});
