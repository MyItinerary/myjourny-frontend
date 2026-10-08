# MyJourny Review: PR review bot

Comment `@myjourny` on any pull request (in the conversation or on a line of the diff). The bot posts as **myjourny-review[bot]** and will:

1. React 👀 to your comment.
2. Review the PR with Claude, using [review-prompt.md](review-prompt.md) and the rules in `AGENTS.md` / `CONTRIBUTING.md`.
3. Post its findings as one review with inline comments (🔴 blocker, 🟡 should fix, 🔵 nit).
4. React 🚀 (keeping 👀, so your comment shows both) and post a summary with the reviewed commit, duration and status. Findings that can't be anchored to a diff line go in the summary under "Other notes".

If something breaks, it adds 😕 and posts a "MyJourny Review Failed" summary with a link to the run. Mention it again to re-review the latest push.

Only repo owners, members and collaborators can trigger it. Bots can't.

The bot was first called Helios, so file paths, secret names and `HELIOS_MODEL` still use that name.

## Files

| File                      | Purpose                                                              |
| ------------------------- | -------------------------------------------------------------------- |
| `../workflows/helios.yml` | Trigger, 👀 reaction, checkouts, Claude run                          |
| `review-prompt.md`        | What the bot looks for and how it reports                            |
| `post-review.js`          | Maps findings to diff lines, posts the review, reactions and summary |
| `post-review.test.mjs`    | Unit tests: `node --test .github/helios/*.test.mjs`                  |

The workflow always loads `review-prompt.md` and `post-review.js` from the default branch. Changing them in a PR won't affect how that PR is reviewed. The PR's code is only read, never installed or run.

## One-time setup

1. **Create the GitHub App** (MyItinerary org → Settings → Developer settings → GitHub Apps → New).
   - Name: `myjourny-review` (the existing App; the trigger is `@myjourny` whatever the App is called). Homepage: the repo URL.
   - Webhook: untick **Active**.
   - Repository permissions: Contents **Read**, Pull requests **Read & write**, Issues **Read & write**, Metadata **Read**.
   - Create it, note the **App ID**, and generate a **private key** (.pem).
   - Install the App on `myjourny-frontend`.
2. **Get a Claude token**: run `claude setup-token` locally (uses your Claude subscription).
3. **Add the repo secrets** (repo → Settings → Secrets and variables → Actions):
   - `HELIOS_APP_ID`
   - `HELIOS_PRIVATE_KEY`: the full .pem contents
   - `CLAUDE_CODE_OAUTH_TOKEN`

To change the model, edit `HELIOS_MODEL` in the workflow.

To add the bot to another repo, copy `.github/workflows/helios.yml` and `.github/helios/`, install the App there and add the same secrets. Then adapt `review-prompt.md` to that repo's stack.
