import "dotenv/config";

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DIRECT_URL or DATABASE_URL is required for seeding");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const USERS = ["alice@example.com", "bob@example.com", "carol@example.com"];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const users = await Promise.all(
    USERS.map((email) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      })
    )
  );

  for (let i = 0; i < 120; i++) {
    const user = users[i % users.length];

    const promptTokens = rand(20, 120);
    const respTokens = rand(50, 300);
    const latency = rand(120, 1200);
    const model = i % 2 ? "gpt-4o-mini" : "gpt-4.1";
    const hallucinated = Math.random() < 0.08;
    const toxic = Math.random() < 0.03;

    const call = await prisma.modelCall.create({
      data: {
        userId: user.id,
        model,
        prompt: "Capital of France?",
        response: hallucinated ? "Lyon" : "Paris",
        latencyMs: latency,
        promptTokens,
        respTokens,
        costUsd: (promptTokens + respTokens) * 0.000002,
        status: hallucinated || toxic ? "FLAGGED" : "SUCCESS",
        hallucinated,
        toxic,
        createdAt: new Date(Date.now() - i * 3600_000),
      },
    });

    await prisma.evalResult.create({
      data: {
        callId: call.id,
        kind: "HALLUCINATION",
        passed: !hallucinated,
        score: hallucinated ? 0 : 1,
        details: "seed",
      },
    });

    await prisma.evalResult.create({
      data: {
        callId: call.id,
        kind: "TOXICITY",
        passed: !toxic,
        score: toxic ? 0 : 1,
        details: "seed",
      },
    });
  }
}

main()
  .then(async () => {
    console.log("Seeded!");
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });