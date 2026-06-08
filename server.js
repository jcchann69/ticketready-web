import "dotenv/config";

import express from "express";
import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import Stripe from "stripe";
import { createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";

let DatabaseSync = null;
let sqliteLoadError = "";

try {
  if (process.env.TICKETREADY_DISABLE_SQLITE === "true") {
    sqliteLoadError = "SQLite disabled by TICKETREADY_DISABLE_SQLITE.";
  } else {
    ({ DatabaseSync } = await import("node:sqlite"));
  }
} catch (error) {
  sqliteLoadError = error.message;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 8788);
const siteUrl = process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${port}`;
const dataDir = path.join(__dirname, "data");
const subscriptionStorePath = path.join(dataDir, "subscriptions.json");
const profileStorePath = path.join(dataDir, "profiles.json");
const databasePath = process.env.DATABASE_PATH || path.join(dataDir, "ticketready.sqlite");
const fallbackDatabasePath = `${databasePath}.json`;
const envPath = path.join(__dirname, ".env");
const loginCodeMinutes = 10;
const sessionDays = 30;
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
let databaseOpenError = "";

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

function getFallbackDatabaseStore() {
  if (fsSync.existsSync(fallbackDatabasePath)) {
    return readJsonFileSync(fallbackDatabasePath, { customers: {}, emails: {}, profiles: {}, authCodes: {}, sessions: {} });
  }

  const subscriptionStore = readJsonFileSync(subscriptionStorePath, { customers: {}, emails: {} });
  const profileStore = readJsonFileSync(profileStorePath, { profiles: {} });
  return {
    customers: subscriptionStore.customers || {},
    emails: subscriptionStore.emails || {},
    profiles: profileStore.profiles || {},
    authCodes: {},
    sessions: {},
  };
}

function writeFallbackDatabaseStore(store) {
  fsSync.mkdirSync(path.dirname(fallbackDatabasePath), { recursive: true });
  fsSync.writeFileSync(fallbackDatabasePath, JSON.stringify(store, null, 2));
}

function runDatabaseTransaction(callback) {
  const db = getDatabase();
  if (!db) {
    throw new Error("SQLite driver is not available.");
  }
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
  if (!DatabaseSync) {
    return null;
  }

  if (database) {
    return database;
  }

  try {
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

      CREATE TABLE IF NOT EXISTS auth_codes (
        email TEXT PRIMARY KEY,
        code_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token_hash TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_seen_at TEXT NOT NULL
      );
    `);
    migrateJsonStoresToDatabase(database);
    return database;
  } catch (error) {
    database = null;
    databaseOpenError = error.message;
    return null;
  }
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
    const db = getDatabase();
    if (!db) {
      getFallbackDatabaseStore();
      return {
        driver: "json-file",
        ready: true,
        persistentPathConfigured: Boolean(process.env.DATABASE_PATH),
        fallbackReason: sqliteLoadError || databaseOpenError || "SQLite driver is not available in this runtime.",
      };
    }

    db.prepare("SELECT 1 AS ok").get();
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
  if (!db) {
    const store = getFallbackDatabaseStore();
    return {
      customers: store.customers || {},
      emails: store.emails || {},
    };
  }

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
  if (!getDatabase()) {
    const fallbackStore = getFallbackDatabaseStore();
    writeFallbackDatabaseStore({
      ...fallbackStore,
      customers: store.customers || {},
      emails: store.emails || {},
    });
    return;
  }

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
  if (!db) {
    const store = getFallbackDatabaseStore();
    return {
      profiles: store.profiles || {},
    };
  }

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
  if (!getDatabase()) {
    const fallbackStore = getFallbackDatabaseStore();
    writeFallbackDatabaseStore({
      ...fallbackStore,
      profiles: store.profiles || {},
    });
    return;
  }

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
    interviews: [],
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

  const interviews = Array.isArray(input.interviews)
    ? input.interviews.slice(0, 20).map((entry) => ({
        question: limitText(entry?.question, 360),
        answer: limitText(entry?.answer, 1200),
        score: Math.round(clampNumber(entry?.score, 0, 100)),
        summary: limitText(entry?.summary, 280),
        notes: Array.isArray(entry?.notes)
          ? entry.notes.slice(0, 8).map((note) => limitText(note, 180)).filter(Boolean)
          : [],
        ticketId: limitText(entry?.ticketId, 24),
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
    interviews,
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

  const interviewMap = new Map();
  [...saved.interviews, ...next.interviews].forEach((entry) => {
    const key = `${entry.createdAt}|${entry.score}|${entry.question}`;
    if (!interviewMap.has(key)) {
      interviewMap.set(key, entry);
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
    interviews: Array.from(interviewMap.values())
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

function getSessionSecret() {
  return process.env.SESSION_SECRET || getStripeSecretKey() || "ticketready-local-session-secret";
}

function hashSecret(value) {
  return createHmac("sha256", getSessionSecret()).update(String(value || "")).digest("hex");
}

function secretsMatch(first, second) {
  const firstBuffer = Buffer.from(String(first || ""), "hex");
  const secondBuffer = Buffer.from(String(second || ""), "hex");
  return firstBuffer.length === secondBuffer.length && timingSafeEqual(firstBuffer, secondBuffer);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isFutureDate(value) {
  return Date.parse(value || "") > Date.now();
}

function generateLoginCode() {
  return String(randomInt(100000, 1000000));
}

function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

async function saveAuthCode(email, code) {
  const normalizedEmail = normalizeEmail(email);
  const record = {
    email: normalizedEmail,
    codeHash: hashSecret(code),
    expiresAt: addMinutes(new Date(), loginCodeMinutes).toISOString(),
    attempts: 0,
    createdAt: new Date().toISOString(),
  };
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    store.authCodes = { ...(store.authCodes || {}), [normalizedEmail]: record };
    writeFallbackDatabaseStore(store);
    return record;
  }

  db.prepare(`
    INSERT OR REPLACE INTO auth_codes (email, code_hash, expires_at, attempts, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(record.email, record.codeHash, record.expiresAt, record.attempts, record.createdAt);
  return record;
}

async function getAuthCode(email) {
  const normalizedEmail = normalizeEmail(email);
  const db = getDatabase();

  if (!db) {
    return (getFallbackDatabaseStore().authCodes || {})[normalizedEmail] || null;
  }

  const row = db.prepare("SELECT email, code_hash, expires_at, attempts, created_at FROM auth_codes WHERE email = ?").get(normalizedEmail);
  return row
    ? {
        email: row.email,
        codeHash: row.code_hash,
        expiresAt: row.expires_at,
        attempts: row.attempts,
        createdAt: row.created_at,
      }
    : null;
}

async function incrementAuthCodeAttempts(email) {
  const normalizedEmail = normalizeEmail(email);
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    const record = (store.authCodes || {})[normalizedEmail];
    if (record) {
      record.attempts = Number(record.attempts || 0) + 1;
      store.authCodes[normalizedEmail] = record;
      writeFallbackDatabaseStore(store);
    }
    return;
  }

  db.prepare("UPDATE auth_codes SET attempts = attempts + 1 WHERE email = ?").run(normalizedEmail);
}

async function deleteAuthCode(email) {
  const normalizedEmail = normalizeEmail(email);
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    delete (store.authCodes || {})[normalizedEmail];
    writeFallbackDatabaseStore(store);
    return;
  }

  db.prepare("DELETE FROM auth_codes WHERE email = ?").run(normalizedEmail);
}

async function createSession(email) {
  const normalizedEmail = normalizeEmail(email);
  const token = generateSessionToken();
  const record = {
    token,
    tokenHash: hashSecret(token),
    email: normalizedEmail,
    expiresAt: addDays(new Date(), sessionDays).toISOString(),
    createdAt: new Date().toISOString(),
    lastSeenAt: new Date().toISOString(),
  };
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    store.sessions = { ...(store.sessions || {}), [record.tokenHash]: { ...record, token: undefined } };
    writeFallbackDatabaseStore(store);
    return record;
  }

  db.prepare(`
    INSERT OR REPLACE INTO sessions (token_hash, email, expires_at, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(record.tokenHash, record.email, record.expiresAt, record.createdAt, record.lastSeenAt);
  return record;
}

async function getSessionByToken(token) {
  if (!token) {
    return null;
  }

  const tokenHash = hashSecret(token);
  const db = getDatabase();
  let record = null;

  if (!db) {
    record = (getFallbackDatabaseStore().sessions || {})[tokenHash] || null;
  } else {
    const row = db.prepare("SELECT token_hash, email, expires_at, created_at, last_seen_at FROM sessions WHERE token_hash = ?").get(tokenHash);
    record = row
      ? {
          tokenHash: row.token_hash,
          email: row.email,
          expiresAt: row.expires_at,
          createdAt: row.created_at,
          lastSeenAt: row.last_seen_at,
        }
      : null;
  }

  if (!record || !secretsMatch(record.tokenHash, tokenHash) || !isFutureDate(record.expiresAt)) {
    return null;
  }

  await touchSession(tokenHash);
  return record;
}

async function touchSession(tokenHash) {
  const lastSeenAt = new Date().toISOString();
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    const record = (store.sessions || {})[tokenHash];
    if (record) {
      record.lastSeenAt = lastSeenAt;
      store.sessions[tokenHash] = record;
      writeFallbackDatabaseStore(store);
    }
    return;
  }

  db.prepare("UPDATE sessions SET last_seen_at = ? WHERE token_hash = ?").run(lastSeenAt, tokenHash);
}

async function deleteSession(token) {
  const tokenHash = hashSecret(token);
  const db = getDatabase();

  if (!db) {
    const store = getFallbackDatabaseStore();
    delete (store.sessions || {})[tokenHash];
    writeFallbackDatabaseStore(store);
    return;
  }

  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

function getRequestToken(request) {
  const header = request.headers.authorization || "";
  const [, token] = header.match(/^Bearer\s+(.+)$/i) || [];
  return token || String(request.body?.authToken || request.query?.authToken || "");
}

async function getRequestSession(request) {
  return getSessionByToken(getRequestToken(request));
}

async function requireSession(request, response) {
  const session = await getRequestSession(request);
  if (!session) {
    response.status(401).json({ error: "Sign in with your email code first." });
    return null;
  }
  return session;
}

function getLoginEmailSubject() {
  return "Your TicketReady login code";
}

function getLoginEmailText(code) {
  return `Your TicketReady login code is ${code}. It expires in ${loginCodeMinutes} minutes.`;
}

function getLoginEmailHtml(code) {
  return `<p>Your TicketReady login code is <strong>${code}</strong>.</p><p>It expires in ${loginCodeMinutes} minutes.</p>`;
}

function parseSenderAddress(value) {
  const trimmed = String(value || "").trim();
  const match = trimmed.match(/^(.*?)\s*<([^>]+)>$/);

  if (match) {
    const name = match[1].replace(/^"|"$/g, "").trim();
    return {
      email: match[2].trim(),
      ...(name ? { name } : {}),
    };
  }

  return { email: trimmed };
}

async function sendResendLoginCode(apiKey, from, email, code) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: getLoginEmailSubject(),
      text: getLoginEmailText(code),
      html: getLoginEmailHtml(code),
    }),
  });

  if (!response.ok) {
    throw new Error("Could not send login code with Resend.");
  }

  return { delivery: "email", provider: "resend" };
}

async function sendBrevoLoginCode(apiKey, from, email, code) {
  const sender = parseSenderAddress(from);
  if (!sender.email) {
    throw new Error("LOGIN_EMAIL_FROM is missing.");
  }

  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender,
      to: [{ email }],
      subject: getLoginEmailSubject(),
      htmlContent: getLoginEmailHtml(code),
    }),
  });

  if (!response.ok) {
    throw new Error("Could not send login code with Brevo.");
  }

  return { delivery: "email", provider: "brevo" };
}

