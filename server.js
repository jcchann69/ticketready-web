import "dotenv/config";

import express from "express";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 8788);
const siteUrl = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${port}`;
const dataDir = path.join(__dirname, "data");
const subscriptionStorePath = path.join(dataDir, "subscriptions.json");
const profileStorePath = path.join(dataDir, "profiles.json");
const databasePath = process.env.DATABASE_PATH || path.join(dataDir, "ticketready.sqlite");
const envPath = path.join(__dirname, ".env");
const progressSkillNames = [
  "Identity",
  "SLA",
  "Documentation",
  "Network",
  "Escalation",
  "Security",
  "Communication",
  "Troubleshooting",
  "Hardware",
  "Access",
  "SaaS",
  "Windows",
];

let stripeClient = null;
let stripeClientKey = "";
let database = null;

function paymentsReady() {
  const priceId = getStripePriceId();
  return Boolean(getStripe() && priceId && !priceId.includes("replace_me"));
}

function getStripeSecretKey() {
  return process.env.STRIPE_SECRET_KEY || "";
}

function getStripePublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || "";
}

function getStripePriceId() {
  return process.env.STRIPE_PRICE_ID || "";
}

function getStripeWebhookSecret() {
  return process.env.STRIPE_WEBHOOK_SECRET || "";
}

function getStripe() {
  const key = getStripeSecretKey();
  if (!key || key.includes("replace_me")) {
    return null;
  }

  if (!stripeClient || stripeClientKey !== key) {
    stripeClientKey = key;
    stripeClient = new Stripe(key, {
      apiVersion: "2026-02-25.clover",
      appInfo: {
        name: "TicketReady",
        version: "0.1.0",
      },
    });
  }

  return stripeClient;
}

function isLocalRequest(request) {
  const remoteAddress = request.socket.remoteAddress || "";
  return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(remoteAddress);
}

function isPlaceholder(value) {
  return !value || value.includes("replace_me");
}

function sanitizeEnvValue(value) {
  return String(value || "").trim();
}

function validateStripeSetup({ publishableKey, secretKey, priceId, webhookSecret }) {
  if (!secretKey.startsWith("sk_test_")) {
    return "Use a Stripe test secret key that starts with sk_test_.";
  }
  if (publishableKey && !publishableKey.startsWith("pk_test_")) {
    return "Use a Stripe test publishable key that starts with pk_test_.";
  }
  if (priceId && !priceId.includes("replace_me") && !priceId.startsWith("price_")) {
    return "Use a Stripe Price ID that starts with price_, or leave it blank for now.";
  }
  if (webhookSecret && !webhookSecret.includes("replace_me") && !webhookSecret.startsWith("whsec_")) {
    return "Use a webhook secret that starts with whsec_, or leave it blank for now.";
  }
  return "";
}

async function writeEnvFile({ publishableKey, secretKey, priceId, webhookSecret }) {
  const nextValues = {
    PORT: String(port),
    SITE_URL: siteUrl,
    DATABASE_PATH: databasePath,
    STRIPE_SECRET_KEY: secretKey,
    STRIPE_PUBLISHABLE_KEY: publishableKey || "pk_test_replace_me",
    STRIPE_PRICE_ID: priceId || "price_replace_me",
    STRIPE_WEBHOOK_SECRET: webhookSecret || "whsec_replace_me",
  };

  const contents = `${Object.entries(nextValues)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n")}\n`;

  await fs.writeFile(envPath, contents);
  Object.assign(process.env, nextValues);
  stripeClient = null;
  stripeClientKey = "";
}

