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

## Manual browser flows

- Marketplace search/filter, add to cart, checkout preview and partial balance.
- Orders: Arusha destination, sender acceptance, dispatch, delivery and local
  coordinate review.
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
