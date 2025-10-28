import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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
  const u = users[i % users.length];
  const promptTokens = rand(20, 120);
  const respTokens = rand(50, 300);
  const latency = rand(120, 1200);
  const model = i % 2 ? "gpt-4o-mini" : "gpt-4.1";
  const halluc = Math.random() < 0.08;
  const tox = Math.random() < 0.03;

  const call = await prisma.modelCall.create({
    data: {
      userId: u.id,
      model,
      prompt: "Capital of France?",
      response: halluc ? "Lyon" : "Paris",
      latencyMs: latency,
      promptTokens,
      respTokens,
      costUsd: (promptTokens + respTokens) * 0.000002,
      status: halluc || tox ? "FLAGGED" : "SUCCESS",
      hallucinated: halluc,
      toxic: tox,
      createdAt: new Date(Date.now() - i * 3600_000),
    },
  });

  await prisma.evalResult.create({
    data: {
      callId: call.id,                // <- direct FK instead of ModelCall.connect
      kind: "HALLUCINATION",
      passed: !halluc,
      score: halluc ? 0 : 1,
      details: "seed",
    },
  });

  await prisma.evalResult.create({
    data: {
      callId: call.id,
      kind: "TOXICITY",
      passed: !tox,
      score: tox ? 0 : 1,
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
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
