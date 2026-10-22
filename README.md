# Kijiji Connect

Kijiji Connect is a mobile-friendly React and TypeScript prototype for an Arusha marketplace and connected community services.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build` and run the configured linter with `npm run lint`.

## Supabase setup status

The Supabase client dependency, optional client factory, and email authentication interface are prepared, but no Supabase project is configured in this checkout. Once configured, the interface supports email sign-up, sign-in, password recovery, password update, and sign-out. Copy `.env.example` to `.env.local`, then set the project URL and publishable/anon key from the Supabase project settings. `.env.local` is ignored by Git. A publishable/anon key is intended for browser use only when the database has correct Row Level Security; never put a service-role or secret key in a `VITE_` variable.

Authentication requests cannot be live-tested until valid project settings are configured. No database migrations or role policies have been added because the existing project's schema has not yet been reviewed. Before applying any migration, export the existing schema (tables, constraints, functions and Row Level Security policies) without data or secrets, inspect it, and plan backward-compatible changes. Authentication does not establish a seller/admin role or protect marketplace records; authorization and persistent application data remain unavailable until appropriate server/database policies are designed and configured.

## Current prototype modules

- Routed application foundation: Home, Marketplace, Travel, Learning, Business tools, AI Studio, Community, Payments, Integrations, Destinations, Activity, Account, and Contact have direct browser paths. Browser back/forward, page titles, unknown-route handling, a responsive navigation menu, and Vercel SPA fallback are enabled.
- Accessibility and presentation foundation: Times New Roman typography is configured through CSS variables, reduced-motion behavior and visible keyboard focus are respected, and English/Kiswahili navigation and key headings plus a persistent light/dark preference are available.
- Marketplace: search and filter more than 40 illustrative catalogue examples by audience, category, location, TZS price range and sample availability; sort and paginate results. Search/filter state is shareable in the URL. Add examples to a browser-local cart and prepare a simulated checkout/order record. Listings are not verified supplier offers, and locally published listings/orders remain in this browser.
- Sandbox checkout: simulate mobile-money, bank-transfer and bank-card flows for common Tanzania payment methods; records stay in this browser and no provider is contacted.
- AI Content Studio: generate and save starter copy templates locally. This is not connected to a generative AI service.
- Business automation: run local examples for order follow-up, low-stock reminders and content repurposing; no outside messages or systems are triggered.
- Language learning: practise original starter lessons in English, French, Mandarin Chinese and Kiswahili, with a seven-stage pathway, short quizzes, local progress and writing drafts. The pathway is CEFR-informed, not a complete curriculum, official Mandarin/HSK mapping, accredited test or proficiency certificate; its native/beyond stage sits outside the CEFR.
- Travel planning: browse sample flight routes, illustrative Arusha stay prices and tour ideas, estimate a trip, and prepare a user-reviewed WhatsApp or email enquiry. Listings, prices and availability are examples only; the form does not make a reservation or contact a provider. Use the enquiry links only after reviewing the details.
- Community: create discussion posts stored in this browser only.
- Tourism and heritage: browse sample destination cards. Confirm travel details with official operators.
- Site-wide guided assistant: available from the floating chat launcher and assistant section. Local intent matching can search listings, open travel and language sections, prepare forms or drafts for review, run explicitly requested local workflow previews, and open an unsubmitted sandbox checkout for a matched listing. It does not call an AI model or send messages, and cannot access live travel inventory.
- Notifications and account overview: show activity and browser-local demo data.
- Business support: WhatsApp, email and Instagram links use the supplied contact details.
- A custom local SVG logo, original illustrations, and locally served photographs keep the visual demo independent of remote image hosts.
- Local browser persistence is accessed through a shared storage repository adapter. Data remains local and is not a substitute for a secure shared backend.

## Development checks

```sh
npm run lint
npm test
npm run build
```

Vitest and Testing Library cover route configuration, storage behavior, direct routes, navigation, unknown paths, catalogue shape, marketplace filters, URL synchronization, sorting, pagination, and the simulated cart/order workflow. End-to-end Playwright tests have not yet been added.

The current route foundation displays the existing section-based modules at separate URLs. Cart and simulated-order history are local features within Marketplace and Payments, not independent server-backed routes. Product detail pages, secure order lifecycle, seller/admin dashboards, policies, and FAQ are not implemented yet. See `PROJECT_STATUS.md` and `KNOWN_ISSUES.md` for the phased implementation status.

## Prototype limitations

This project currently has no backend, configured user authentication, role permissions, shared database, live payment processing, generative AI provider, moderation service, or WhatsApp Business/AI bot connection. The account screen can use Supabase email authentication once project settings are provided, but authentication alone does not authorize marketplace actions; live authentication has not been verified. The guided assistant uses local intent matching and the demo content generator; it does not use or claim to be a connected AI model. It can change browser-local demo data only when the user requests an action, and leaves external messages, community publishing, real payments, and final listing publication for the user to review. Payment method names are demo UI options, not proof of provider availability or authorization; no payment or settlement occurs. Browser-local data is private to the current browser profile and is not a secure or shared source of record. Product and destination content is illustrative and must be verified before business or travel decisions.

## Vercel deployment and domain

1. Run `npm ci`, `npm run lint`, and `npm run build` locally. `vercel.json` sets the Vercel install command, Vite production build, and `dist/` output directory.
2. In Vercel, import `dazomsuyas-gif/KIJIJI-CONNECT` from GitHub and deploy the selected branch. Vercel account access and project authorization are required; neither is configured in this repository.
3. Register or choose the custom domain, add it under the Vercel project’s Domains settings, and configure the DNS records Vercel provides. The domain name is not chosen yet, so no DNS or custom-domain configuration is in place.
4. Before accepting real customers or bookings, build a secured backend with authentication, data storage, validation, privacy controls, monitoring and backups. Add AI, email, WhatsApp Business, travel inventory and payment providers through server-side integrations only; configure their authorization and credentials with the service provider.
5. Verify live prices, inventory, business identity, operating terms and contact channels before publishing them as real offers. Do not market the local examples as live inventory or confirmed booking prices.

The savannah and produce photos are representative Unsplash images, not verified photos of the named businesses or destinations. Their source files are stored locally in `public/` so the demo does not depend on a live image host. The savannah image is from [Unsplash](https://images.unsplash.com/photo-1516026672322-bc52d61a55d5), and the produce-market photo is from [Unsplash](https://images.unsplash.com/photo-1542838132-92c53300491e); see [CREDITS.md](./CREDITS.md) and the [Unsplash License](https://unsplash.com/license).

For future integrations, replace the demo payment adapter in `src/services/demoPayments.ts` with calls to your own authenticated server endpoints, and replace the local content generator in `src/services/demoAi.ts` with a server-side AI endpoint. Provider credentials, payment verification, webhooks, access controls, moderation and sensitive data must remain server-side. Never put private service keys or card data in frontend code.
