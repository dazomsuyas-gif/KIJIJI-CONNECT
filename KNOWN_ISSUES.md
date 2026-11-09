# Known issues and external dependencies

Last reviewed: 2026-11-08

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
- The assistant is local intent matching, not an AI model, WhatsApp bot, or autonomous agent. It supports confirm/cancel and 30-second undo for local seller-owned price/stock changes, can prepare a cart draft from a quantity request, and now exposes typed local tool contracts for products, travel, lessons, tickets and review-only handoffs. The audit log is browser-local and not a security record. Live model calls and automatic handoff are not implemented.
- Intent resolution now uses a swappable `AssistantProvider` boundary and includes tested common Kiswahili navigation/support phrases. The active provider remains local rules; no remote model is configured or called.
- Vitest/Testing Library currently pass 99 tests across 17 files. Playwright passes 26 desktop/mobile E2E tests, including axe checks with no serious or critical violations on tested routes. Lighthouse 13.6.0 mobile baselines are recorded in `TESTING.md`; performance remains below target (62–77 across the five audited routes).
- The app uses a shared shell; several substantial routes are lazy-loaded and the shell renders only the active route section, but `App.tsx` and `App.css` have not yet been fully split into feature modules. Lighthouse showed CLS 0.259 on prices and stories and marketplace total blocking time of 2.57s; performance work remains open.
- Seller/admin pages are safety-labeled previews only and are not protected workflows.
- The product catalogue contains more than 40 illustrative examples with placeholder prices and sample availability. Supplier inventory, ratings, and prices are not verified live data.
- The Arusha `/prices` comparison currently contains generated sample observations only. Buyer reports are browser-local and do not enter comparisons until approved by the local demo moderator; this is not trusted or shared moderation. Real Arusha prices must come from verified reports or an approved data source before estimates are useful for purchasing decisions.
- Forecasts are local moving-average/regression estimates based on the sample dataset, not a trained model or guarantee. Alerts are saved in the current browser and do not send notifications.
- Marketplace search, category/audience/location/price/availability filters, sorting and pagination are URL-synced but still operate on local illustrative data. Product detail/specifications, related products, supplier sample profiles, enquiry-only quote links, local cart and simulated order history are available. These are browser-local previews, not real transactions or verified inventory. Secure order lifecycle and server-persisted seller workflows remain unimplemented.
- The seller preview can create, update and remove browser-local listings and displays low sample stock, but ownership is a client-side demo check, not authentication or security. Real seller accounts, sales analytics and seller order management are not implemented.
- The moderation page now exercises pending/approved/rejected listing decisions and a viewer/seller/moderator role switcher in browser storage. These role labels and decisions are a product-preview workflow only; they do not publish listings or authorize users.
- Seller-created listings can preview and save up to three JPEG/PNG/WebP files, 512 KB each, in this browser only. Images are not uploaded or shared; browser storage quota may limit how many listings can retain images.
- No authorized payment, hotel, airline, tourism, messaging, email, or AI provider integration is configured.
- The professional light/dark theme is implemented locally; it does not imply a user account preference synced across devices.
- Learning practice streaks are stored as browser-local calendar days after passed assessments; they are not account-backed, cross-device, or an official learning record.
- Delivery places, partial-payment balances, sender acceptance, dispatch and Arusha tracking points are browser-local simulation data. No money is settled, no sender is notified, and no live driver/device GPS is connected.
- The Arusha delivery destination map uses OpenStreetMap tiles and lists local destination coordinates, with an offline fallback. It does not show a route, courier telemetry, live GPS updates or geofencing; courier tracking requires a configured logistics provider.
- Stories and community drafts/posts are browser-local. The story cover preview is bounded to 512 KB and is not uploaded; moderation labels do not publish content to other users.

## Quality and operations

- Vercel configuration exists, but no Vercel project authorization or custom domain configuration was verified.
- The application has representative locally stored photos for produce and a generic landscape. Dedicated product-category, Arusha market, Serengeti, Ngorongoro, Kilimanjaro, Zanzibar and community photography remains to be sourced and credited; see `public/images/README.md`.

## Required resolution

Obtain the intended Supabase project's schema-only metadata using the read-only queries in `supabase/inspection/schema_report.sql`. Review the schema and RLS output before designing or applying migrations. Configure only the public URL and publishable/anon key in an ignored local `.env.local`; never use the service-role key in the browser.

The supplied contact `kelvinmsuya63@gmai.com` is retained as entered; the owner needs to confirm whether `gmai.com` should be `gmail.com`.
