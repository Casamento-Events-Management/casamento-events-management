---
name: supabase (database and backend)
description: Use this skill for any work involving Supabase in the Casamento project — database schema and migrations, RLS policies, the Supabase client SDK, admin authentication and sessions, JWT refresh handling, protecting dashboard routes, server-side webhook writes, and Supabase security. Trigger on mentions of Supabase, auth, login, session, JWT, RLS, policies, migrations, service role, admin access, or protected pages.
---

# Supabase for Casamento

## Read these first
1. **Read `.agents/.rules/@vercel-deployment.md` before writing or adding any server-side code** (route handlers, API routes, server actions, middleware/proxy, cron). That file defines how serverless functions must be used on our Vercel plan. Follow it over anything in this skill if they conflict. Do not assume function limits from memory; use what that file says.
2. Search and read the **current official Supabase docs** before implementing. SDK syntax, Auth settings names, and plan limits change. Never copy API shapes from memory. Check at minimum: `@supabase/supabase-js`, `@supabase/ssr` (Next.js setup), Auth settings (signups, JWT expiry, sessions), RLS, and the Supabase CLI migration workflow.
3. Check the installed Next.js version. Some versions rename or change `middleware` (for example a `proxy` file convention). Use whatever the installed version supports.

## Development context
- I am using 2 different Supabase project for this project. One is for dev and one is prod. The .env.local holds the key for dev supabase project while .env.production holds the key for prod supabase project. 

## Architecture context
- **Monolith**: one Next.js app on Vercel (pages, server components, server actions, route handlers). Supabase provides Postgres, Auth, and optionally Storage. No separate backend service.
- **Serverless function budget is limited.** Every route handler, API route, and some server-side features count toward it. Therefore:
  - Prefer **server components** and **server actions** that call Supabase directly over creating one API route per resource.
  - Do not build a REST layer in front of Supabase. The Supabase client already is the data API, and RLS is the authorization layer.
  - Consolidate: one webhook route handler per provider (`/api/webhooks/paypal`, `/api/webhooks/dragonpay`) and one for the public inquiry/booking submit. Avoid adding new route handlers without checking `@vercel-deployment.md`.
  - Keep functions short and fast. Do the minimum work in a webhook (verify, update, send), return quickly.
  - Reuse one Supabase client per request. Do not create clients in loops.

## Supabase clients: which one, where
| Client | Where | Key | RLS applies? |
|---|---|---|---|
| Browser client (`createBrowserClient`) | Client components | anon (publishable) key | Yes |
| Server client (`createServerClient` with cookies) | Server components, server actions, route handlers acting for a logged-in admin | anon key + user's session cookie | Yes, as that user |
| Admin client (`createClient` with service role) | **Only** inside webhook handlers and trusted server-only code | service role key | **No, bypasses RLS** |

Rules:
- The anon key may be public (`NEXT_PUBLIC_`) because RLS protects data. The **service role key must never** be exposed: no `NEXT_PUBLIC_` prefix, never imported into client components, never logged, never returned in responses. Put the admin client in a server-only module (`import 'server-only'`).
- Default to the server client (RLS applies). Use the admin client only when there is no user session, such as provider webhooks, and keep its use narrow.
- Generate TypeScript types from the schema (`supabase gen types`) and use them for all queries.

## Database Migrations and Rules
- Manage the schema with the **Supabase CLI**: plain SQL migration files committed to Git. Include tables, constraints, indexes, RLS policies, views, and functions in migrations. Never change schema by hand in the dashboard without capturing it in a migration. **NEVER** do the migration on your own. Advice the user on what to do.

## Authentication model
**All dashboard pages are private. Unauthenticated visitors must never see them.** The public marketing pages are separate and stay public.

### No registration page
- In Supabase Auth settings, **disable new user signups**. Do not build any sign-up UI or route.
- Admin accounts are created only by an existing admin or the project owner: either from the Supabase dashboard, or via a server-side **invite** using the admin client (`auth.admin.inviteUserByEmail` or equivalent; confirm current API). The invite is the "admin approval" step.
- Signups being disabled must also hold for any OAuth provider that is enabled. Verify this by testing, not by assumption.

### Authorization is separate from authentication
- Being able to log in (even with a company-domain email) does **not** grant access. Maintain an `admin_profiles` table: `user_id` (FK to `auth.users`), `role`, `is_active`, `created_at`. Every dashboard route, server action, and RLS policy must require an **active** row.
- Deactivating someone = set `is_active = false`. This takes effect on their next request without deleting the account.
- Never use `user_metadata` for authorization (users can edit it). Use the `admin_profiles` table, or `app_metadata` set only by the server.

### Login method
- Default: **email + password** via Supabase Auth. Optionally add TOTP MFA for the dashboard (recommended because it exposes payment data).
- A Hostinger-hosted mailbox is not an OAuth identity provider. OAuth2 login (Google, Microsoft, etc.) only works if the admin's email is actually an account at that provider.
- Configure the **redirect URL allowlist** in Supabase Auth to only the exact production, staging, and local URLs. No wildcards that match arbitrary domains.
- Configure **custom SMTP** (Resend SMTP with the verified domain) for invite and password-reset emails. Supabase's built-in sender is rate-limited and not for production.

