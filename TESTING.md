# Kijiji Connect testing guide

Run the local server with `npm.cmd run dev`, then open `http://localhost:5173`.
The in-app checklist is available at `/test-guide`.

## Automated checks

```text
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
npm.cmd run test:e2e
```

The automated suite uses Vitest, Testing Library and Playwright. It verifies route
rendering, local persistence, marketplace filters, cart/checkout simulation,
seller and moderation boundaries, assistant confirmations, learning progress,
backend not-configured behavior, Arusha delivery state helpers, real browser
interactions and axe checks. Playwright runs Chromium at desktop and 390px
mobile dimensions with one worker for deterministic local-storage workflows.

## Latest run results

- Production build and TypeScript check: passed.
- Lint: passed.
- Vitest: 99 tests passed across 17 files.
- Playwright: 26 tests passed across desktop and mobile in 4.7 minutes.
- Axe: no serious or critical violations on the tested homepage and core routes.
- Responsive checks: 320, 390, 768, 1280 and 1920px passed without horizontal
  overflow.

Lighthouse 13.6.0 was run on the production preview with the default mobile
configuration. Scores are performance / accessibility / best practices / SEO:

| Route | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| `/` | 74 | 98 | 100 | 92 |
| `/marketplace` | 70 | 98 | 100 | 92 |
| `/prices` | 69 | 100 | 100 | 91 |
| `/orders` | 77 | 100 | 100 | 91 |
| `/stories` | 62 | 100 | 100 | 92 |

These are real baseline results, not the requested 90+ performance target.
Prices and stories measured CLS 0.259; marketplace measured 2.57s total blocking
time. Keep performance optimization open and re-run Lighthouse after layout and
main-thread work is reduced.

The `/prices` checks cover product/category/market/date filtering, sample
comparison and forecasts, pending buyer reports and demo moderation, alert
creation, and assistant confirmation. Those flows use local sample/browser
data; they do not prove market-data accuracy or send real notifications.
Responsive WebP assets can be regenerated with `npm run optimize:images`.

## Manual browser flows

- Marketplace search/filter, add to cart, checkout preview and partial balance.
- Orders: Arusha destination, sender acceptance, dispatch, delivery, OpenStreetMap
  attribution and the fallback message when map tiles cannot load.
- Travel offer filtering, dates, guests, itinerary and review-only handoff.
- Language flashcard, assessment pass and local practice streak.
- Assistant confirmation, cancellation and Undo.
- Stories: save a local English/Kiswahili draft, preview a bounded cover image,
  and confirm the pending moderation label. Start the seven-day habit challenge,
  check in once, reload and verify local progress persists. Community posts and
  challenge progress remain browser-local.
- Mobile navigation at 320px and 390px, dark mode and unknown routes.

## Honest provider status

Local records are not shared records. Payment is simulated, travel offers are
illustrative, the assistant uses local rules, and the destination map is not
live driver GPS. Supabase, courier, payment, email, WhatsApp Business and AI
providers require the configuration described in `INTEGRATIONS.md`.
