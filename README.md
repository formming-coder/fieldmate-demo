# fieldmate-demo

Fieldmate AI mobile web application with enterprise-ready architecture on React + TypeScript + Vite, backed by Cloudflare Workers, D1, and R2.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

## Enterprise Architecture

- UI/UX remains unchanged while architecture is production-oriented.
- Authentication uses Microsoft Entra in production mode with fallback development mode.
- Authorization uses explicit RBAC roles: `Administrator`, `Manager`, `Reviewer`, `Officer`, `Viewer`.
- API access is standardized via `src/services/api/apiService.ts` and `src/services/api/endpoints.ts`.
- Worker API provides enterprise REST contracts and audit log scaffolding.
- D1 schema includes core operational entities and extensibility tables for audit/versioning/sharing.

## Environment Variables

Primary (enterprise naming):

- `VITE_API_URL`
- `VITE_UPLOAD_BASE_URL`
- `VITE_MS_CLIENT_ID`
- `VITE_MS_AUTHORITY`
- `VITE_MS_REDIRECT_URI`
- `VITE_MS_SCOPES`
- `VITE_CLOUDFLARE_ENV`

Compatibility aliases are still supported:

- `VITE_API_BASE_URL`
- `VITE_R2_UPLOAD_BASE_URL`
- `VITE_ENTRA_CLIENT_ID`
- `VITE_ENTRA_AUTHORITY`
- `VITE_ENTRA_REDIRECT_URI`
- `VITE_ENTRA_SCOPES`

## Backend API Contracts

Base path: `/api`

- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`
- `GET /user/profile`
- `GET /properties`
- `POST /properties`
- `GET /properties/:id`
- `PUT /properties/:id`
- `DELETE /properties/:id`
- `GET /properties/:id/versions`
- `POST /properties/:id/versions/:versionId/restore`
- `GET /properties/:id/timeline`
- `POST /photos/upload`
- `POST /assessment`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `PATCH /notifications/read-all`
- `DELETE /notifications/:id`
- `GET /shared`
- `POST /ai/ocr`
- `POST /ai/property-summary`
- `POST /ai/comparable-recommendation`
- `POST /ai/price-suggestion`
- `POST /ai/risk-analysis`
- `POST /ai/image-caption`
- `POST /audit/logs`

## Worker Deployment

1. Configure `workers/wrangler.toml` values for D1, R2, CORS, and JWT settings.
2. Apply D1 schema from `workers/schema.sql`.
3. Deploy Worker:

```bash
cd workers
npx wrangler deploy
```

## Folder Guide

- `src/lib/auth`: auth runtime, storage, RBAC policy.
- `src/services/api`: API client abstraction and endpoint contracts.
- `src/services/ai`: AI service abstraction (mockable/replaceable).
- `src/repositories`: domain data access used by existing screens.
- `workers/src`: Cloudflare Worker API handlers.
- `workers/schema.sql`: D1 schema and indexes.

