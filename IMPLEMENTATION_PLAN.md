# Kijiji Connect implementation plan

Status key: `[x]` verified complete; `[ ]` not complete; `[blocked]` requires an external dependency or a safety prerequisite.

This roadmap compares the requested target with the existing implementation. Preserve working modules, complete safe local work in order, and verify each phase before pushing it. Do not apply migrations to a remote database, handle real payments, send messages, or claim live inventory/AI without owner-approved configuration and end-to-end provider tests.

## Redesign

- [x] Consolidate colour, spacing, typography, radius, shadow, motion and z-index tokens in `src/styles/tokens.css`.
- [x] Add reusable accessible UI primitives for buttons, cards, fields, badges, empty states and stepper timelines.
- [x] Refresh the shared shell foundations with consistent page rhythm, responsive navigation and honest preview-status copy.
- [x] Improve orders/delivery and shared surfaces with consistent stepper/cards, responsive controls, accessible states and locally served imagery.
- [x] Add a tester guide route/document, structured SEO metadata and release-quality browser checks without claiming unavailable provider integrations.

## Polish and Launch Readiness

- [x] Add Playwright browser coverage with real user interactions for the core marketplace, delivery, seller, travel, learning, assistant, theme, mobile navigation and 404 flows.
- [x] Add axe checks and keyboard-only coverage, then verify the required 320, 390, 768, 1280 and 1920px viewports have no horizontal overflow.
- [x] Complete the reusable UI layer (form controls, modal, tabs, toast, skeleton, pagination, breadcrumbs, tooltip and table) using the existing token system.
- [x] Finish the first honest browser-local `/stories` draft/moderation surface and cover it with a real browser test; community posting remains local and threaded/reaction work is still open.
- [x] Add an original habit-building story collection and a personal seven-check-in challenge with streak tracking, local persistence and unit/browser tests.
- [x] Replace the inline delivery SVG with a lazy-loaded Leaflet/OpenStreetMap map, attribution, all Arusha destination markers, and a graceful offline destination-only fallback.
- [ ] Split the large application shell and shared stylesheet into feature modules without changing existing routes or local workflows.
- [x] Generate responsive local WebP variants from the verified credited photos, use them in the hero, produce listings and example stories, and document exact missing-photo slots without inventing credits.
- [x] Run and record full E2E and axe checks; all tested routes have no serious or critical axe violations.
- [x] Record Lighthouse 13.6.0 mobile baselines for home, marketplace, prices, orders and stories in `TESTING.md`.
- [ ] Improve Lighthouse performance to the 90+ target; current scores are 62–77, with CLS 0.259 on prices/stories and 2.57s marketplace TBT.

## Phase 8 — Arusha market prices and local estimates

- [x] Add typed sample price observations across 12 products and 7 Arusha markets, with dates and source/status metadata.
- [x] Add `/prices` search and product/category/market/date filters, sortable market averages, min/max/spread, lowest-average highlight and lightweight SVG charts.
- [x] Link marketplace cards and product details to their corresponding price comparisons.
- [x] Validate buyer price reports and keep them pending in the existing browser-local demo moderation queue until approved.
- [x] Add a local price-forecast provider with moving average/regression, 7/14/30-day horizons, confidence, uncertainty and insufficient-data handling.
- [x] Add local alerts and assistant compare/best-market/trend/alert-draft intents; alert changes require confirmation and local audit logging.
- [x] Add focused unit and real desktop/mobile Playwright tests for comparison, reporting, moderation, estimates, alerts and assistant confirmations.
- [x] Prepare a review-only Supabase migration for reference markets/products, moderated price reports and owner-scoped alerts with RLS; do not apply it remotely.
- [x] Add CI workflow and responsive WebP optimizer for the verified local photo sources; document missing image slots and credits.
- [ ] Populate the catalogue with independently verified market reports before treating comparisons or estimates as actionable.
- [ ] Connect shared price reports, alerts and trusted moderator roles only after reviewing the target Supabase schema and credentials.
- [ ] Run Lighthouse and add verified market/category/travel/community photos.