async function sendSendGridLoginCode(apiKey, from, email, code) {
  const sender = parseSenderAddress(from);
  if (!sender.email) {
    throw new Error("LOGIN_EMAIL_FROM is missing.");
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email }],
        },
      ],
      from: sender,
      subject: getLoginEmailSubject(),
      content: [
        { type: "text/plain", value: getLoginEmailText(code) },
        { type: "text/html", value: getLoginEmailHtml(code) },
      ],
    }),
  });

  if (response.status !== 202) {
    throw new Error("Could not send login code with SendGrid.");
  }

  return { delivery: "email", provider: "sendgrid" };
}

async function sendLoginCode(email, code, request) {
  const resendApiKey = process.env.RESEND_API_KEY || "";
  const brevoApiKey = process.env.BREVO_API_KEY || "";
  const sendGridApiKey = process.env.SENDGRID_API_KEY || "";
  const from = process.env.LOGIN_EMAIL_FROM || "";
  const allowDevCode = isLocalRequest(request) || process.env.AUTH_DEV_CODES === "true";

  if (resendApiKey && from) {
    return sendResendLoginCode(resendApiKey, from, email, code);
  }

  if (brevoApiKey && from) {
    return sendBrevoLoginCode(brevoApiKey, from, email, code);
  }

  if (sendGridApiKey && from) {
    return sendSendGridLoginCode(sendGridApiKey, from, email, code);
  }

  if (allowDevCode) {
    return { delivery: "dev", devCode: code };
  }

  throw new Error("Email login is not configured yet. Add BREVO_API_KEY, RESEND_API_KEY, or SENDGRID_API_KEY in Render.");
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

app.post("/api/auth/request-code", async (request, response) => {
  const email = normalizeEmail(request.body.email);
  if (!email || !email.includes("@")) {
    response.status(400).json({ error: "A valid email is required." });
    return;
  }

  try {
    await saveProfile(email);
    const code = generateLoginCode();
    const delivery = await sendLoginCode(email, code, request);
    await saveAuthCode(email, code);
    response.json({
      ok: true,
      email,
      delivery: delivery.delivery,
      devCode: delivery.devCode,
      expiresInMinutes: loginCodeMinutes,
    });
  } catch (error) {
    response.status(503).json({ error: error.message });
  }
});

app.post("/api/auth/verify-code", async (request, response) => {
  const email = normalizeEmail(request.body.email);
  const code = String(request.body.code || "").trim();
  if (!email || !email.includes("@") || !/^\d{6}$/.test(code)) {
    response.status(400).json({ error: "Enter the 6-digit code sent to your email." });
    return;
  }

  const record = await getAuthCode(email);
  if (!record || !isFutureDate(record.expiresAt)) {
    response.status(400).json({ error: "That login code expired. Request a new code." });
    return;
  }

  if (Number(record.attempts || 0) >= 5) {
    await deleteAuthCode(email);
    response.status(429).json({ error: "Too many code attempts. Request a new code." });
    return;
  }

  const incomingHash = hashSecret(code);
  if (!secretsMatch(record.codeHash, incomingHash)) {
    await incrementAuthCodeAttempts(email);
    response.status(400).json({ error: "That code was not correct." });
    return;
  }

  await deleteAuthCode(email);
  const session = await createSession(email);
  const profile = await saveProfile(email);
  const entitlement = await getEntitlementWithStripeFallback(email);
  response.json({
    ok: true,
    email,
    authToken: session.token,
    expiresAt: session.expiresAt,
    profile,
    entitlement,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.get("/api/auth/session", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const profile = await saveProfile(session.email);
  const entitlement = await getEntitlementWithStripeFallback(session.email);
  response.json({
    ok: true,
    email: session.email,
    expiresAt: session.expiresAt,
    profile,
    entitlement,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.post("/api/auth/logout", async (request, response) => {
  const token = getRequestToken(request);
  if (token) {
    await deleteSession(token);
  }
  response.json({ ok: true });
});

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
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }
  response.json(await getEntitlementWithStripeFallback(session.email));
});

app.post("/api/accounts", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const profile = await saveProfile(session.email);
  const entitlement = await getEntitlementWithStripeFallback(session.email);
  response.json({ profile, entitlement, progress: profile.progress, progressUpdatedAt: profile.progressUpdatedAt });
});

app.get("/api/progress", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const profile = await saveProfile(session.email);
  response.json({
    email: session.email,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.post("/api/progress", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const profile = await saveProgress(session.email, request.body.progress || {});
  response.json({
    email: session.email,
    progress: profile.progress,
    progressUpdatedAt: profile.progressUpdatedAt,
  });
});

app.get("/api/mobile/bootstrap", async (request, response) => {
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const profile = await saveProfile(session.email);
  const entitlement = await getEntitlementWithStripeFallback(session.email);
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
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  try {
    const entitlement = await syncSubscriptionFromStripe(session.email);
    response.json(entitlement);
  } catch (error) {
    response.status(503).json({ error: error.message });
  }
});

app.post("/api/confirm-checkout-session", async (request, response) => {
  const stripe = getStripe();
  const authSession = await requireSession(request, response);
  if (!authSession) {
    return;
  }
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
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });
    const customerId = typeof checkoutSession.customer === "string" ? checkoutSession.customer : checkoutSession.customer?.id;
    const subscription =
      typeof checkoutSession.subscription === "string" ? { id: checkoutSession.subscription, status: "checkout_complete" } : checkoutSession.subscription;
    const email = checkoutSession.customer_details?.email || checkoutSession.customer_email || checkoutSession.customer?.email || "";

    if (normalizeEmail(email) !== authSession.email) {
      response.status(403).json({ error: "Checkout session email does not match your signed-in account." });
      return;
    }

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
  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  if (!paymentsReady()) {
    response.status(503).json({
      error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID to .env.",
    });
    return;
  }

  const stripe = getStripe();
  const priceId = getStripePriceId();
  const email = session.email;

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

  const session = await requireSession(request, response);
  if (!session) {
    return;
  }

  const entitlement = await getEntitlementWithStripeFallback(session.email);
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
