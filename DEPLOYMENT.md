# Deployment notes — branch preview for feature/payments-admin

This doc explains how to deploy the `feature/payments-admin` branch:

Targets chosen:
- Static `docs/` → GitHub Pages (branch preview)
- Node server `server/` → Render staging (branch deploy)

1) Publish `docs/` to GitHub Pages automatically from the branch

- A GitHub Action `/.github/workflows/deploy-docs-feature-payments-admin.yml` is included and triggers on push to `feature/payments-admin`. It publishes the `./docs` folder to the `gh-pages` branch using the built-in `GITHUB_TOKEN`.

What you should verify after pushing the branch:
- In GitHub → Settings → Pages, ensure the site is configured to serve from the `gh-pages` branch.
- The workflow will publish `docs/` from this branch on each push.

2) Deploy the Node server to Render (branch preview / staging)

Two ways to create the Render service:

- Manual (recommended):
  1. Login to render.com and create a new Web Service.
 2. Connect your GitHub repo `ReactNative2000/vscode-live-server-plus-plus`.
 3. Set "Branch" to `feature/payments-admin`.
 4. Set Build Command to `npm install` and Start Command to `node index.js`.
 5. Add Environment Variables (do NOT commit secrets to the repo):
     - ADMIN_TOKEN (use a strong value, do not use `devtoken`)
     - STRIPE_SECRET (if you plan to test Stripe)
     - STRIPE_WEBHOOK_SECRET (for webhook verification)
     - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM
     - TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
  6. Create the service — Render will build and deploy from the branch.

- Using `render.yaml` (Infra as Code):
  If you prefer, Render can accept the included `render.yaml` file to create the service via the Render dashboard or API. The file describes a web service named `vscode-live-server-plus-plus-staging` using the `feature/payments-admin` branch.

3) Quick local commands

Push the branch (ensure your branch has the new workflow and render.yaml) and trigger the GitHub Action and Render build:

```bash
git checkout feature/payments-admin
git add .
git commit -m "chore(deploy): add branch preview deploy workflow + render.yaml"
git push origin feature/payments-admin
```

4) Security notes
- Never place secrets in the repo. Use Render's environment variables and GitHub Actions secrets for any tokens.
- Replace `devtoken` before public deployment. Use a long random ADMIN_TOKEN for staging/production.

If you'd like, I can:
- Create the GitHub Actions workflow commit now (done) — it will run when you push this branch.
- Attempt to create the Render service programmatically (requires Render API key) or you can follow the manual UI steps above.
