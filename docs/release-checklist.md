# MVP Release Checklist

- [x] Frontend builds successfully (`npm run build -w web`).
- [x] API builds successfully (`npm run build -w api`).
- [x] Forum endpoints return expected responses.
- [x] News and Plans endpoints support list/create actions.
- [x] Posting requires authenticated users in SWA route rules.
- [x] Basic accessibility checks completed (keyboard + headings + contrast).
- [x] Budget alerts configured in Azure.
- [x] App Insights sampling and retention configured.
- [x] Rollback plan documented (redeploy previous successful build).

## Rollback Procedure

If a deployment causes issues:

1. **Identify last good commit**: `git log --oneline -5`
2. **Revert the bad merge**: `git revert <bad-commit-sha> --no-edit`
3. **Push revert to main**: `git push origin main`
4. **SWA redeploys automatically** via the GitHub Actions workflow.
5. **If urgent**: re-run a previous successful workflow run:
   - `gh run list --workflow "Azure Static Web Apps Deploy" --branch main --limit 5`
   - `gh run rerun <run-id>`
6. **Verify** the site loads correctly after rollback.
