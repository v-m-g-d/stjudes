# Upgrade Path — St Jude's Community Hub

This document covers what to do if adoption grows beyond the current MVP architecture, without overengineering now.

## Current Architecture (MVP)

| Layer | Technology | Limit |
|---|---|---|
| Frontend | Azure Static Web Apps (Free) | 100GB bandwidth/month |
| API | Azure Functions (Consumption) | 1M executions/month free |
| Data | Azure Table Storage (Standard LRS) | Virtually unlimited at low cost |
| Auth | SWA built-in (AAD + GitHub) | Unlimited users |
| Monitoring | Application Insights (5GB free) | 5GB ingestion/month |

## Trigger Points and Upgrade Actions

### 1. Data Complexity (>10K entities or need for joins/queries)

**Trigger**: Table Storage query limitations become painful (no secondary indexes, no joins, limited filtering).

**Action**: Migrate to **Azure Cosmos DB for Table** (API-compatible with Table Storage).
- Same SDK (`@azure/data-tables`) works with Cosmos DB Table API
- Change only the connection string
- Adds global distribution, secondary indexes, and richer querying
- Cost: starts at ~£20/month for serverless tier

### 2. Traffic Growth (>1,000 daily active users)

**Trigger**: SWA bandwidth or Functions execution counts approach free tier limits.

**Action**:
- Upgrade SWA to **Standard tier** (~£7/month) for higher limits and staging environments
- Consider adding **Azure CDN** in front of static assets
- Functions Consumption plan scales automatically; no action needed unless cold-start latency is noticeable

### 3. Search Requirements

**Trigger**: Client-side filtering becomes slow with >500 items.

**Action**: Add **Azure Cognitive Search** (Free tier: 3 indexes, 50MB storage) or implement server-side pagination with Table Storage continuation tokens.

### 4. Rich Content / Media

**Trigger**: Users or admins want to upload images, documents, or video.

**Action**:
- Add **Azure Blob Storage** container for media uploads
- Add an upload API endpoint with size validation
- Serve via SWA static file serving or Blob Storage public container with CDN

### 5. Stronger Identity Controls

**Trigger**: Need for user profiles, roles beyond admin, or GDPR-compliant user management.

**Action**:
- Add **Azure AD B2C** for full identity management (50K free MAU)
- Implement role-based access with custom claims
- Store user profiles in a Users table with explicit role assignments

### 6. Real-Time Features

**Trigger**: Users want live updates (new comments appear without refresh, notifications).

**Action**:
- Add **Azure SignalR Service** (Free tier: 20 concurrent connections, 20K messages/day)
- Integrate with Functions via SignalR bindings
- Push new content events to connected clients

### 7. Email Notifications

**Trigger**: Admins want to notify residents of new news or plan updates.

**Action**:
- Add **Azure Communication Services** (Email: first 100 emails/day free)
- Or integrate with a free-tier transactional email service (SendGrid free tier: 100 emails/day)

## Migration Safety Rules

1. **Never migrate data stores without a tested backup/restore plan**
2. **Run new and old systems in parallel during migration**
3. **Use feature flags for gradual rollout of new capabilities**
4. **Monitor costs for 1 billing cycle after any upgrade before committing**
5. **Keep the deploy script updated with any new resources**
