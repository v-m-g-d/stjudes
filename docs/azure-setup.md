# Azure Setup Notes

## Cost guardrails
- Create Azure Budget alerts at £10, £25, and £50.
- Enable Application Insights sampling.
- Start with one region (recommended: UK South).

## Resource plan
- Static Web App: Free tier for prototype.
- Function App: Consumption plan.
- Storage Account: Standard LRS + Table service.
- Application Insights: basic telemetry with capped retention.

## Environment variables (API)
- `AZURE_TABLES_CONNECTION_STRING`
- `ADMIN_EMAILS` (comma-separated list of moderator/admin email addresses)
- `TABLE_USERS`
- `TABLE_THREADS`
- `TABLE_COMMENTS`
- `TABLE_NEWS`
- `TABLE_PLANS`

## Moderation authorization
- Approve endpoints for threads/comments require admin privileges.
- In local development (`localhost`), moderation actions are allowed for easier testing.
- In Azure, only users whose email exists in `ADMIN_EMAILS` can approve content.

## Domain strategy
- Use `azurestaticapps.net` URL for prototype.
- Add custom domain after MVP sign-off.