## Phase 1 — Routes, reliability and shared UI foundation

- [x] Preserve the existing React 19, TypeScript, Vite, React Router application and current local server.
- [x] Route shell for Home, Marketplace, Travel, Learning, Business tools, AI Studio, Community, Payments, Integrations, Destinations, Activity, Account, Contact; page titles, unknown-route view, mobile navigation and SPA fallback.
- [x] Add product/supplier details, cart, orders, seller/admin, assistant, articles/about/FAQ/privacy/terms as distinct direct routes.
- [x] Lazy-load substantial page modules without breaking current route workflows.
- [x] Add ErrorBoundary, scroll-to-top, accessible status/error handling, loading and empty states.
- [x] Review sitemap/contact/social footer and verify direct-page interaction at narrow mobile width.
- [x] Browser-test product and supplier details, cart/order navigation, unknown-route handling and mobile menu.
- [ ] Add accessible toast patterns and cookie notice.

## Phase 2 — Marketplace repository and seller/admin workflows

- [x] Expand to 41 illustrative products; add URL-synced search, audience/category/location/price/availability filters, sorting and pagination.
- [x] Add a browser-local cart and explicitly simulated checkout/order log.
- [x] Capture an Arusha delivery place/landmark, simulated paid balance, sender acceptance, dispatch and delivery states with coordinate review.
- [x] Add an inline coordinate-based Arusha destination map with City Centre, Clock Tower, Sakina, Njiro, Tengeru, Usa River, Kisongo, Kijenge, Olasiti, Moshono, Lemara and Ilboru.
- [x] Add a typed local listing repository boundary with explicit local-owner checks and browser persistence.
- [x] Add basic product detail/specifications/related listings, sample supplier profiles and user-directed quote handoff.
- [x] Add product image gallery and order timeline/print receipt; any status updates remain demo-only.
- [x] Add local seller listing create/edit/delete, input validation, price/stock updates and low-stock alerts; label local owner checks as non-security.
- [x] Add bounded browser-local listing image upload and preview; seller sales/order summaries remain unimplemented.
- [x] Add demo moderation/user-role/audit views. Browser-local role flags are never authorization.
- [x] Test persistence, role boundary, validation, empty/error states and mobile usability.

## Phase 3 — Assistant tools with safe confirmation

- [x] Parse local price/stock requests into typed intent contracts; the assistant remains rule-based.
- [x] Define a swappable AI provider interface and expand English/Kiswahili intent coverage.
- [x] Define safe typed tools for products, order drafts, seller changes, quotes, travel, lessons, tickets and human handoff; execution remains local and review-only.
- [x] For seller-owned local price/stock edits, require confirmation, show exact before/after values, write a browser-local audit entry and offer 30-second undo.
- [x] Convert explicit quantity requests into a confirmed local cart draft; confirmation does not create an order or payment.
- [x] Keep chat history in browser storage, provide quick prompts and a clear-history control; typing state remains.
- [x] Handoff prepares user-reviewed WhatsApp/email links only; it never sends automatically.
- [x] Test the requested commands and permission/confirmation edge cases.
- [blocked] Live LLM/WhatsApp messaging requires approved server deployment, provider account, secrets and provider-side tests.

## Phase 4 — Language Academy

- [x] Cover English, French, Mandarin and Swahili at A1-C2 plus separate Native extension.
- [x] Add an initial reviewable flashcard surface alongside the lesson pathway.
- [x] Record passed-assessment practice days and display a browser-local consecutive streak.
- [ ] Write at least three full A1 and A2 units per language; label all higher-level content as outline/sample until complete.
- [ ] Add vocabulary, grammar, reading, listening speech synthesis, available-device speaking, writing, flashcards/review, explained quizzes, pass-mark exams, streaks, printable non-accredited certificate and placement test.
- [ ] Test progress, keyboard/accessibility behavior and missing browser speech APIs.

