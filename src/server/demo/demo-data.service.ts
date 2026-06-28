import "server-only";

import { DEMO_SCENARIOS } from "./demo-scenarios";
import {
  countRecentDemoModelCalls,
  createDemoModelCall,
  getNewestDemoModelCall,
  resetDemoModelCalls,
  upsertDemoUsers,
} from "./demo-data.repository";

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;
const FRESHNESS_WINDOW_MS = 2 * 60 * 1000;
const CHECK_THROTTLE_MS = 30 * 1000;

const MIN_RECENT_ROWS = 50;
const DEMO_ROW_COUNT = 320;

const MODELS = [
  "gpt-4.1-mini",
  "gpt-4o-mini",
  "claude-3-5-sonnet",
  "gemini-1.5-pro",
];

let pendingEnsure: Promise<void> | null = null;
let lastCheckedAt = 0;

function isDemoDataEnabled() {
  if (process.env.NODE_ENV === "test") {
    return false;
  }

  if (process.env.SKIP_DEMO_SEED === "true") {
    return false;
  }

  return process.env.DEMO_DATA_ENABLED === "true" || process.env.NODE_ENV === "development";
}

function randInt(seed: number, min: number, max: number) {
  const value = Math.abs(Math.sin(seed * 9999)) % 1;
  return Math.floor(value * (max - min + 1)) + min;
}

function buildDemoCreatedAt(index: number) {
  const now = Date.now();

  // Very recent rows for realtime metrics.
  if (index < 10) {
    return new Date(now - index * 8 * 1000);
  }

  // Recent rows for Overview and Logs.
  if (index < 96) {
    return new Date(now - index * 15 * 60 * 1000);
  }

  // Spread older rows across ~30 days for Metrics and Analytics charts.
  const dayOffset = Math.floor((index - 96) / 8);
  const hourOffset = (index % 8) * 3;

  return new Date(
    now -
      dayOffset * 24 * 60 * 60 * 1000 -
      hourOffset * 60 * 60 * 1000
  );
}

function buildCostUsd(promptTokens: number, respTokens: number) {
  return Number(((promptTokens + respTokens) * 0.000002).toFixed(6));
}

async function shouldRefreshDemoData() {
  const recentSince = new Date(Date.now() - RECENT_WINDOW_MS);

  const [recentCount, newest] = await Promise.all([
    countRecentDemoModelCalls(recentSince),
    getNewestDemoModelCall(),
  ]);

  if (!newest) {
    return true;
  }

  const newestAgeMs = Date.now() - newest.createdAt.getTime();

  return recentCount < MIN_RECENT_ROWS || newestAgeMs > FRESHNESS_WINDOW_MS;
}

async function refreshDemoData() {
  const users = await upsertDemoUsers();

  await resetDemoModelCalls();

  for (let index = 0; index < DEMO_ROW_COUNT; index++) {
    const scenario = DEMO_SCENARIOS[index % DEMO_SCENARIOS.length];
    const user = users[index % users.length];

    const promptTokens = randInt(index + 10, 45, 220);
    const respTokens = randInt(index + 20, 80, 420);
    const latencyMs = randInt(index + 30, 260, 1450);

    await createDemoModelCall({
      userId: user.id,
      model: MODELS[index % MODELS.length],
      prompt: scenario.prompt,
      response: scenario.response,
      status: scenario.status,
      latencyMs,
      promptTokens,
      respTokens,
      costUsd: buildCostUsd(promptTokens, respTokens),
      hallucinated: Boolean(scenario.hallucinated),
      toxic: Boolean(scenario.toxic),
      createdAt: buildDemoCreatedAt(index),
      evals: scenario.evals,
    });
  }
}

async function ensureDemoDataInternal() {
  if (!(await shouldRefreshDemoData())) {
    return;
  }

  await refreshDemoData();
}

export async function ensureDemoData() {
  if (!isDemoDataEnabled()) {
    return;
  }

  const now = Date.now();

  if (now - lastCheckedAt < CHECK_THROTTLE_MS) {
    return pendingEnsure ?? undefined;
  }

  if (!pendingEnsure) {
    pendingEnsure = ensureDemoDataInternal()
      .catch((error) => {
        console.error("Demo data refresh failed:", error);
      })
      .finally(() => {
        lastCheckedAt = Date.now();
        pendingEnsure = null;
      });
  }

  return pendingEnsure;
}