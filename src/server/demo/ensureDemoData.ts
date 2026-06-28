import { prisma } from "@/lib/db";
import { EvalKind } from "@/generated/prisma/client";

const USERS = ["alice@example.com", "bob@example.com", "carol@example.com"];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function ensureDemoData() {
  const recentCount = await prisma.modelCall.count({
    where: {
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  if (recentCount >= 30) {
    return;
  }

  const users = await Promise.all(
    USERS.map((email) =>
      prisma.user.upsert({
        where: { email },
        update: {},
        create: { email },
      })
    )
  );

  for (let i = 0; i < 80; i++) {
    const user = users[i % users.length];

    const promptTokens = randInt(40, 180);
    const respTokens = randInt(80, 350);
    const latencyMs = randInt(250, 1200);

    const isFlagged = i % 11 === 0;
    const isFail = i % 17 === 0;

    const status = isFail ? "FAIL" : isFlagged ? "FLAGGED" : "SUCCESS";

    const call = await prisma.modelCall.create({
      data: {
        userId: user.id,
        model: i % 2 === 0 ? "gpt-4.1-mini" : "gpt-4o-mini",
        prompt: isFlagged
          ? "Check this user input for policy risk."
          : "Summarize the uploaded document.",
        response: isFail
          ? "Provider timeout."
          : "Here is a concise response based on the request.",
        latencyMs,
        promptTokens,
        respTokens,
        costUsd: (promptTokens + respTokens) * 0.000002,
        status,
        hallucinated: isFlagged && i % 3 === 0,
        toxic: false,
        createdAt: new Date(Date.now() - i * 45 * 60 * 1000),
      },
    });

    await prisma.evalResult.create({
      data: {
        callId: call.id,
        kind: EvalKind.GROUNDING,
        passed: !isFlagged && !isFail,
        score: isFlagged || isFail ? 0.25 : 0.94,
        details: "Demo evaluation result.",
      },
    });
  }
}