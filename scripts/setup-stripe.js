import "dotenv/config";

import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "";

if (!stripeSecretKey || stripeSecretKey.includes("replace_me")) {
  console.error("Add STRIPE_SECRET_KEY to .env before running setup:stripe.");
  process.exit(1);
}

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2026-02-25.clover",
  appInfo: {
    name: "TicketReady",
    version: "0.1.0",
  },
});

const product = await stripe.products.create({
  name: "TicketReady Pro",
  description: "Real-world service desk ticket practice, job evidence, interview prompts, and weekly readiness drills.",
  metadata: {
    app: "ticketready",
    plan: "pro_lab",
  },
});

const price = await stripe.prices.create({
  product: product.id,
  currency: "usd",
  unit_amount: 1900,
  recurring: {
    interval: "month",
  },
  nickname: "TicketReady Pro Monthly",
  metadata: {
    app: "ticketready",
    plan: "pro_lab",
  },
});

console.log("Stripe product and price created.");
console.log(`Product ID: ${product.id}`);
console.log(`Price ID: ${price.id}`);
console.log("");
console.log("Add this to .env:");
console.log(`STRIPE_PRICE_ID=${price.id}`);
