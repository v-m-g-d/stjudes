# St Jude's Community Hub - Deployment Checklist

## 1) Local and Git readiness
- [ ] Confirm your deployment branch is up to date and pushed.
- [ ] Confirm `main` exists on origin (`git ls-remote --heads origin main`).
- [ ] Confirm default branch is `main` (`gh repo view --json defaultBranchRef -q .defaultBranchRef.name`).
- [ ] Confirm your GitHub account has `WRITE` (or higher) (`gh repo view --json viewerPermission -q .viewerPermission`).
- [ ] If using an Enterprise Managed User account, use a personal GitHub account for personal repos.
- [ ] Confirm builds pass:
  - [ ] `npm run build -w api`
  - [ ] `npm run build -w web`
- [ ] Confirm `staticwebapp.config.json` exists at repo root.

## 2) Azure prerequisites
- [ ] Azure CLI installed and signed in.
- [ ] Correct tenant and subscription selected.
- [ ] Target region chosen (prefer `uksouth`; fallback `westeurope` if SWA creation fails by region availability).
- [ ] GitHub PAT ready (needed for automated SWA GitHub hookup).

## 3) Required app settings
- [ ] `AZURE_TABLES_CONNECTION_STRING`
- [ ] `ADMIN_EMAILS` (comma-separated moderator/admin emails)
- [ ] `TABLE_USERS`
- [ ] `TABLE_THREADS`
- [ ] `TABLE_COMMENTS`
- [ ] `TABLE_NEWS`
- [ ] `TABLE_PLANS`

## 4) Deploy resources
- [ ] Create resource group.
- [ ] Create storage account.
- [ ] Create table storage tables (`Users`, `Threads`, `Comments`, `News`, `Plans`).
- [ ] Create Static Web App linked to GitHub repo and branch.
- [ ] If SWA GitHub linkage fails from CLI/portal, use `.github/workflows/swa-deploy.yml` with `AZURE_STATIC_WEB_APPS_API_TOKEN` secret.
- [ ] Apply app settings to Static Web App.

## 5) Post-deploy validation
- [ ] Site loads on `azurestaticapps.net` URL.
- [ ] Forum/News/Plans lists load from API.
- [ ] Auth works (`/.auth/login/aad`).
- [ ] Posting creates pending items.
- [ ] Admin can approve pending thread/comment.
- [ ] Non-admin gets clear moderation permission message.

## 6) Cost and safety controls
- [ ] Add budget alerts (£10 / £25 / £50).
- [ ] Confirm Application Insights sampling/retention settings.
- [ ] Keep prototype domain first, add custom domain later.

## 7) One-shot script
- [ ] Edit placeholders in `azure_one_shot_deploy.ps1`.
- [ ] Run script in PowerShell.
- [ ] Re-run post-deploy validation.

## 8) PR flow sanity checks
- [ ] Feature branch contains at least one commit ahead of `main` before creating PR.
- [ ] Create PR with explicit base/head if auto-fill fails:
  - [ ] `gh pr create --base main --head <feature-branch> --title "..." --body "..."`

## 9) Git author identity sanity check
- [ ] Confirm Git author identity before committing:
  - [ ] `git config --global user.name "Your Name"`
  - [ ] `git config --global user.email "you@example.com"`
- [ ] Verify identity:
  - [ ] `git config --get user.name`
  - [ ] `git config --get user.email`
- [ ] If the latest commit used the wrong author:
  - [ ] `git commit --amend --reset-author`
