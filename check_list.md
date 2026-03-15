# St Jude's Community Hub - Deployment Checklist

## 1) Local and Git readiness
- [x] Confirm your deployment branch is up to date and pushed.
- [x] Confirm `main` exists on origin (`git ls-remote --heads origin main`).
- [x] Confirm default branch is `main` (`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`).
- [x] Confirm your GitHub account has `WRITE` (or higher) (`gh repo view --json viewerPermission -q .viewerPermission`).
- [x] If using an Enterprise Managed User account, use a personal GitHub account for personal repos.
- [x] Confirm builds pass:
  - [x] `npm run build -w api`
  - [x] `npm run build -w web`
- [x] Confirm `staticwebapp.config.json` exists at repo root.

## 2) Azure prerequisites
- [x] Azure CLI installed and signed in.
- [x] Correct tenant and subscription selected.
- [x] Target region chosen (prefer `uksouth`; fallback `westeurope` if SWA creation fails by region availability).
- [x] GitHub PAT ready (needed for automated SWA GitHub hookup).

## 3) Required app settings
- [x] `AZURE_TABLES_CONNECTION_STRING`
- [x] `ADMIN_EMAILS` (comma-separated moderator/admin emails)
- [x] `TABLE_USERS`
- [x] `TABLE_THREADS`
- [x] `TABLE_COMMENTS`
- [x] `TABLE_NEWS`
- [x] `TABLE_PLANS`

## 4) Deploy resources
- [x] Create resource group.
- [x] Create storage account.
- [x] Create table storage tables (`Users`, `Threads`, `Comments`, `News`, `Plans`).
- [x] Create Static Web App linked to GitHub repo and branch.
- [x] If SWA GitHub linkage fails from CLI/portal, use `.github/workflows/swa-deploy.yml` with `AZURE_STATIC_WEB_APPS_API_TOKEN` secret.
- [x] Apply app settings to Static Web App.

## 5) Post-deploy validation
- [x] Site loads on `azurestaticapps.net` URL.
- [x] Forum/News/Plans lists load from API.
- [x] Auth works (`/.auth/login/aad`).
- [x] Posting creates pending items.
- [x] Admin can approve pending thread/comment.
- [x] Non-admin gets clear moderation permission message.

## 6) Cost and safety controls
- [x] Add budget alerts (£10 / £25 / £50).
- [x] Confirm Application Insights sampling/retention settings.
- [x] Keep prototype domain first, add custom domain later.

## 7) One-shot script
- [ ] Edit placeholders in `azure_one_shot_deploy.ps1`.
- [ ] Run script in PowerShell.
- [ ] Re-run post-deploy validation.

## 8) PR flow sanity checks
- [x] Feature branch contains at least one commit ahead of `main` before creating PR.
- [x] Create PR with explicit base/head if auto-fill fails:
  - [x] `gh pr create --base main --head <feature-branch> --title "..." --body "..."`

## 9) Git author identity sanity check
- [ ] Confirm Git author identity before committing:
  - [ ] `git config --global user.name "Your Name"`
  - [ ] `git config --global user.email "you@example.com"`
- [ ] Verify identity:
  - [ ] `git config --get user.name`
  - [ ] `git config --get user.email`
- [ ] If the latest commit used the wrong author:
  - [ ] `git commit --amend --reset-author`
