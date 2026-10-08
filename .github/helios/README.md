# MyJourny Review: PR review bot

The bot posts as **myjourny-review[bot]**. It never runs on its own: someone has to ask for a review.

## Asking for a review

Comment `@myjourny` on a pull request, either in the conversation or on a line of the diff. The bot will:

1. React 👀 to your comment.
2. Review the PR with Claude, using [review-prompt.md](review-prompt.md) and the rules in `AGENTS.md` / `CONTRIBUTING.md`.
3. Post new findings as one review with inline comments (🔴 blocker, 🟡 should fix, 🔵 nit).
4. Set the `ai-review` check (see below).
5. React 🚀 (keeping 👀, so your comment shows both) and post a summary: reviewed commit, duration, status and open blockers. Findings that can't be anchored to a diff line go in the summary under "Other notes".

**Re-reviews don't repeat themselves.** The bot reads its earlier threads on the PR, whether open, resolved or outdated, along with everyone's replies. It never raises those issues again. A code-level check also drops any finding with the same file and title as an earlier one. The summary says how many were skipped.

If something breaks, it adds 😕, posts a "MyJourny Review Failed" summary with a link to the run, and marks the check as errored. Comment `@myjourny` again to retry.

## Replying to the bot

Reply to any of the bot's inline comments (without `@myjourny`) and it answers in the thread within a minute or so:

- **You say it's fixed:** it checks the current code and confirms, or says what's still missing.
- **You explain why not:** it accepts reasonable explanations, or explains the risk once.
- **You ask a question:** it answers it.

Replies are remembered, so a later review won't re-raise that issue. Including `@myjourny` in a reply asks for a full review instead.

## The `ai-review` check

`ai-review` is a required status for merging into `main`.

| When                                                    | Check state                                           |
| ------------------------------------------------------- | ----------------------------------------------------- |
| A PR is opened or gets a new push                       | ⏳ pending: "Comment @myjourny to run the AI review." |
| The review finishes, no unresolved 🔴 blocker threads   | ✅ success                                            |
| The review finishes, with unresolved 🔴 blocker threads | ❌ failure                                            |
| The review crashes                                      | ⚠️ error                                              |

To go from red to green: fix the blockers, **resolve their threads**, then comment `@myjourny` again. Every new push resets the check to pending, so a PR is only mergeable once the latest commit has been reviewed.

Blockers that couldn't be anchored to a diff line (the "Other notes" in the summary) are listed there but don't hold the check, because they have no thread that could be resolved.

Only repo owners, members and collaborators can trigger the bot. Bots can't.

## Files

The bot was first called Helios, so file paths, secret names and `HELIOS_*` variables still use that name.

| File                                   | Purpose                                                                           |
| -------------------------------------- | --------------------------------------------------------------------------------- |
| `../workflows/helios.yml`              | `@myjourny` reviews and replies to the bot's threads                              |
| `../workflows/ai-review-gate.yml`      | Sets `ai-review` to pending on every push                                         |
| `review-prompt.md` / `reply-prompt.md` | What the bot looks for, and how it replies                                        |
| `post-review.mjs`                      | Maps findings to diff lines; posts the review, status, reactions and summary      |
| `threads.mjs`                          | Reads earlier threads, de-duplicates, counts open blockers, fetches reply threads |
| `prompts.mjs`                          | Builds the Claude prompts                                                         |
| `*.test.mjs`                           | Unit tests: `node --test .github/helios/*.test.mjs`                               |

The workflows always load these scripts and prompts from the default branch. Changing them in a PR won't affect how that PR is reviewed, and a PR can't mark its own check green. The PR's code is only read, never installed or run.

## One-time setup

1. **GitHub App** `myjourny-review` (MyItinerary org → Settings → Developer settings → GitHub Apps):
   - Webhook: off.
   - Repository permissions: Contents **Read**, Pull requests **Read & write**, Issues **Read & write**, Commit statuses **Read & write**, Metadata **Read**.
   - Installed on `myjourny-frontend`. After changing permissions, accept them under the org's installed apps.
2. **Repo secrets** (Settings → Secrets and variables → Actions):
   - `HELIOS_APP_ID`
   - `HELIOS_PRIVATE_KEY`: the full .pem contents
   - `CLAUDE_CODE_OAUTH_TOKEN`: from `claude setup-token`
3. **Ruleset on `main`:** require the `ai-review` status check, with the myjourny-review App as its source.

To change models, edit `HELIOS_MODEL` (reviews) and `HELIOS_REPLY_MODEL` (replies) in `helios.yml`.

To add the bot to another repo:

- Copy both workflows and `.github/helios/`.
- Install the App there and add the same secrets.
- Add the ruleset.
- Adapt `review-prompt.md` to that repo's stack.
