# Kijiji Connect

Kijiji Connect is a mobile-friendly React and TypeScript prototype for an Arusha marketplace and connected community services.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build` and run the configured linter with `npm run lint`.

## Current prototype modules

- Marketplace: search and filter the sample catalogue, publish locally stored demo listings, and open WhatsApp enquiries.
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

## Prototype limitations

This project currently has no backend, user authentication, role permissions, shared database, live payment processing, generative AI provider, moderation service, or WhatsApp Business/AI bot connection. The guided assistant uses local intent matching and the demo content generator; it does not use or claim to be a connected AI model. It can change browser-local demo data only when the user requests an action, and leaves external messages, community publishing, real payments, and final listing publication for the user to review. Payment method names are demo UI options, not proof of provider availability or authorization; no payment or settlement occurs. Browser-local data is private to the current browser profile and is not a secure or shared source of record. Product and destination content is illustrative and must be verified before business or travel decisions.

## Vercel deployment and domain

1. Run `npm ci`, `npm run lint`, and `npm run build` locally. `vercel.json` sets the Vercel install command, Vite production build, and `dist/` output directory.
2. In Vercel, import `dazomsuyas-gif/KIJIJI-CONNECT` from GitHub and deploy the selected branch. Vercel account access and project authorization are required; neither is configured in this repository.
3. Register or choose the custom domain, add it under the Vercel project’s Domains settings, and configure the DNS records Vercel provides. The domain name is not chosen yet, so no DNS or custom-domain configuration is in place.
4. Before accepting real customers or bookings, build a secured backend with authentication, data storage, validation, privacy controls, monitoring and backups. Add AI, email, WhatsApp Business, travel inventory and payment providers through server-side integrations only; configure their authorization and credentials with the service provider.
5. Verify live prices, inventory, business identity, operating terms and contact channels before publishing them as real offers. Do not market the local examples as live inventory or confirmed booking prices.

The savannah and produce photos are representative Unsplash images, not verified photos of the named businesses or destinations. Their source files are stored locally in `public/` so the demo does not depend on a live image host. The savannah image is from [Unsplash](https://images.unsplash.com/photo-1516026672322-bc52d61a55d5), and the produce-market photo is from [Unsplash](https://images.unsplash.com/photo-1542838132-92c53300491e); see the [Unsplash License](https://unsplash.com/license).

For future integrations, replace the demo payment adapter in `src/services/demoPayments.ts` with calls to your own authenticated server endpoints, and replace the local content generator in `src/services/demoAi.ts` with a server-side AI endpoint. Provider credentials, payment verification, webhooks, access controls, moderation and sensitive data must remain server-side. Never put private service keys or card data in frontend code.
