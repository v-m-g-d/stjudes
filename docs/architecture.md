# Architecture Overview

## MVP topology
- Azure Static Web Apps hosts the `web` React frontend.
- Azure Functions (`api`) serves backend endpoints under `/api`.
- Azure Table Storage is the primary planned persistence layer.
- Application Insights captures diagnostics with sampling enabled.

## Functional sections
- Home: high-level hub landing content.
- Forum: threads and comments.
- News: admin-published community updates.
- Plans: development items and resident feedback context.
- Admin: moderation and publishing workflow.

## Security baseline
- Anonymous reads for public browsing.
- Authenticated writes for posting and admin flows.
- Moderation status (`isApproved`) on user-generated content.
