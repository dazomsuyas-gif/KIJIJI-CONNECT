# Kijiji Connect project status

Last reviewed: 2026-10-22

## Current architecture

- React 19, TypeScript 7, Vite 8 single-page application.
- Node.js v24.20.0 and npm 11.19.0 are available in the current Windows environment.
- Package commands: `npm run dev`, `npm run build`, `npm run lint`, and `npm run preview`.
- UI modules include marketplace, demo checkout, locally stored content/community, language practice, illustrative travel enquiries, and a local intent-matching assistant.
- The Supabase JavaScript client and lazy browser-client scaffold are present. The Supabase package is code-split and dynamically loaded. The account screen includes email sign-up, sign-in, password recovery and update, and sign-out, wired to Supabase Auth when configuration is available.
- No backend, database migrations, server-side endpoints, automated test runner, or authenticated administrator area has been verified in the workspace.

## Verified state

- Latest known build: passed with `npm run build`; Supabase client is split from the initial bundle.
- Latest known lint: exited successfully with one non-blocking `react(set-state-in-effect)` warning in `src/components/TravelPlanningStudio.tsx`.
- No automated test script is configured in `package.json`.
- Git baseline: `9d26acb` on `main`, tracking `origin/main`.
- Local Supabase scaffold edits already present before this status update are uncommitted. They are preserved; do not discard them.
- `.env.local`, `.env`, `.env.development.local`, and `.env.production.local` were not present when checked. No environment values were printed or collected.
- The `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and legacy `VITE_SUPABASE_ANON_KEY` environment variables were checked for presence only; none was configured.
- Added `supabase/inspection/schema_report.sql`, a read-only metadata report; no Supabase project configuration or database schema export is present.

## Supabase status and blocker

It is not possible to determine from this local workspace whether the owner has a Supabase account/project or whether a remote database contains tables or data. No project URL, publishable key, connection, or schema report is available locally. Database emptiness must not be assumed.

Do not apply migrations, create or alter policies, reset a project, or inspect customer rows until the user identifies the intended Supabase project and provides a reviewed schema-only metadata report. The read-only query script is at `supabase/inspection/schema_report.sql`.

## Current customer-facing limitations

- Marketplace, community, notifications, learning progress, and enquiry records use browser-local/demo state rather than shared persistent records.
- Payment flows are simulations; no provider receives a payment request.
- Travel catalog and prices are illustrative; enquiries are not bookings or confirmations.
- The assistant uses local intent matching and does not call an AI model or WhatsApp Business API.
- Supabase authentication UI and client calls are implemented but cannot be exercised until project settings are configured. There is no verified authenticated session, role authorization, server-side order processing, or administrator dashboard.

## Immediate next action

The user must sign in to the Supabase dashboard and check whether an intended project exists. If it does, run the read-only statements in `supabase/inspection/schema_report.sql` separately in Supabase SQL Editor, inspect the metadata output, and provide the schema-only results for review. Do not provide keys, database passwords, customer data, or function source. If no project exists, create one and set its URL and public publishable/anon key in `.env.local` locally, never a service-role key.

## Files changed by the latest implementation cycle

- Added this status report, implementation checklist, known-issues register, beginner setup guide, and read-only schema inspection SQL.
- Added a Supabase Auth account interface for email registration, sign-in, recovery email, recovery password update, and sign-out. It fails clearly into setup guidance when project configuration is missing. Live auth remains unverified.
- Supabase SDK is dynamically imported only when configured, avoiding its dependency cost in the initial bundle; malformed URLs return actionable setup feedback.
- Added auth-specific styles and replaced the hard-coded demo account identity in the account area.
- Updated README and setup/known-issues docs to describe the auth capability and limits.
- No environment configuration or database was changed.
