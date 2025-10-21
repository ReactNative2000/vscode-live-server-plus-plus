CI & Local test instructions
===========================

This file documents how to reproduce the checks run in the development container.

1) ORCID encryption check

Generate a 32-byte base64 key and run the check script (uses the server's sqlite3):

```bash
KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
ORCID_TOKEN_KEY="$KEY" NODE_PATH=./server/node_modules node test/check_orcid_encryption.js
```

The script inserts an encrypted token into `server/lspp.db` and decrypts it to validate the AES-256-GCM helpers in `server/index.js`.

2) Playwright E2E

Start a static server serving `docs/` on port 8080 (used by tests) and ensure the main server runs on 3010 for ORCID endpoints, then run tests from `test/playwright`:

```bash
# serve docs (background)
npx http-server docs -p 8080 --silent &

# start main server (in another terminal or background)
PORT=3010 node server/index.js &

# run playwright from the test folder (it has its own @playwright/test install)
cd test/playwright && npx playwright test --config ../../playwright.config.js
```

Notes
- The repo had `npm audit` advisories. I ran `npm audit fix --force` in `server/` and at the repo root to reduce advisories. The server-side advisories are cleared; there are remaining advisories in dev/test tooling (mocha/readdirp/micromatch/minimist) which require updating/removing dev/test packages.
- The branch in this PR includes small devDependency bumps (cpx, vscode, server/hospital mocha). These reduced some transitive vulnerabilities. Remaining advisories are documented in the PR description.