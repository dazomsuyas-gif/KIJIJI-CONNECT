# Known issues and external dependencies

Last reviewed: 2026-10-22

## Security and persistence

- No Supabase project configuration or schema report is available in the workspace. Remote project existence and database contents are unknown.
- The current website has no connected database, verified live authentication, server-side role checks, RLS policies authored for this app, or protected admin area. An email auth interface is present but requires project configuration.
- Browser-local state is user-editable, isolated to one browser profile, and not suitable as a shared commercial source of record.
- Do not assume an empty database or apply a migration before inspecting the intended Supabase project.
- No customer data, database password, service-role key, or other secret was requested or inspected.

## Product and integration limitations

- Product and travel offers are illustrative demo catalog data and must not be described as verified supplier inventory.
- Payment is simulated and cannot charge, settle, reconcile, or securely verify transactions.
- Travel enquiries only prepare user-reviewed WhatsApp/email drafts; they do not contact providers, reserve inventory, or confirm a booking.
- The assistant is local intent matching, not an AI model, WhatsApp bot, or autonomous agent.
- Vitest/Testing Library cover route configuration, local storage, direct-route rendering, navigation, and not-found rendering. Automated browser end-to-end coverage has not yet been added.
- The route foundation maps existing modules to separate URLs, but most page contents remain mounted in the same application shell. Product detail, cart/order history, seller/admin, privacy, terms, FAQ and fully independent page components are not yet implemented.
- The product catalogue, travel offers, business data, and testimonials are illustrative sample content. Supplier inventory, ratings, and prices are not verified live data.
- No authorized payment, hotel, airline, tourism, messaging, email, or AI provider integration is configured.

## Quality and operations

- Vercel configuration exists, but no Vercel project authorization or custom domain configuration was verified.

## Required resolution

Obtain the intended Supabase project's schema-only metadata using the read-only queries in `supabase/inspection/schema_report.sql`. Review the schema and RLS output before designing or applying migrations. Configure only the public URL and publishable/anon key in an ignored local `.env.local`; never use the service-role key in the browser.
