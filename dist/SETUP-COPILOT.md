Setting up GitHub and GitHub Copilot (step-by-step)

This document walks through signing into GitHub and enabling GitHub Copilot in VS Code and in the Codespace environment.

1) Ensure `gh` (GitHub CLI) is authenticated (optional but helpful)

- Check status:

```bash
gh auth status
```

- If not logged in, sign in with the web flow:

```bash
gh auth login --web
```
```

2) Install VS Code extensions (GUI or CLI)

- Recommended extensions (this repo recommends them automatically via `.vscode/extensions.json`):
  - GitHub Copilot (publisher: GitHub)
  - GitHub Pull Requests and Issues (publisher: GitHub)

- Install via CLI:

```bash
# If 'code' CLI is available
code --install-extension GitHub.copilot
code --install-extension GitHub.vscode-pull-request-github
```

3) Sign in to GitHub from VS Code (GUI)

- Open Command Palette (Ctrl/Cmd+Shift+P) and run: `Accounts: Sign in to GitHub` or `GitHub: Sign in`.
- A browser window opens. Complete the OAuth flow.
- Back in VS Code you should see your account in the Accounts menu (lower-left).

4) Sign in to GitHub Copilot

- Install the GitHub Copilot extension if not already installed.
- After install, a Copilot sign-in prompt typically appears. If not, open Command Palette and run: `GitHub Copilot: Sign in`.
- Complete the browser OAuth flow and accept permissions.

5) Codespaces / Remote environments

- If you're in a Codespace, the web sign-in is similar but your browser may redirect through `github.dev` or `app.github.dev` domains. Allow pop-ups and complete OAuth.
- If you need to persist credentials across sessions, ensure `GITHUB_TOKEN` or Codespace tokens are not overwritten by scripts. The `gh` CLI handles auth well in remote/devcontainers.

6) Troubleshooting tips

- If Copilot reports "not signed in" after signing into GitHub:
  - Restart VS Code.
  - Sign out of Copilot (extension pane) and sign in again.
  - Check `gh auth status` — if CLI shows logged in, try `gh auth logout` then `gh auth login --web` and re-run Copilot sign-in.
- If the browser flow is blocked by a popup blocker, enable popups for `github.com`.
- On Linux, check `secret-service` (gnome-keyring, libsecret) if tokens fail to persist.

7) Optional: install recommended extensions automatically

- VS Code shows a notification to install workspace recommended extensions when you open this repository. Accept it to install Copilot and PR support.

If you want, I can:
- Attempt to install the extensions here (if `code` CLI is available).
- Add a workflow to check Copilot sign-in during CI (note: OAuth in CI usually isn't possible; instead we use gh + PATs).

