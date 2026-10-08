// Helios: turns Claude's structured findings into one PR review plus a
// summary comment. Loaded by .github/workflows/helios.yml from a trusted copy
// of the default branch, never from the PR checkout.
"use strict";

const SEVERITY = {
  blocker: { icon: "🔴", label: "Blocker" },
  "should-fix": { icon: "🟡", label: "Should fix" },
  nit: { icon: "🔵", label: "Nit" },
};

// Line numbers a review comment may target, per side, from a unified-diff patch.
function commentableLines(patch) {
  const lines = { RIGHT: new Set(), LEFT: new Set() };
  if (!patch) return lines;
  let oldLine = 0;
  let newLine = 0;
  for (const row of patch.split("\n")) {
    const hunk = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(row);
    if (hunk) {
      oldLine = Number(hunk[1]);
      newLine = Number(hunk[2]);
    } else if (row.startsWith("+")) {
      lines.RIGHT.add(newLine++);
    } else if (row.startsWith("-")) {
      lines.LEFT.add(oldLine++);
    } else if (row.startsWith(" ") || row === "") {
      lines.RIGHT.add(newLine++);
      lines.LEFT.add(oldLine++);
    }
    // "\ No newline at end of file" advances nothing.
  }
  return lines;
}

function formatBody(f) {
  const sev = SEVERITY[f.severity] || SEVERITY.nit;
  let body = `${sev.icon} **${sev.label}: ${f.title}**\n\n${f.body}`;
  if (f.suggestion && (f.side || "RIGHT") === "RIGHT") {
    body += `\n\n\`\`\`suggestion\n${f.suggestion.replace(/\n$/, "")}\n\`\`\``;
  }
  return body;
}

// Splits findings into review comments GitHub will accept (each kept next to
// its finding) and notes for the summary.
function partition(findings, files) {
  const byPath = new Map(
    files.map((file) => [file.filename, commentableLines(file.patch)]),
  );
  const comments = [];
  const offDiff = [];
  for (const f of findings) {
    const side = f.side === "LEFT" ? "LEFT" : "RIGHT";
    const valid = byPath.get(f.path)?.[side];
    const start =
      f.start_line && f.start_line < f.line ? f.start_line : undefined;
    if (valid && valid.has(f.line) && (!start || valid.has(start))) {
      const comment = { path: f.path, line: f.line, side, body: formatBody(f) };
      if (start)
        Object.assign(comment, { start_line: start, start_side: side });
      comments.push({ finding: f, comment });
    } else {
      offDiff.push(f);
    }
  }
  return { comments, offDiff };
}

function summary({ ok, sha, seconds, posted, offDiff = [], runUrl }) {
  const rows = [
    "| Field | Value |",
    "|---|---|",
    `| Review ID | \`${sha ? sha.slice(0, 8) : "n/a"}\` |`,
    `| Duration | ${seconds.toFixed(1)}s |`,
    `| Status | ${ok ? "Success" : "Failed"} |`,
  ];
  const out = [
    `## Helios Review ${ok ? "Complete" : "Failed"}`,
    "",
    ...rows,
    "",
  ];
  if (!ok) {
    out.push(`The review did not finish. [See the workflow run](${runUrl}).`);
  } else if (posted > 0) {
    out.push("Review comments have been posted inline on the changed files.");
  } else if (offDiff.length === 0) {
    out.push("No issues found.");
  }
  if (offDiff.length > 0) {
    out.push("", "**Other notes** (outside the diff):", "");
    for (const f of offDiff) {
      const sev = SEVERITY[f.severity] || SEVERITY.nit;
      out.push(
        `- ${sev.icon} \`${f.path}:${f.line}\`: **${f.title}**. ${f.body.replace(/\s*\n\s*/g, " ")}`,
      );
    }
  }
  return out.join("\n");
}

async function swapReaction({ github, context, start }, to) {
  const { owner, repo } = context.repo;
  const api =
    start.commentKind === "review"
      ? {
          list: "listForPullRequestReviewComment",
          create: "createForPullRequestReviewComment",
          del: "deleteForPullRequestComment",
        }
      : {
          list: "listForIssueComment",
          create: "createForIssueComment",
          del: "deleteForIssueComment",
        };
  const comment_id = Number(start.commentId);
  if (start.eyesId) {
    await github.rest.reactions[api.del]({
      owner,
      repo,
      comment_id,
      reaction_id: Number(start.eyesId),
    }).catch(() => {});
  }
  await github.rest.reactions[api.create]({
    owner,
    repo,
    comment_id,
    content: to,
  });
}

async function finish({
  github,
  context,
  core,
  start,
  ok,
  findings,
  sha,
  runUrl,
}) {
  const { owner, repo } = context.repo;
  const pull_number = Number(start.prNumber);
  let posted = 0;
  let offDiff = [];

  if (ok) {
    const files = await github.paginate(github.rest.pulls.listFiles, {
      owner,
      repo,
      pull_number,
      per_page: 100,
    });
    const split = partition(findings, files);
    offDiff = split.offDiff;
    if (split.comments.length > 0) {
      try {
        const comments = split.comments.map((c) => c.comment);
        await github.rest.pulls.createReview({
          owner,
          repo,
          pull_number,
          commit_id: sha,
          event: "COMMENT",
          comments,
        });
        posted = split.comments.length;
      } catch (err) {
        // One bad anchor rejects the whole review, so retry comment by comment.
        core.warning(
          `Batch review failed (${err.message}); posting comments one by one.`,
        );
        for (const { finding, comment } of split.comments) {
          try {
            await github.rest.pulls.createReviewComment({
              owner,
              repo,
              pull_number,
              commit_id: sha,
              ...comment,
            });
            posted++;
          } catch {
            offDiff.push(finding);
          }
        }
      }
    }
  }

  const seconds = (Date.now() - Number(start.startedAt)) / 1000;
  await swapReaction({ github, context, start }, ok ? "rocket" : "confused");
  await github.rest.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body: summary({ ok, sha, seconds, posted, offDiff, runUrl }),
  });
  core.info(
    `Helios: ${posted} inline comment(s), ${offDiff.length} other note(s).`,
  );
}

module.exports = { commentableLines, formatBody, partition, summary, finish };