### Sessions and JWT
- **Multiple active sessions per user are allowed.** This is Supabase's default (each login gets its own session and refresh token). Do **not** enable any single-session or session-limit setting.
- Set **JWT expiry to 900 seconds (15 minutes)** in Auth settings. Refresh token rotation stays on.
- **"JWT interceptor" = the session refresh layer, not custom code per request:**
  - In Next.js, use `@supabase/ssr` with a **middleware/proxy** that runs `supabase.auth.getUser()` on protected paths so the session cookie is refreshed and rewritten on every request. Follow the official `@supabase/ssr` Next.js guide exactly for cookie handling.
  - In the browser, `supabase-js` auto-refreshes tokens. Use `onAuthStateChange` to react to `TOKEN_REFRESHED` and `SIGNED_OUT` events (for example redirect to login on sign-out). Do not hand-roll a fetch interceptor that refreshes tokens; if a wrapper is needed for non-Supabase fetches, read the current session from the client and let the SDK refresh.
- On the server, **always use `supabase.auth.getUser()`** (verifies the JWT with Auth) for authorization decisions. Do **not** trust `getSession()` on the server, since it reads unverified cookie data.

### Protecting pages
- Layered, not single-point:
  1. Middleware/proxy: if no valid user on `/admin/*` (or whatever the dashboard prefix is), redirect to `/login`. Treat this as a convenience layer only.
  2. Server components / server actions / route handlers: re-check `getUser()` **and** the active `admin_profiles` row. Never rely only on middleware.
  3. **RLS**: the real enforcement. Even if app code is wrong, the database refuses.
- The login page itself is the only public route under the dashboard area. No account enumeration: use generic error messages. Apply rate limiting on login (Supabase Auth rate limits; confirm current values) and consider reCAPTCHA on it.
- Set `Cache-Control: no-store` (or use dynamic rendering) for authenticated pages so private data is not cached.

## Row Level Security (non-negotiable)
- **Enable RLS on every table in the `public` schema**, including new ones. A table without RLS is publicly readable/writable through the anon key.
- Default deny: no policy means no access. Write explicit policies per operation (select, insert, update, delete) and per role.
- Admin policies check an **active admin** via the `admin_profiles` table, using a `security definer` helper function such as `is_active_admin()`; pin `search_path` on it (`set search_path = ''`) and keep it minimal.
- Use `(select auth.uid())` style subqueries in policies for performance; check current docs for the recommended pattern.
- **Public form writes** (inquiries, booking creation) do not need open `insert` policies on the anon key if they go through a server action or route handler that verifies reCAPTCHA and uses the admin client. Prefer that over `insert` policies for `anon`. If `anon` insert is ever used, constrain it tightly (column checks, no setting status/amount-paid fields).
- `agreed_total_centavos`, payment `status`, `paid_at`, and receipt fields must be writable only by (a) active admins via dashboard sessions (total only) or (b) verified webhook handlers via the admin client (payment status). Never from public input.
- Test policies: write tests or manual checks as `anon`, as a logged-in non-admin, as an inactive admin, and as an active admin. Confirm each can and cannot do what is expected.

## Security checklist
- [ ] Signups disabled; no sign-up UI exists
- [ ] Service role key only in server-only code and Vercel server env vars; never `NEXT_PUBLIC_`
- [ ] RLS enabled on all `public` tables; policies tested for anon, non-admin, inactive admin, admin
- [ ] Dashboard access requires an active `admin_profiles` row at every layer
- [ ] JWT expiry 900s; refresh via `@supabase/ssr` middleware; server uses `getUser()`
- [ ] Auth redirect URLs restricted to exact known URLs
- [ ] Custom SMTP configured; invite and reset emails work from the verified domain
- [ ] Webhook handlers verify provider signatures **before** touching the database, then use the admin client plus the idempotent SQL function
- [ ] No secrets, tokens, or full webhook payloads in logs or client responses; store raw payloads in the database for audit instead
- [ ] Public submit endpoints: reCAPTCHA verified server-side, input validated (for example with zod), amount and rate limits enforced
- [ ] Views use `security_invoker`; `security definer` functions set `search_path`
- [ ] Storage buckets (if used) are private by default with explicit policies
- [ ] Every dashboard write logs `user_id`
- [ ] Secrets rotated if ever exposed; `.env*` files never committed

## Working rules for the agent
- Before adding a table, write its RLS policies in the same migration.
- Before adding a route handler, check `.agents/.rules/@vercel-deployment.md` and ask whether a server component or server action can do the job instead.
- Before using the admin client, state why RLS cannot be used there.
- When unsure about a Supabase setting name or API, search the official docs; do not guess.
- Do not introduce additional data-access layers or ORMs; use `supabase-js` and SQL migrations.
- Do not run migration on your own.
