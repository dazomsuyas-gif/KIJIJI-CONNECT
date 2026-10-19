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
- Language learning: explore sample English, French, Chinese and Swahili lessons and track completion in this browser.
- Community: create discussion posts stored in this browser only.
- Tourism and heritage: browse sample destination cards. Confirm travel details with official operators.
- Guided assistant: rule-based responses for common marketplace questions.
- Notifications and account overview: show activity and browser-local demo data.
- Business support: WhatsApp, email and Instagram links use the supplied contact details.
- A custom local SVG logo, original illustrations, and locally served photographs keep the visual demo independent of remote image hosts.

## Prototype limitations

This project currently has no backend, user authentication, role permissions, shared database, live payment processing, generative AI provider, moderation service, or WhatsApp Business/AI bot connection. Payment method names are demo UI options, not proof of provider availability or authorization; no payment or settlement occurs. Browser-local data is private to the current browser profile and is not a secure or shared source of record. Product and destination content is illustrative and must be verified before business or travel decisions.

The savannah and produce photos are representative Unsplash images, not verified photos of the named businesses or destinations. Their source files are stored locally in `public/` so the demo does not depend on a live image host. The savannah image is from [Unsplash](https://images.unsplash.com/photo-1516026672322-bc52d61a55d5), and the produce-market photo is from [Unsplash](https://images.unsplash.com/photo-1542838132-92c53300491e); see the [Unsplash License](https://unsplash.com/license).

For future integrations, replace the demo payment adapter in `src/services/demoPayments.ts` with calls to your own authenticated server endpoints, and replace the local content generator in `src/services/demoAi.ts` with a server-side AI endpoint. Provider credentials, payment verification, webhooks, access controls, moderation and sensitive data must remain server-side. Never put private service keys or card data in frontend code.
