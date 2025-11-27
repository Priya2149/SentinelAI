// lib/seedDemoDataAggressive.ts
// This version ALWAYS ensures fresh data from TODAY

import { prisma } from "@/lib/prisma";

const DEMO_MODELS = [
  "gpt-4-turbo",
  "gpt-3.5-turbo", 
  "claude-3-opus",
  "claude-3-sonnet",
  "gemini-pro",
  "llama-3-70b",
];

const DEMO_USERS = [
  "alice@sentinelai.dev",
  "bob@sentinelai.dev",
  "charlie@sentinelai.dev",
  "diana@sentinelai.dev",
];

const DEMO_PROMPTS = [
  "Summarize this document",
  "Generate a product description",
  "Analyze customer feedback",
  "Write a marketing email",
  "Code review assistance",
  "Translate to Spanish",
  "Generate test cases",
  "Debug this error",
];

const MODEL_COSTS = {
  "gpt-4-turbo": 0.01,
  "gpt-3.5-turbo": 0.0015,
  "claude-3-opus": 0.015,
  "claude-3-sonnet": 0.003,
  "gemini-pro": 0.00025,
  "llama-3-70b": 0.0007,
};

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRecentTimestamp(hoursAgo: number): Date {
  const now = new Date();
  const minutesAgo = randomInt(0, 59);
  return new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
}

export async function ensureAlwaysFreshData() {
  try {
    // Check how many calls we have in last 24 hours
    const last24Hours = await prisma.modelCall.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    // If we have 30+ calls in last 24hrs, we're good
    if (last24Hours >= 30) {
      console.log(`Sufficient 24hr data exists (${last24Hours} calls)`);
      return;
    }

    console.log(`Seeding fresh 24hr data (currently ${last24Hours} calls)...`);

    // Ensure users exist
    for (const email of DEMO_USERS) {
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1),
        },
      });
    }

    const users = await prisma.user.findMany({
      where: { email: { in: DEMO_USERS } },
    });

    // Generate calls ONLY for last 24 hours
    const callsNeeded = 35 - last24Hours; // Top up to 35 calls
    
    for (let i = 0; i < callsNeeded; i++) {
      const model = randomElement(DEMO_MODELS);
      const user = randomElement(users);
      const prompt = randomElement(DEMO_PROMPTS);
      
      // Distribute across last 24 hours
      // 40% in last 4 hours, 35% in 4-12 hours, 25% in 12-24 hours
      const hoursAgo = Math.random() < 0.4 
        ? randomInt(0, 4)      // Recent activity
        : Math.random() < 0.6
        ? randomInt(4, 12)     // Mid-day
        : randomInt(12, 23);   // Earlier today
      
      const timestamp = generateRecentTimestamp(hoursAgo);
      
      // Realistic latency
      const latencyMs = Math.random() < 0.85 
        ? randomInt(300, 800)
        : randomInt(1200, 2500);
      
      const tokens = randomInt(500, 3000);
      const costPerToken = MODEL_COSTS[model as keyof typeof MODEL_COSTS] / 1000;
      const costUsd = tokens * costPerToken;
      
      // 8-12% error rate
      const shouldFail = Math.random() < 0.10;
      const status = shouldFail ? "FAIL" : "OK";
      const responseLength = shouldFail ? 0 : randomInt(200, 1500);
      
      // Match your schema: promptTokens, respTokens, CallStatus enum
      const promptTokens = randomInt(50, 500);
      const respTokens = shouldFail ? 0 : randomInt(100, 2500);
      
      await prisma.modelCall.create({
        data: {
          model,
          userId: user.id,
          prompt: prompt,
          response: shouldFail ? "Error: Request timeout" : "Response generated successfully",
          promptTokens,
          respTokens,
          latencyMs,
          costUsd,
          status: shouldFail ? "FAIL" : "SUCCESS", // ← Use your CallStatus enum
          hallucinated: false, // Set later via evals
          toxic: false,
          createdAt: timestamp,
        },
      });
    }

    // Add evals for some recent calls
    const recentCallsForEval = await prisma.modelCall.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    for (const call of recentCallsForEval) {
      const shouldFlag = Math.random() < 0.12;
      
      // Use your EvalKind enum
      const evalKind = randomElement(["HALLUCINATION", "TOXICITY", "PII", "INJECTION"] as const);
      
      // Check if eval already exists (unique constraint)
      const existingEval = await prisma.evalResult.findUnique({
        where: {
          callId_kind: {
            callId: call.id,
            kind: evalKind,
          },
        },
      });

      if (!existingEval) {
        await prisma.evalResult.create({
          data: {
            callId: call.id,
            kind: evalKind,
            passed: !shouldFlag,
            score: shouldFlag ? 0.3 : 0.95,
            details: shouldFlag ? "Potential issue detected" : "All checks passed",
          },
        });
      }
    }

    console.log(` Fresh 24hr data seeded! Now ${last24Hours + callsNeeded} calls`);
  } catch (error) {
    console.error(" Error seeding fresh data:", error);
  }
}