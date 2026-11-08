# Kijiji Connect testing guide

Run the local server with `npm.cmd run dev`, then open `http://localhost:5173`.
The in-app checklist is available at `/test-guide`.

## Automated checks

```text
npm.cmd run lint
npm.cmd test -- --run
npm.cmd run build
```

The current automated suite uses Vitest and Testing Library. It verifies route
rendering, local persistence, marketplace filters, cart/checkout simulation,
seller and moderation boundaries, assistant confirmations, learning progress,
backend not-configured behavior, and Arusha delivery state helpers.

## Manual browser flows

- Marketplace search/filter, add to cart, checkout preview and partial balance.
- Orders: Arusha destination, sender acceptance, dispatch, delivery and local
  coordinate review.
- Travel offer filtering, dates, guests, itinerary and review-only handoff.
- Language flashcard, assessment pass and local practice streak.
- Assistant confirmation, cancellation and Undo.
- Mobile navigation at 320px and 390px, dark mode and unknown routes.

## Honest provider status

Local records are not shared records. Payment is simulated, travel offers are
illustrative, the assistant uses local rules, and the destination map is not
live driver GPS. Supabase, courier, payment, email, WhatsApp Business and AI
providers require the configuration described in `INTEGRATIONS.md`.
