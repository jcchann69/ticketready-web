# TicketReady Public Deployment

This project is prepared for Render as a Node/Express web service.

## Recommended First Deploy

Use Render with the Blueprint file:

- Root repository blueprint: `render.yaml`
- App-folder blueprint: `outputs/service-desk-emulator/render.yaml`

If you connect a GitHub repository containing the full workspace, use the root `render.yaml`.
If you upload or deploy only the `outputs/service-desk-emulator` folder, use the app-folder `render.yaml`.

## Render Settings

Service type:

```text
Web Service
```

Root directory if deploying the whole repo:

```text
outputs/service-desk-emulator
```

Build command:

```text
npm ci
```

Start command:

```text
npm start
```

Health check path:

```text
/api/health
```

## Environment Variables

Set these in Render. Do not commit them to GitHub.

```text
SITE_URL=https://www.ticketready.net
STRIPE_SECRET_KEY=sk_test_... first, sk_live_... later
STRIPE_PUBLISHABLE_KEY=pk_test_... first, pk_live_... later
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Start with Stripe test keys even on the deployed domain. Switch to live keys only after the deployed test checkout works.

## Domain Setup

In Render:

1. Open the `ticketready-web` service.
2. Go to Custom Domains.
3. Add:

```text
www.ticketready.net
```

Render will show the DNS record it needs. In your domain registrar, add the CNAME record Render gives you.

## Stripe Webhook

After the Render service is live on HTTPS, add this webhook endpoint in Stripe:

```text
https://www.ticketready.net/api/stripe/webhook
```

Listen for:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
```

Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET` in Render.

## Production Checks

After deployment:

```text
https://www.ticketready.net/api/health
https://www.ticketready.net/api/config
```

Expected:

- `/api/health` returns `ok: true`
- `/api/config` returns `paymentsReady: true`
- The footer policy pages load
- Test checkout opens Stripe Checkout
- Checkout success returns to TicketReady and shows `Pro Active`
