# Cost Estimate — St Jude's Community Hub

Budget: £115/month Azure credits  
Target: under £15/month typical usage  

## Per-Service Breakdown

| Service | Tier/SKU | Low (£/mo) | Expected (£/mo) | High (£/mo) | Notes |
|---|---|---|---|---|---|
| **Static Web Apps** | Free | £0 | £0 | £0 | Includes custom domain, SSL, 100GB bandwidth |
| **Azure Functions** | Consumption | £0 | £0 | £0.50 | First 1M executions/month free; ~50 users ≈ <10K calls |
| **Table Storage** | Standard LRS | £0.03 | £0.05 | £0.10 | <1GB data, <100K transactions/month |
| **Application Insights** | Pay-as-you-go | £0 | £0 | £2.00 | First 5GB/month free; sampling enabled to stay under |
| **Azure Budget** | N/A | £0 | £0 | £0 | Free feature |
| **DNS / Custom Domain** | External (Porkbun) | £0.80 | £0.80 | £0.80 | ~$1/year for .uk domain, not Azure cost |
| | | | | | |
| **Total Azure** | | **£0.03** | **£0.05** | **£2.60** | |

## Scenario Modelling

### Low (10 active users)
- ~500 page views/month
- ~200 API calls/month
- ~50 table transactions/month
- App Insights: <100MB ingestion
- **Cost: ~£0.03/month**

### Expected (50 active users)
- ~2,500 page views/month
- ~1,000 API calls/month
- ~500 table transactions/month
- App Insights: <500MB ingestion
- **Cost: ~£0.05/month**

### High (200 active users, growth scenario)
- ~10,000 page views/month
- ~5,000 API calls/month
- ~2,000 table transactions/month
- App Insights: ~2GB ingestion
- **Cost: ~£2.60/month**

## Application Insights Sampling Guidance

Current configuration in `api/host.json`:
- Sampling enabled with `excludedTypes: Request`
- Recommended retention: **30 days** (set via App Insights resource)
- If ingestion exceeds 5GB/month free tier, reduce sampling rate or add `includedTypes` filter

## Budget Alert Thresholds

| Alert | Threshold | Action |
|---|---|---|
| Info | £10/month | Review usage patterns |
| Warning | £25/month | Investigate unexpected traffic or misconfiguration |
| Critical | £50/month | Immediate investigation; consider disabling non-essential logging |

## Key Cost Controls

1. **SWA Free tier** — no upgrade needed unless enterprise features required
2. **Functions Consumption** — pay only for executions; no idle cost
3. **Table Storage** — cheapest Azure persistence option for structured data
4. **App Insights sampling** — prevents runaway logging costs
5. **Budget alerts** — automated notification before overspend
