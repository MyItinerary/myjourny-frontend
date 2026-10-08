// MyJourny Review (internally "helios"): builds the Claude prompts from the
// trusted prompt files plus PR / thread context.
import fs from "node:fs";
import path from "node:path";
import { formatThreadsForPrompt, formatThreadForReply } from "./threads.mjs";

function buildReviewPrompt({ dir, start, threads }) {
  const rubric = fs
    .readFileSync(path.join(dir, "review-prompt.md"), "utf8")
    .replaceAll("<base>", start.baseRef);
  return [
    rubric,
    "## This PR",
    "",
    `- Number: #${start.prNumber}`,
    `- Base: origin/${start.baseRef}`,
    `- Title: ${start.title}`,
    "",
    "Description:",
    "",
    start.body || "(none)",
    "",
    formatThreadsForPrompt(threads),
  ].join("\n");
}

function buildReplyPrompt({ dir, comments, botLogin }) {
  const instructions = fs.readFileSync(
    path.join(dir, "reply-prompt.md"),
    "utf8",
  );
  return `${instructions}\n${formatThreadForReply(comments, botLogin)}`;
}

export { buildReviewPrompt, buildReplyPrompt };
