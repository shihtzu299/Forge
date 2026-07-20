# Project Persistence

## Purpose

Project Persistence gives every Forge project a stable URL and stores its idea,
Project DNA, validated workspace analysis, and successful provider mode in
PostgreSQL. Projects can be reopened after refresh without moving database
access into the browser.

## URL Lifecycle

`POST /api/projects` validates the initial idea, creates a `Project`, and
returns `/projects/[projectId]`. The root creation experience navigates to that
URL only after the database write succeeds. The dynamic project page loads the
record on the server and returns `notFound()` for invalid or unknown IDs.

## Data Model

The `Project` table stores scalar identity fields plus nullable PostgreSQL JSONB
for Project DNA and analysis. `analysisMode` records the provider used for the
stored analysis. Timestamps support future listing and ordering without adding
those features now.

Project DNA is saved before analysis begins, so a failed provider request does
not discard the completed foundation. Analysis, mode, and generated title are
written only after the orchestrator returns a fully validated response.

## Server Boundary

Prisma Client and the PostgreSQL adapter live under `src/lib/db` and are only
imported by server repositories and Route Handlers. Browser code receives
project IDs and validated view data, never a database client or connection
string. The Prisma singleton is created lazily and reused during development.

The project creation endpoint requires same-origin JSON, applies a body limit,
and returns safe errors. The existing workspace analysis endpoint now requires
a validated project ID and persists through an injected repository boundary.
Its provider selection, orchestrator, retry policy, and response contract are
unchanged.

## Stored JSON Validation

Database JSON is treated as untrusted runtime data. On every reopen:

- Project DNA is parsed with `projectDNASchema`.
- Analysis is parsed with `forgeWorkspaceAnalysisSchema`.
- Provider mode is parsed as `mock | gpt`.
- Analysis without a valid provider mode is discarded.
- Invalid values never reach client rendering and produce only a safe warning.

The schemas are not weakened for persistence.

## Database Commands

Configure a PostgreSQL connection in `.env.local`:

```env
DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
```

Then run:

```sh
npm run db:generate
npm run db:migrate:deploy
```

`postinstall` generates Prisma Client for deployments. The Prisma CLI uses a
non-connecting localhost placeholder only when `DATABASE_URL` is absent so
client generation and static checks can run; application database access still
fails closed without a real server environment value.

## Verification

`npm run verify:project-persistence` confirms stable ID handling, valid stored
JSON parsing, malformed-analysis rejection, provider metadata requirements, and
non-escape of invalid payloads without connecting to PostgreSQL or any AI
provider.

The migration could not be applied in this milestone workspace because the
local `DATABASE_URL` value is empty. Apply it after configuring the intended
PostgreSQL database.
