# TicketReady Service Desk Emulator

TicketReady is a playable website prototype for a service desk training game. It simulates realistic help desk tickets, scores the user's triage choices, and builds a job-readiness profile over time.

## What is included

- Static website prototype in `index.html`
- Six realistic ticket scenarios across access, network, security, hardware, SaaS, and Windows support
- Scoring for category, priority, response tone, action choices, and dangerous shortcuts
- Local progress tracking with XP, solved tickets, best score, skill growth, and readiness
- Pro-style Job Evidence Lab with resume proof, interview prompts, and next-drill recommendations
- Job-ready checklist that turns scores, evidence, skill coverage, and consistency into visible learner milestones
- Resume proof export that copies or downloads honest training bullets from saved simulated tickets
- Creator Clip panel for short-form video hooks
- Pro Lab waitlist surface for subscription testing
- Stripe-ready Node server for Pro subscription checkout, billing portal, webhook handling, and entitlement checks
- SQLite database storage for accounts, subscriptions, progress, evidence, and weekly readiness reports
- Passwordless email-code login with 30-day sessions for account/progress protection

## Subscription path

The first paid version should sell outcomes, not just content.

- Free tier: daily ticket, score, basic coaching
- Pro tier: 30-day job ramp, larger ticket library, mock interview mode, resume evidence log, job-role paths, and weekly readiness reports
- Team tier: cohorts, admin dashboard, leaderboard, and hiring-prep reporting

Paid users need to feel progress after every session. The most valuable loop is:

1. Practice a realistic ticket.
2. Get scored on professional decisions.
3. Save a resume evidence entry.
4. Practice the interview explanation.
5. Receive the next drill based on weak spots.

This makes the subscription feel like a career prep product, not just a game level pack.

## App build order

Start with the website because social ads and TikTok links can send users there immediately. After the paid training loop is proven, turn it into an installable app.

1. Website prototype and waitlist
2. Account system and subscriptions
3. Persistent progress and evidence export
4. Installable PWA
5. Native mobile app if retention is strong

## Payment Setup

This prototype uses Stripe Checkout Sessions in subscription mode for the website. That is the right first payment path because the social-media funnel sends people to the website first.

Run the Stripe-backed website:

```powershell
cd outputs/service-desk-emulator
npm install
Copy-Item .env.example .env
npm run dev
```

Then open:

```text
http://127.0.0.1:8788/
```

For Stripe live account activation, use this as the business website:

```text
https://www.ticketready.net
```

Do not use `http://127.0.0.1:8788` as the business website. That address is only local testing on this computer.

To activate test payments:

1. Create a Stripe account.
2. Run `npm run configure:stripe` and enter your test secret key locally.
3. Run `npm run setup:stripe` to create the `TicketReady Pro` product and `$19/mo` recurring Price.
4. Run `npm run configure:stripe` again and paste the printed `price_...` value into the Price ID prompt.
5. Restart the server with `npm run dev`.
6. Enter an email in the Pro Lab panel and click `Start Pro`.

You can also create the product and recurring Price manually in the Stripe Dashboard if you prefer.

For local webhook testing, install Stripe CLI and run:

```powershell
stripe login
stripe listen --forward-to localhost:8788/api/stripe/webhook
```

Copy the printed `whsec_...` value into `STRIPE_WEBHOOK_SECRET`, then restart the server.

TicketReady now stores subscription status, lightweight account profiles, synced progress, and evidence in a SQLite database. Locally, the default path is:

```text
data/ticketready.sqlite
```

On Render, keep the database on a persistent disk with:

```text
DATABASE_PATH=/var/data/ticketready.sqlite
```

The app automatically imports older `data/subscriptions.json` and `data/profiles.json` records into SQLite when it first opens an empty database.

## Account Login

TicketReady uses passwordless email codes. Local development returns a test code in the browser so you can move quickly. Production should send codes by email with:

```text
SESSION_SECRET=replace_with_long_random_secret
RESEND_API_KEY=re_...
BREVO_API_KEY=xkeysib_...
SENDGRID_API_KEY=SG_...
LOGIN_EMAIL_FROM=TicketReady <login@ticketready.net>
```

Configure one sender in production: `BREVO_API_KEY`, `RESEND_API_KEY`, or `SENDGRID_API_KEY`. If Wix blocks one provider's DNS records or account setup, try Brevo next because its manual domain authentication uses normal TXT/CNAME-style records. Until one sender is configured, public users cannot receive login codes. That is intentional so a paid account cannot be opened by typing someone else's email.

If a webhook is missed during local testing, use the `Check Pro Status` button. The backend also exposes `POST /api/sync-subscription`, which looks up the customer and subscription status directly from Stripe by email.

## Public Site Checklist

The project now includes starter public pages that a payment processor or customer will expect:

- `contact.html`
- `privacy.html`
- `terms.html`
- `cancellation.html`

Before live payments, replace placeholder support details if needed and make sure `support@ticketready.net` exists or forwards to an inbox you check.

Production config starts from:

```text
.env.production.example
```

When the backend is deployed to the domain, set:

```text
SITE_URL=https://www.ticketready.net
```

Then add this live webhook endpoint in Stripe:

```text
https://www.ticketready.net/api/stripe/webhook
```

Only add that webhook after the backend is actually deployed online with HTTPS.

## iOS Payment Rule

The iOS app can read Pro status from the same account system, but selling digital subscriptions inside an App Store app normally needs Apple In-App Purchase / StoreKit. Use Stripe for the website checkout first, then add Apple auto-renewable subscriptions before App Store submission.

## Social growth loop

Every ticket can become a 15 to 30 second vertical video.

1. Show the ticket and ask viewers what they would do.
2. Reveal one tempting mistake.
3. Show the correct service desk workflow.
4. Flash the score and ask viewers to try the next ticket on the site.

This gives the product repeatable TikTok, Shorts, and Reels content while also showing that the app teaches practical job skills.

## Next build steps

1. Configure production login email delivery.
2. Add analytics for completion rate, upgrade clicks, and social campaign source.
3. Expand the ticket library to 50 to 100 scenarios.
4. Add generated certificates or resume evidence summaries.
5. Add a live-mode payment launch checklist.
