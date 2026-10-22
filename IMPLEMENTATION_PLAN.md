# Kijiji Connect implementation plan

Status key: `[x]` verified complete; `[ ]` not complete; `[blocked]` requires an external dependency or safe prerequisite.

## Ordered roadmap

- [x] **Phase 1 — Audit and preserve.** Confirm the React/TypeScript/Vite architecture, existing UI, package scripts, Git checkpoint, current local Supabase scaffold, build, and lint. Do not replace working modules.
- [ ] **Phase 2 — Database and identity foundation.**
  - [x] Add a lazy Supabase client scaffold using public environment variables; ignore local environment files; document that client keys require RLS.
  - [x] Add a read-only schema inspection script covering tables/columns/RLS, constraints, indexes, function signatures, triggers, and policies.
  - [x] Add an account interface for Supabase email registration, sign-in, password recovery/update, and sign-out, with explicit setup/error states.
  - [x] Load the Supabase SDK on demand so an unconfigured app does not include it in its initial bundle.
  - [blocked] Determine whether a Supabase project exists and review its schema. Requires user to inspect their account and return schema-only metadata. No remote account inspection is available in this workspace.
  - [ ] Design an additive migration plan for profiles, trusted server-side role assignment, RLS, storage, audit, and application data after schema review.
  - [blocked] Test live authentication and build profile/role database access. Requires Supabase project URL and publishable key locally plus schema and RLS review.
- [ ] **Phase 3 — Protected administrator dashboard and content management.** Requires authenticated backend authorization and approved schema.
- [ ] **Phase 4 — Marketplace persistence, supplier records, product search, carts, orders, and buyer/seller access.** Requires database and server-side transaction logic.
- [ ] **Phase 5 — Optional delivery/fulfilment records and provider integration boundaries.** Requires provider requirements and server-side validation.
- [ ] **Phase 6 — Accommodation directory and enquiry/booking-request workflow.** Live availability requires authorized provider access.
- [ ] **Phase 7 — Tourism packages, operators, and reservation requests.** Confirmations require responsible operator/provider confirmation.
- [ ] **Phase 8 — Flight provider adapter and booking workflows.** Blocked on authorized provider access and commercial credentials held server-side.
- [ ] **Phase 9 — Payment adapters, verified webhook processing, ledger, and commissions.** Blocked on an authorized provider and secure backend; never claim browser simulation is payment.
- [ ] **Phase 10 — Secure AI backend, constrained tools, and support handoff.** Blocked on server-side deployment and provider authorization for live AI/WhatsApp Business.
- [ ] **Phase 11 — Database-backed content, community, learning progress, and heritage editorial tools.** Requires approved data schema and RLS.
- [ ] **Phase 12 — Accessibility, performance, security, responsive, and end-to-end verification.** Add tests as appropriate; no automated test runner currently exists.
- [ ] **Phase 13 — Production deployment, environment setup, backups, monitoring, and release review.** Requires authorized hosting and operations configuration.

## Safety gates

1. Use only read-only catalog queries until the intended project and schema are identified.
2. Do not treat the remote database as empty based on missing local configuration.
3. Review all schema changes and permission policies before applying migrations.
4. Never put service-role keys, database passwords, payment secrets, or AI provider secrets in browser-visible `VITE_` variables.
5. Do not represent illustrative inventory, contact handoffs, or simulated payments as live services.
6. Preserve the current uncommitted Supabase scaffold and any future user edits.

## Current next action

User: check the Supabase dashboard for the intended project. If present, run each `SELECT` statement in `supabase/inspection/schema_report.sql` separately and return reviewed metadata only. If absent, create a project and set only the public URL/key in local `.env.local`; then run the read-only schema report for the new project. Do not run migrations yet.

Agent: once metadata arrives, map existing objects and policies, identify naming conflicts and data-preservation requirements, then propose a migration plan for review. No migration has been applied. Auth interface build/lint verification passed and its unconfigured state was browser-checked; live Supabase authentication remains unverified because project credentials are absent.
