# Integration readiness

Kijiji Connect currently runs as a browser application with local storage for
preview workflows. This document records the safe path to real providers
without presenting local data as shared production data.

## Current status

- **Supabase Auth:** optional browser integration. It is enabled only when
  `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are valid.
- **Marketplace, orders, learning progress, travel enquiries and notifications:**
  typed backend boundary exists, but shared persistence is not configured.
- **Payments, email, WhatsApp Business, live travel inventory and AI:** not
  configured. Review-only links and local rule matching must not be described as
  automated provider integrations.

## Safe configuration

Create an ignored `.env.local` with browser-safe values only:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Never place a service-role key, database password, webhook secret or payment
secret in a `VITE_` variable or in the repository.

Before adding tables or migrations, run
`supabase/inspection/schema_report.sql` in the intended project and review the
result. Do not assume the database is empty. Schema and RLS changes require
explicit review before they are applied.

## Provider completion checklist

1. Review the schema-only report and agree entity ownership and retention.
2. Add additive migrations with RLS on every application table.
3. Add server-side role checks and owner-only writes.
4. Implement one repository operation at a time behind
   `src/services/backendRepository.ts`.
5. Add provider contract tests using a test project or a deterministic mock.
6. Configure rate limits, logging redaction, webhook signature verification and
   failure handling before accepting real traffic.
7. Verify backups, deletion requests, privacy terms and operational ownership.

Until these steps are complete, local/demo labels and not-configured messages
are intentional product safety controls.
