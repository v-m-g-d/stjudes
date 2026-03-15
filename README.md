# St Jude's Community Hub

MVP scaffold for a low-traffic community website with sections for Forum, News, and Plans.

## Stack
- Frontend: React + TypeScript + Vite (`web`)
- API: Azure Functions v4 + TypeScript (`api`)
- Data target: Azure Table Storage
- Hosting target: Azure Static Web Apps

## Quick start
1. Install dependencies:
   - `npm install -w web`
   - `npm install -w api`
2. Run web app locally:
   - `npm run dev -w web`
3. Build both projects:
   - `npm run build`

## API endpoints (MVP)
- `GET /api/threads`
- `POST /api/threads`
- `GET /api/threads/{threadId}/comments`
- `POST /api/threads/{threadId}/comments`
- `GET /api/news`
- `POST /api/news`
- `GET /api/plans`
- `POST /api/plans`

## Notes
- Current API uses an in-memory fallback data layer to keep local startup simple.
- Azure Table Storage wiring is prepared in `api/src/data/store.ts` and can be enabled with `AZURE_TABLES_CONNECTION_STRING`.