## Phase 5 — Travel

- [ ] Add dated illustrative Arusha/Moshi/Karatu/Zanzibar stays, amenity/photo/map data, indicative ranges and guest/date calculators.
- [ ] Add route/fare ranges for JRO/ARK/DAR/ZNZ/NBO and packages with itineraries, inclusions/exclusions/group pricing.
- [ ] Add filters/sort, enquiry review and explicit WhatsApp/email handoff actions.
- [ ] Test date/guest/price calculations and empty/error states.
- [blocked] Live courier GPS, sender notifications and shared order balances require an approved logistics/payment backend.
- [blocked] Live hotel/flight inventory and confirmed bookings require authorized provider APIs and business credentials.

## Phase 6 — Backend and provider scaffolding

- [x] Existing Supabase client uses optional public environment configuration; `.env.local` remains ignored.
- [x] Existing read-only schema inspection query covers metadata; no remote database changes have been made.
- [ ] Prepare additive Supabase migrations for requested entities, RLS on every table, separate `user_roles`, security-definer role check and owner-only writes after schema review.
- [ ] Add typed Supabase repository adapter, selected only with explicit configuration.
- [ ] Add validated serverless chat/webhook/email/payment skeletons with safe not-configured results and webhook signature tests.
- [ ] Document provider accounts, environment names, approval steps, rate limits and secrets handling in `INTEGRATIONS.md`.
- [blocked] Live Supabase integration requires the intended project's schema-only report, public configuration and reviewed policies.
- [blocked] Applying migrations requires schema review and explicit authorization; never apply them in this task.
- [blocked] Real payment/email/WhatsApp/LLM adapters require approved provider accounts, server-side credentials and integration tests.

## Phase 7 — Release quality and content

- [x] Add Playwright E2E for marketplace, seller/delivery, assistant confirmation, academy, travel, stories/community, mobile menu, dark mode and 404.
- [x] Add axe checks, keyboard navigation and overflow coverage at 320, 390, 768, 1280 and 1920px.
- [x] Add CI for lint, typecheck, unit tests, build and E2E.
- [x] Add baseline page metadata/OG tags, JSON-LD, sitemap/robots, a web manifest and an offline shell service worker.
- [x] Add legal/privacy templates with a lawyer-review warning; cookie consent and security-header review remain open.
- [x] Run build, lint, unit tests, E2E, axe and Lighthouse; record results in `TESTING.md`.
- [ ] Raise all target Lighthouse performance scores to 90+; the recorded mobile scores remain below target.
- [ ] Finish splitting the large App shell and shared stylesheet into feature modules.
- [ ] Source dedicated licensed market/category/travel/community photography, then optimize and add verified credits.
- [ ] Finish threaded community replies/reactions, remaining travel and learning work, and re-check docs after those changes.
- [ ] Confirm clean Git state, commit and push after all release gates are satisfied.

## Safety and truthfulness gates

1. Do not assume a remote database is empty or apply migrations before reviewing its schema and policies.
2. Keep secrets, service-role keys, passwords and payment/AI credentials out of frontend code and Git.
3. All local product/travel data and prices are illustrative and date-labelled; confirm with suppliers.
4. Local assistant rules are not a real LLM. A click-to-chat link is not a WhatsApp Business integration.
5. A checkout simulation is not a payment, an enquiry is not a booking, and local records are not shared business records.
6. Do not commit environment files or perform destructive/irreversible operations without explicit authorization.

## Current next action

Improve the measured Lighthouse performance/layout-shift issues, finish the app/CSS
feature split and remaining community/travel/learning work, source verified
photography, and continue treating remote-provider/database tasks as blocked
until their configuration and schema prerequisites are explicitly available.
