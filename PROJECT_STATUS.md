# Kijiji Connect project status

Last reviewed: 2026-11-08

## Current state

Kijiji Connect is a React 19, TypeScript 7, Vite 8 and React Router application. The
site includes marketplace, travel planning, language practice, stories/community,
assistant, seller/admin preview, orders and Arusha sample-price routes. Existing
URLs remain available. Standalone pages and selected feature modules are lazy
loaded; the route shell only renders the active section.

The forest/cream/gold design tokens, Times New Roman font variable, light/dark
theme, English/Kiswahili navigation, responsive menu, shared UI primitives,
reduced-motion styles, metadata, sitemap, robots file and a local image optimizer
are present. A few credited local images have responsive WebP variants; other
requested category and destination photos are still missing and listed in
`public/images/README.md`.

## Latest verification

- `npm run build`: passed; TypeScript build and Vite production bundle completed.
- `npm run lint`: passed.
- `npm test -- --run`: 99 tests passed across 17 files.
- `npm run test:e2e -- --workers=1`: 26 Playwright tests passed across desktop
  Chromium and the 390px mobile project. Coverage includes real browser
  interactions, keyboard navigation, axe, delivery map fallback and the
  marketplace, seller, travel, learning, stories, prices, assistant and 404 flows.
- Responsive E2E checks passed at 320, 390, 768, 1280 and 1920px without horizontal
  overflow. Axe checks found no serious or critical violations on tested routes.
- Lighthouse 13.6.0 was run against the production preview using its default
  mobile configuration. Home: 74/98/100/92; marketplace: 70/98/100/92; prices:
  69/100/100/91; orders: 77/100/100/91; stories: 62/100/100/92 (performance /
  accessibility / best practices / SEO). Performance remains below the 90 target.
  The measured CLS was 0.259 on prices and stories and marketplace TBT was 2.57s.
- `http://localhost:5173/` and the production preview at `http://127.0.0.1:4173/`
  returned HTTP 200 after verification. Keep the existing development server on
  port 5173 running.

## Current preview behavior

- Products and Arusha prices are illustrative sample data. Price reports and
  alerts are local; unapproved reports do not count in averages, and forecasts
  are statistical estimates from sample data, not a guarantee.
- Checkout and payment records are simulated. Order balance, sender acceptance,
  dispatch and delivery states are browser-local preview data.
- The Leaflet/OpenStreetMap map identifies delivery destinations and has an
  offline tile fallback. It does not show a live driver or courier GPS position.
- Travel cards/prices are illustrative; enquiries are not bookings. Stories,
  community posts, moderation and learning progress are browser-local.
- The assistant is local rule matching, not a connected AI model. Messages are
  not sent automatically; user-reviewed contact links are handoffs only.

## Remaining work and blockers

- Performance still needs improvement before the Lighthouse 90+ goal is met;
  investigate main-thread/style-layout cost and lazy-route layout shifts.
- App.tsx and App.css have not been fully separated into per-feature modules.
- Dedicated, verified photographs for markets, categories, travel destinations
  and community still need sourcing and licensing; do not invent photo credits.
- Community still needs threaded replies, reactions and stronger moderation
  workflows. Several travel and learning features remain partial previews.
- No shared backend, trusted moderator roles, live payment, courier GPS,
  WhatsApp Business, email provider, or remote LLM is configured.
- The Supabase price schema is review-only and has not been applied. Do not apply
  it until the intended project schema and RLS policies are reviewed.

See `IMPLEMENTATION_PLAN.md`, `KNOWN_ISSUES.md`, `INTEGRATIONS.md` and
`TESTING.md` for detailed gaps and safe setup steps.