function readJsonFileSync(filePath, fallback) {
  try {
    return JSON.parse(fsSync.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function runDatabaseTransaction(callback) {
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = callback(db);
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function getDatabase() {
  if (database) {
    return database;
  }

  fsSync.mkdirSync(path.dirname(databasePath), { recursive: true });
  database = new DatabaseSync(databasePath);
  database.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS subscriptions (
      customer_id TEXT PRIMARY KEY,
      email TEXT NOT NULL DEFAULT '',
      subscription_id TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'unknown',
      source TEXT NOT NULL DEFAULT 'unknown',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS subscription_emails (
      email TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES subscriptions(customer_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS profiles (
      email TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      progress_json TEXT NOT NULL,
      progress_updated_at TEXT
    );
  `);
  migrateJsonStoresToDatabase(database);
  return database;
}

function migrateJsonStoresToDatabase(db) {
  const profileCount = db.prepare("SELECT COUNT(*) AS count FROM profiles").get().count;
  const subscriptionCount = db.prepare("SELECT COUNT(*) AS count FROM subscriptions").get().count;

  if (profileCount === 0 && fsSync.existsSync(profileStorePath)) {
    const profileStore = readJsonFileSync(profileStorePath, { profiles: {} });
    const insertProfile = db.prepare(`
      INSERT OR REPLACE INTO profiles (email, created_at, last_seen_at, progress_json, progress_updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    Object.entries(profileStore.profiles || {}).forEach(([email, profile]) => {
      const normalizedEmail = normalizeEmail(profile.email || email);
      if (!normalizedEmail) {
        return;
      }
      const now = new Date().toISOString();
      insertProfile.run(
        normalizedEmail,
        profile.createdAt || now,
        profile.lastSeenAt || now,
        JSON.stringify(sanitizeProgress(profile.progress || {})),
        profile.progressUpdatedAt || null
      );
    });
  }

  if (subscriptionCount === 0 && fsSync.existsSync(subscriptionStorePath)) {
    const subscriptionStore = readJsonFileSync(subscriptionStorePath, { customers: {}, emails: {} });
    const insertSubscription = db.prepare(`
      INSERT OR REPLACE INTO subscriptions (customer_id, email, subscription_id, status, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertEmail = db.prepare(`
      INSERT OR REPLACE INTO subscription_emails (email, customer_id)
      VALUES (?, ?)
    `);

    Object.values(subscriptionStore.customers || {}).forEach((record) => {
      if (!record.customerId) {
        return;
      }
      insertSubscription.run(
        record.customerId,
        normalizeEmail(record.email),
        record.subscriptionId || "",
        record.status || "unknown",
        record.source || "json_migration",
        record.updatedAt || new Date().toISOString()
      );
      if (record.email) {
        insertEmail.run(normalizeEmail(record.email), record.customerId);
      }
    });

    Object.entries(subscriptionStore.emails || {}).forEach(([email, customerId]) => {
      if (email && customerId) {
        insertEmail.run(normalizeEmail(email), customerId);
      }
    });
  }
}

function getStorageStatus() {
  try {
    getDatabase().prepare("SELECT 1 AS ok").get();
    return {
      driver: "sqlite",
      ready: true,
      persistentPathConfigured: Boolean(process.env.DATABASE_PATH),
    };
  } catch {
    return {
      driver: "sqlite",
      ready: false,
      persistentPathConfigured: Boolean(process.env.DATABASE_PATH),
    };
  }
}

async function readStore() {
  const db = getDatabase();
  const customers = {};
  const emails = {};

  db.prepare("SELECT customer_id, email, subscription_id, status, source, updated_at FROM subscriptions")
    .all()
    .forEach((row) => {
      customers[row.customer_id] = {
        customerId: row.customer_id,
        email: row.email,
        subscriptionId: row.subscription_id,
        status: row.status,
        source: row.source,
        updatedAt: row.updated_at,
      };
    });

  db.prepare("SELECT email, customer_id FROM subscription_emails")
    .all()
    .forEach((row) => {
      emails[row.email] = row.customer_id;
    });

  return { customers, emails };
}

async function writeStore(store) {
  runDatabaseTransaction((db) => {
    db.exec("DELETE FROM subscription_emails; DELETE FROM subscriptions;");
    const insertSubscription = db.prepare(`
      INSERT OR REPLACE INTO subscriptions (customer_id, email, subscription_id, status, source, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const insertEmail = db.prepare(`
      INSERT OR REPLACE INTO subscription_emails (email, customer_id)
      VALUES (?, ?)
    `);

    Object.values(store.customers || {}).forEach((record) => {
      if (!record.customerId) {
        return;
      }
      insertSubscription.run(
        record.customerId,
        normalizeEmail(record.email),
        record.subscriptionId || "",
        record.status || "unknown",
        record.source || "unknown",
        record.updatedAt || new Date().toISOString()
      );
      if (record.email) {
        insertEmail.run(normalizeEmail(record.email), record.customerId);
      }
    });

    Object.entries(store.emails || {}).forEach(([email, customerId]) => {
      if (email && customerId) {
        insertEmail.run(normalizeEmail(email), customerId);
      }
    });
  });
}

async function readProfiles() {
  const db = getDatabase();
  const profiles = {};

  db.prepare("SELECT email, created_at, last_seen_at, progress_json, progress_updated_at FROM profiles")
    .all()
    .forEach((row) => {
      profiles[row.email] = {
        email: row.email,
        createdAt: row.created_at,
        lastSeenAt: row.last_seen_at,
        progress: sanitizeProgress(readJsonValue(row.progress_json, {})),
        progressUpdatedAt: row.progress_updated_at,
      };
    });

  return { profiles };
}

async function writeProfiles(store) {
  runDatabaseTransaction((db) => {
    db.exec("DELETE FROM profiles;");
    const insertProfile = db.prepare(`
      INSERT OR REPLACE INTO profiles (email, created_at, last_seen_at, progress_json, progress_updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    Object.entries(store.profiles || {}).forEach(([email, profile]) => {
      const normalizedEmail = normalizeEmail(profile.email || email);
      if (!normalizedEmail) {
        return;
      }
      const now = new Date().toISOString();
      insertProfile.run(
        normalizedEmail,
        profile.createdAt || now,
        profile.lastSeenAt || now,
        JSON.stringify(sanitizeProgress(profile.progress || {})),
        profile.progressUpdatedAt || null
      );
    });
  });
}

function readJsonValue(value, fallback) {
  try {
    return JSON.parse(value || "");
  } catch {
    return fallback;
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function isActiveStatus(status) {
  return ["active", "trialing"].includes(status);
}

function limitText(value, maxLength = 280) {
  return String(value || "").trim().slice(0, maxLength);
}

function clampNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return min;
  }
  return Math.min(max, Math.max(min, number));
}

function createEmptyProgress() {
  return {
    xp: 0,
    solved: 0,
    best: 0,
    scores: [],
    skills: Object.fromEntries(progressSkillNames.map((skill) => [skill, 0])),
    evidence: [],
  };
}

function sanitizeProgress(input = {}) {
  const empty = createEmptyProgress();
  const skills = { ...empty.skills };
  Object.entries(input.skills || {}).slice(0, 40).forEach(([skill, value]) => {
    const cleanSkill = limitText(skill, 40);
    if (cleanSkill) {
      skills[cleanSkill] = Math.round(clampNumber(value, 0, 100));
    }
  });

  const evidence = Array.isArray(input.evidence)
    ? input.evidence.slice(0, 20).map((entry) => ({
        ticketId: limitText(entry?.ticketId, 24),
        title: limitText(entry?.title, 120),
        score: Math.round(clampNumber(entry?.score, 0, 100)),
        summary: limitText(entry?.summary, 260),
        interviewPrompt: limitText(entry?.interviewPrompt, 360),
        createdAt: limitText(entry?.createdAt, 40) || new Date().toISOString(),
      }))
    : [];

  return {
    xp: Math.round(clampNumber(input.xp, 0, 1000000)),
    solved: Math.round(clampNumber(input.solved, 0, 10000)),
    best: Math.round(clampNumber(input.best, 0, 100)),
    scores: Array.isArray(input.scores)
      ? input.scores.slice(-20).map((score) => Math.round(clampNumber(score, 0, 100)))
      : [],
    skills,
    evidence,
  };
}

function mergeProgress(existing = {}, incoming = {}) {
  const saved = sanitizeProgress(existing);
  const next = sanitizeProgress(incoming);
  const skills = { ...saved.skills };
  Object.entries(next.skills).forEach(([skill, value]) => {
    skills[skill] = Math.max(skills[skill] || 0, value);
  });

  const evidenceMap = new Map();
  [...saved.evidence, ...next.evidence].forEach((entry) => {
    const key = `${entry.ticketId}|${entry.createdAt}|${entry.score}`;
    if (!evidenceMap.has(key)) {
      evidenceMap.set(key, entry);
    }
  });

  return {
    xp: Math.max(saved.xp, next.xp),
    solved: Math.max(saved.solved, next.solved),
    best: Math.max(saved.best, next.best),
    scores: [...saved.scores, ...next.scores].slice(-20),
    skills,
    evidence: Array.from(evidenceMap.values())
      .sort((first, second) => String(second.createdAt).localeCompare(String(first.createdAt)))
      .slice(0, 20),
  };
}

async function saveCustomerSubscription({ customerId, email, subscriptionId, status, source }) {
  const store = await readStore();
  const normalizedEmail = normalizeEmail(email);
  const existing = store.customers[customerId] || {};
  const record = {
    ...existing,
    customerId,
    email: normalizedEmail || existing.email || "",
    subscriptionId: subscriptionId || existing.subscriptionId || "",
    status: status || existing.status || "unknown",
    source,
    updatedAt: new Date().toISOString(),
  };

  store.customers[customerId] = record;
  if (record.email) {
    store.emails[record.email] = customerId;
  }
  await writeStore(store);
  return record;
}

async function getEntitlementByEmail(email) {
  const store = await readStore();
  const customerId = store.emails[normalizeEmail(email)];
  const record = customerId ? store.customers[customerId] : null;

  return {
    active: Boolean(record && isActiveStatus(record.status)),
    status: record?.status || "none",
    customerId: record?.customerId || null,
    subscriptionId: record?.subscriptionId || null,
  };
}

async function getEntitlementWithStripeFallback(email) {
  const localEntitlement = await getEntitlementByEmail(email);
  if (localEntitlement.active || !getStripe()) {
    return localEntitlement;
  }

  try {
    return await syncSubscriptionFromStripe(email);
  } catch {
    return localEntitlement;
  }
}

async function saveProfile(email) {
  const normalizedEmail = normalizeEmail(email);
  const store = await readProfiles();
  const existing = store.profiles[normalizedEmail] || {};
  const now = new Date().toISOString();
  const profile = {
    ...existing,
    email: normalizedEmail,
    createdAt: existing.createdAt || now,
    lastSeenAt: now,
    progress: sanitizeProgress(existing.progress || {}),
    progressUpdatedAt: existing.progressUpdatedAt || null,
  };

  store.profiles[normalizedEmail] = profile;
  await writeProfiles(store);
  return profile;
}

async function saveProgress(email, incomingProgress) {
  const normalizedEmail = normalizeEmail(email);
  const store = await readProfiles();
  const existing = store.profiles[normalizedEmail] || {};
  const now = new Date().toISOString();
  const progress = mergeProgress(existing.progress || {}, incomingProgress);
  const profile = {
    ...existing,
    email: normalizedEmail,
    createdAt: existing.createdAt || now,
    lastSeenAt: now,
    progress,
    progressUpdatedAt: now,
  };

  store.profiles[normalizedEmail] = profile;
  await writeProfiles(store);
  return profile;
}

async function syncSubscriptionFromStripe(email) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Stripe is not configured yet.");
  }

  const normalizedEmail = normalizeEmail(email);
  const customers = await stripe.customers.list({ email: normalizedEmail, limit: 10 });
  const customer = customers.data[0];

  if (!customer) {
    return {
      active: false,
      status: "no_customer",
      customerId: null,
      subscriptionId: null,
    };
  }

  const subscriptions = await stripe.subscriptions.list({
    customer: customer.id,
    status: "all",
    limit: 10,
  });

  const sortedSubscriptions = subscriptions.data.sort((first, second) => second.created - first.created);
  const subscription =
    sortedSubscriptions.find((item) => isActiveStatus(item.status)) || sortedSubscriptions[0];

  if (!subscription) {
    await saveCustomerSubscription({
      customerId: customer.id,
      email: normalizedEmail,
      subscriptionId: "",
      status: "no_subscription",
      source: "manual_sync",
    });
    return {
      active: false,
      status: "no_subscription",
      customerId: customer.id,
      subscriptionId: null,
    };
  }

  const record = await saveCustomerSubscription({
    customerId: customer.id,
    email: normalizedEmail,
    subscriptionId: subscription.id,
    status: subscription.status,
    source: "manual_sync",
  });

  return {
    active: isActiveStatus(record.status),
    status: record.status,
    customerId: record.customerId,
    subscriptionId: record.subscriptionId,
  };
}

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (request, response) => {
  const stripe = getStripe();
  const webhookSecret = getStripeWebhookSecret();
  if (!stripe || !webhookSecret || webhookSecret.includes("replace_me")) {
    response.status(400).send("Webhook secret is not configured.");
    return;
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, request.headers["stripe-signature"], webhookSecret);
  } catch (error) {
    response.status(400).send(`Webhook signature verification failed: ${error.message}`);
    return;
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      await saveCustomerSubscription({
        customerId: session.customer,
        email: session.customer_details?.email || session.customer_email,
        subscriptionId: session.subscription,
        status: "checkout_complete",
        source: event.type,
      });
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object;
      let email = "";
      if (subscription.customer && stripe) {
        const customer = await stripe.customers.retrieve(subscription.customer);
        email = customer.deleted ? "" : customer.email;
      }
      await saveCustomerSubscription({
        customerId: subscription.customer,
        email,
        subscriptionId: subscription.id,
        status: subscription.status,
        source: event.type,
      });
    }

    response.json({ received: true });
  } catch (error) {
    console.error("Webhook handler failed", error);
    response.status(500).send("Webhook handler failed.");
  }
});

app.use(express.json());

app.get("/api/config", (_request, response) => {
  const secretKey = getStripeSecretKey();
  const publishableKey = getStripePublishableKey();
  const priceId = getStripePriceId();
  response.json({
    paymentsReady: paymentsReady(),
    mode: secretKey.startsWith("sk_test_") ? "test" : secretKey ? "live" : "not_configured",
    publishableKeyConfigured: Boolean(publishableKey && !publishableKey.includes("replace_me")),
    priceConfigured: Boolean(priceId && !priceId.includes("replace_me")),
  });
});

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    service: "ticketready-web",
    paymentsReady: paymentsReady(),
    storage: getStorageStatus(),
    time: new Date().toISOString(),
  });
});

app.post("/api/local/configure-stripe", async (request, response) => {
  if (!isLocalRequest(request)) {
    response.status(403).json({ error: "Local Stripe setup is only available from this computer." });
    return;
  }

  const publishableKey = sanitizeEnvValue(request.body.publishableKey);
  const secretKey = sanitizeEnvValue(request.body.secretKey);
  const priceId = sanitizeEnvValue(request.body.priceId);
  const webhookSecret = sanitizeEnvValue(request.body.webhookSecret);
  const validationError = validateStripeSetup({ publishableKey, secretKey, priceId, webhookSecret });

  if (validationError) {
    response.status(400).json({ error: validationError });
    return;
  }

  await writeEnvFile({
    publishableKey,
    secretKey,
    priceId: priceId || "price_replace_me",
    webhookSecret: webhookSecret || "whsec_replace_me",
  });

  response.json({
    ok: true,
    paymentsReady: paymentsReady(),
    priceConfigured: !isPlaceholder(getStripePriceId()),
  });
});

app.post("/api/local/create-stripe-price", async (request, response) => {
  if (!isLocalRequest(request)) {
    response.status(403).json({ error: "Local Stripe setup is only available from this computer." });
    return;
  }

  const stripe = getStripe();
  if (!stripe) {
    response.status(400).json({ error: "Save a valid sk_test_ secret key first." });
    return;
  }

  try {
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

    await writeEnvFile({
      publishableKey: getStripePublishableKey(),
      secretKey: getStripeSecretKey(),
      priceId: price.id,
      webhookSecret: getStripeWebhookSecret(),
    });

    response.json({
      ok: true,
      productId: product.id,
      priceId: price.id,
      paymentsReady: paymentsReady(),
    });
  } catch (error) {
    response.status(500).json({ error: "Could not create Stripe product and price." });
  }
});

app.get("/api/entitlements", async (request, response) => {
  const email = normalizeEmail(request.query.email);
  if (!email) {
    response.status(400).json({ error: "Email is required." });
    return;
  }
  response.json(await getEntitlementWithStripeFallback(email));
});

app.post("/api/accounts", async (request, response) => {
  const email = normalizeEmail(request.body.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  const profile = await saveProfile(email);
  const entitlement = await getEntitlementWithStripeFallback(email);
  response.json({ profile, entitlement, progress: profile.progress, progressUpdatedAt: profile.progressUpdatedAt });
});

app.get("/api/progress", async (request, response) => {
  const email = normalizeEmail(request.query.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  const profile = await saveProfile(email);
  response.json({
    email,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.post("/api/progress", async (request, response) => {
  const email = normalizeEmail(request.body.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  const profile = await saveProgress(email, request.body.progress || {});
  response.json({
    email,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.get("/api/mobile/bootstrap", async (request, response) => {
  const email = normalizeEmail(request.query.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  const profile = await saveProfile(email);
  const entitlement = await getEntitlementWithStripeFallback(email);
  response.json({
    profile,
    entitlement,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
    serverTime: new Date().toISOString(),
    contentVersion: "ticketready-v0.1",
  });
});

app.post("/api/sync-subscription", async (request, response) => {
  const email = normalizeEmail(request.body.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  try {
    const entitlement = await syncSubscriptionFromStripe(email);
    response.json(entitlement);
  } catch (error) {
    response.status(503).json({ error: error.message });
  }
});

app.post("/api/confirm-checkout-session", async (request, response) => {
  const stripe = getStripe();
  const sessionId = String(request.body.sessionId || "").trim();

  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured yet." });
    return;
  }

  if (!sessionId.startsWith("cs_test_") && !sessionId.startsWith("cs_live_")) {
    response.status(400).json({ error: "A valid Checkout Session ID is required." });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
    const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
    const subscription =
      typeof session.subscription === "string" ? { id: session.subscription, status: "checkout_complete" } : session.subscription;
    const email = session.customer_details?.email || session.customer_email || session.customer?.email || "";

    if (!customerId) {
      response.status(400).json({ error: "Checkout session does not have a customer yet." });
      return;
    }

    const record = await saveCustomerSubscription({
      customerId,
      email,
      subscriptionId: subscription?.id || "",
      status: subscription?.status || "checkout_complete",
      source: "checkout_return",
    });

    response.json({
      active: isActiveStatus(record.status),
      status: record.status,
      customerId: record.customerId,
      subscriptionId: record.subscriptionId,
      email: record.email,
    });
  } catch (error) {
    response.status(500).json({ error: "Could not confirm checkout session." });
  }
});

app.post("/api/create-checkout-session", async (request, response) => {
  if (!paymentsReady()) {
    response.status(503).json({
      error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID to .env.",
    });
    return;
  }

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const email = normalizeEmail(request.body.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  try {
    await saveProfile(email);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/?checkout=cancelled`,
      client_reference_id: email,
      metadata: {
        app: "ticketready",
        plan: "pro_lab",
      },
      subscription_data: {
        metadata: {
          app: "ticketready",
          plan: "pro_lab",
        },
      },
    });

    response.json({ url: session.url });
  } catch (error) {
    console.error("Checkout creation failed", error);
    response.status(500).json({ error: "Could not create checkout session." });
  }
});

app.post("/api/create-portal-session", async (request, response) => {
  const stripe = getStripe();
  if (!stripe) {
    response.status(503).json({ error: "Stripe is not configured yet." });
    return;
  }

  const email = normalizeEmail(request.body.email);
  const entitlement = await getEntitlementWithStripeFallback(email);
  if (!entitlement.customerId) {
    response.status(404).json({ error: "No Stripe customer found for that email." });
    return;
  }

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: entitlement.customerId,
      return_url: `${siteUrl}/`,
    });
    response.json({ url: portalSession.url });
  } catch (error) {
    console.error("Portal creation failed", error);
    response.status(500).json({ error: "Could not create customer portal session." });
  }
});

app.use(express.static(__dirname));

app.use((_request, response) => {
  response.sendFile(path.join(__dirname, "index.html"));
});

app.listen(port, () => {
  console.log(`TicketReady is running at ${siteUrl}`);
  console.log(paymentsReady() ? "Stripe Checkout is configured." : "Stripe Checkout needs .env keys before payments work.");
});
