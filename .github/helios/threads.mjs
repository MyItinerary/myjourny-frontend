// MyJourny Review (internally "helios"): reads the bot's earlier review
// threads so a re-review doesn't repeat itself, counts open blockers for the
// `ai-review` check, and handles replies to the bot's comments. Loaded from a
// trusted copy of the default branch, never from the PR checkout.
const ICONS = { "🔴": "blocker", "🟡": "should-fix", "🔵": "nit" };
const STATUS_CONTEXT = "ai-review";

const THREADS_QUERY = `
  query ($owner: String!, $repo: String!, $number: Int!, $cursor: String) {
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) {
        reviewThreads(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id isResolved isOutdated path line originalLine
            comments(first: 50) { nodes { databaseId body author { login } } }
          }
        }
      }
    }
  }`;

// REST logins end in "[bot]", GraphQL ones don't.
const sameLogin = (a, b) =>
  (a || "").replace(/\[bot\]$/, "") === (b || "").replace(/\[bot\]$/, "");

// "🔴 **Blocker: Title**\n\nbody" -> { severity, title }
function parseFinding(body) {
  const m = /^(🔴|🟡|🔵) \*\*[^:*]+: (.+?)\*\*/u.exec(body || "");
  return m ? { severity: ICONS[m[1]], title: m[2] } : null;
}

const normalize = (s) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

// Threads the bot started, oldest comment first, with everyone's replies.
function toBotThreads(nodes, botLogin) {
  const threads = [];
  for (const node of nodes) {
    const [root, ...replies] = node.comments.nodes;
    if (!root || !sameLogin(root.author?.login, botLogin)) continue;
    const finding = parseFinding(root.body);
    if (!finding) continue;
    threads.push({
      id: node.id,
      rootId: root.databaseId,
      resolved: node.isResolved,
      outdated: node.isOutdated,
      path: node.path,
      line: node.line ?? node.originalLine,
      ...finding,
      replies: replies.map((r) => ({
        author: (r.author?.login || "ghost").replace(/\[bot\]$/, ""),
        fromBot: sameLogin(r.author?.login, botLogin),
        body: r.body,
      })),
    });
  }
  return threads;
}

async function fetchBotThreads({ github, owner, repo, number, botLogin }) {
  const nodes = [];
  let cursor = null;
  do {
    const res = await github.graphql(THREADS_QUERY, {
      owner,
      repo,
      number,
      cursor,
    });
    const page = res.repository.pullRequest.reviewThreads;
    nodes.push(...page.nodes);
    cursor = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
  } while (cursor);
  return toBotThreads(nodes, botLogin);
}

const oneLine = (s, max = 300) => {
  const flat = (s || "").replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
};

// Prompt section listing everything already raised, so Claude doesn't repeat it.
function formatThreadsForPrompt(threads) {
  if (threads.length === 0) return "";
  const out = [
    "## Already raised on this PR",
    "",
    "You reviewed this PR before. Do NOT raise any of these again, even reworded or at a different line. Where someone replied, respect their answer.",
    "",
  ];
  for (const t of threads) {
    const state = t.resolved ? "resolved" : t.outdated ? "outdated" : "open";
    out.push(`- [${state}] ${t.severity} \`${t.path}:${t.line}\`: ${t.title}`);
    for (const r of t.replies) {
      out.push(`  - ${r.fromBot ? "you" : r.author}: "${oneLine(r.body)}"`);
    }
  }
  return out.join("\n");
}

// Drops findings that repeat an earlier thread (same file, same title).
function dedupe(findings, threads) {
  const seen = new Set(threads.map((t) => `${t.path}\n${normalize(t.title)}`));
  const kept = [];
  const skipped = [];
  for (const f of findings) {
    (seen.has(`${f.path}\n${normalize(f.title)}`) ? skipped : kept).push(f);
  }
  return { kept, skipped };
}

const openBlockers = (threads) =>
  threads.filter((t) => t.severity === "blocker" && !t.resolved);

async function setStatus({
  github,
  owner,
  repo,
  sha,
  state,
  description,
  url,
}) {
  await github.rest.repos.createCommitStatus({
    owner,
    repo,
    sha,
    state,
    context: STATUS_CONTEXT,
    description: description.slice(0, 140),
    ...(url ? { target_url: url } : {}),
  });
}

// The root comment and all replies of the thread a reply belongs to.
async function fetchThread({ github, owner, repo, pull_number, rootId }) {
  const all = await github.paginate(github.rest.pulls.listReviewComments, {
    owner,
    repo,
    pull_number,
    per_page: 100,
  });
  return all
    .filter((c) => c.id === rootId || c.in_reply_to_id === rootId)
    .sort((a, b) => a.id - b.id);
}

function formatThreadForReply(comments, botLogin) {
  const [root] = comments;
  const out = [
    "## The thread",
    "",
    `File: \`${root.path}\`, line ${root.line ?? root.original_line}`,
    "",
    "Diff hunk your comment was on:",
    "```diff",
    root.diff_hunk,
    "```",
    "",
  ];
  for (const c of comments) {
    const who = sameLogin(c.user.login, botLogin) ? "You" : `@${c.user.login}`;
    out.push(`### ${who}`, "", c.body, "");
  }
  return out.join("\n");
}

export {
  STATUS_CONTEXT,
  parseFinding,
  toBotThreads,
  fetchBotThreads,
  formatThreadsForPrompt,
  dedupe,
  openBlockers,
  setStatus,
  fetchThread,
  formatThreadForReply,
  sameLogin,
};
