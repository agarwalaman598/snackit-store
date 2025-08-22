This repository contains Snack Attax (formerly SnackIT).

Quick guide: push this repo to GitHub and configure a Render service.

1) Create a GitHub repo
- On GitHub, create a new repository (name it e.g. `snackit-store`).
- Follow the instructions to push existing repository:

  git init
  git add .
  git commit -m "Initial"
  git branch -M main
  git remote add origin https://github.com/<your-username>/<repo>.git
  git push -u origin main

2) GitHub Actions CI
- A workflow is added at `.github/workflows/ci.yml`. It runs typecheck and build on pushes to `main`.
- Optional Playwright steps are gated behind the `RUN_PLAYWRIGHT` env variable.

3) Deploy on Render (recommended)
- Create a new Web Service on Render (Connect your GitHub repo) or use manual deploy.
- Add environment variables (very important):
  - DATABASE_URL
  - SESSION_SECRET (required in production)
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - ADMIN_EMAILS (comma-separated, without surrounding quotes)
  - DIAG_TOKEN (optional) — a secret token to call the protected debug endpoint
- If you want CI to trigger a Render deploy automatically, add these GitHub secrets:
  - RENDER_API_KEY (your Render API key)
  - RENDER_SERVICE_ID (the service id from Render)

4) Quick test after deploy
- Visit the deployed URL.
- (If DIAG_TOKEN set) run: 

  curl -i -H "x-diag-token: <DIAG_TOKEN>" "https://<your-deploy>/api/debug/admin-emails-protected"

5) Notes & troubleshooting
- If login fails on deploy, verify GOOGLE_CLIENT_ID/SECRET and that your OAuth redirect is set to `https://<your-deploy>/api/auth/google/callback`.
- If admin login fails, ensure `ADMIN_EMAILS` is configured correctly (no surrounding quotes) or use DIAG_TOKEN to inspect masked list.

If you want, I can prepare the GitHub remote and commit the final repo for you — provide your GitHub repo URL and I will create the push commands you can run locally.
