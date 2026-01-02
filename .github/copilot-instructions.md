# Copilot instructions for padel-api

This repo is a TypeScript Express backend that uses Supabase (service-role key) and also contains Supabase Edge Functions and SQL migrations. Keep guidance concise and project-specific.

- Project entry: `src/server.ts` — an Express app that mounts routers from `src/routes/*` and uses global middleware from `src/middleware/*`.
- Supabase client: `src/config/supabase.ts` — uses `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Use `getSupabase()` for server-side DB operations only.
- Edge functions: `supabase/functions/` — serverless functions live here; shared helpers in `supabase/functions/_shared/` (e.g. auth.ts).
- Database migrations: `supabase/migrations/` — SQL files applied via Supabase migration tooling.

Key developer commands (from `package.json`):
- `npm run dev` — run with `tsx watch src/server.ts` for live dev.
- `npm run build` — compile TypeScript (`tsc`).
- `npm run start` — run compiled output `dist/server.js`.
- `npm run typecheck` — `tsc --noEmit`.

Conventions and patterns to follow
- Routes: `src/routes/*` define route paths and attach middleware, e.g. `playersRoutes.ts` mounts `getPlayer` and `updatePlayer` with `authMiddleware`.
- Controllers: `src/controllers/*` export request handlers that use `getSupabase()` and throw `AppError` (from `src/middleware/errorHandler.ts`) on failure. Return JSON objects (e.g. `{ player }`).
- Middleware: `src/middleware` contains `auth.ts`, `validation.ts`, and `errorHandler.ts`. Use `validateBody(schema)` from `validation.ts` for Zod schema validation.
- Auth: `authMiddleware` expects `Authorization: Bearer <token>` and calls `supabase.auth.getUser(token)`. `optionalAuth` may be used for non-required auth.
- DB queries: prefer `supabase.from(...).select(...)` and `.maybeSingle()` / `.single()` as used in controllers. Whitelist fields on updates (see `playersController.whitelistFields`).

Integration notes
- The server uses the Supabase service-role key — treat it as a secret and only used on server-side code (not client/Supabase Edge Functions unless intended).
- Supabase Edge Functions under `supabase/functions/*` are separate from the Express app and may require separate deployment via the Supabase CLI.

Quick examples
- Add a route: create `src/routes/fooRoutes.ts`, export Router and use in `src/server.ts` with `app.use('/foo', fooRoutes)`.
- Controller pattern:
  - import `AuthRequest` when using authenticated users.
  - call `getSupabase()` and use `AppError` for failures.
  - return JSON responses consistently.

Files to inspect for common patterns: `src/server.ts`, `src/config/supabase.ts`, `src/middleware/*`, `src/controllers/*`, `src/routes/*`, `supabase/functions/_shared/`.

Environment variables discovered in repo:
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ALLOWED_ORIGINS`, `PORT`, `NODE_ENV`.

Notes for AI agents
- Prefer minimal, focused edits. Keep API behavior and error handling consistent with `AppError` and `errorHandler`.
- When adding database access, use `getSupabase()` and follow existing query patterns.
- Do not expose the service-role key in client code or logs. Avoid adding secrets to source files.
- No test suite found; run `npm run typecheck` and `npm run build` to validate TypeScript changes locally.

If anything here is unclear or you want additional examples (e.g., adding a Supabase Edge Function or sample migration), say what to expand.
