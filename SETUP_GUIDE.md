# Beginner setup guide (Windows)

## 1. Open the project

Open the `C:\KIIJIJI CONNECT` folder in VS Code. In VS Code, choose **Terminal → New Terminal**. The project currently uses Node.js/npm; the verified environment had Node `v24.20.0` and npm `11.19.0`.

Run these commands from the project folder:

```powershell
npm install
npm run dev
```

Open the local URL Vite prints in the terminal. During the latest local verification, Kijiji Connect was served at `http://localhost:5173/`. If that URL is already open and responding, reuse it instead of starting a second development server.

To verify code changes:

```powershell
npm run lint
npm test
npm run build
```

The project includes Vitest and Testing Library checks for routing, local persistence, and the illustrative marketplace catalogue and filters. Run the checks again after making local changes.

## 2. Check whether you already have Supabase

Open [https://supabase.com/dashboard](https://supabase.com/dashboard), sign in, and inspect your project list. The local project cannot reveal whether your online account has a project. Do not create a duplicate until you have checked.

### If an intended project exists

1. Open that project and select **SQL Editor → New query**.
2. Open `supabase/inspection/schema_report.sql` in VS Code.
3. Copy one complete `SELECT` block at a time into SQL Editor and run it. Every statement is read-only and examines schema metadata; it does not read customer rows or change the database.
4. Save the results locally or return the schema-only metadata for review. Inspect output for sensitive literals before sharing.
5. Do not run migrations or modify policies until the existing schema and a proposed migration plan have been reviewed.

The report covers application schemas, tables and columns, RLS flags, constraints, indexes, function signatures (not function bodies), triggers, and policies. Supabase-managed schemas are excluded from the report.

### If no project exists

1. In the Supabase dashboard, choose **New project** and follow its setup prompts.
2. In the new project, open **Project Settings → API** (labels may change).
3. Copy only the **Project URL** and the **publishable key** (or legacy **anon/public key**) into your local development environment.
4. Copy `.env.example` to `.env.local` in the project root, then replace its placeholder values:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-public-publishable-or-anon-key
```

5. Save `.env.local`. It is ignored by Git. Restart `npm run dev` after changing environment variables.
6. Do not paste keys into chat. Never use a service-role/secret key in a `VITE_` variable: browser-delivered code is public. A publishable key is only safe with appropriately designed RLS and server-side authorization.
7. Do not apply a schema migration until an initial schema and access-policy plan has been reviewed.

## 3. Read-only schema inspection

Run all six query blocks in `supabase/inspection/schema_report.sql` separately. They use PostgreSQL catalog and `information_schema` reads only. They do not insert, update, delete, reset, or alter any database objects.

The functions report lists names and signatures only. If a project has sensitive literals inside policy expressions, inspect those expressions before sharing the report. Do not export customer records, secrets, database passwords, or function source code for this inspection.

## 4. Current capability boundaries

The browser app remains a frontend prototype until authentication, database policies, trusted server operations, and provider integrations are implemented and configured. Marketplace search, filters, sorting, and pagination work against local illustrative examples; they are not live supplier listings. The Supabase helper and email authentication interface are present, but live login is unavailable until project configuration is set. A migration, administrator role, shared marketplace, booking, payment, AI, or WhatsApp Business connection is not currently active.

For deployment and the verified current feature boundaries, see `README.md`.
