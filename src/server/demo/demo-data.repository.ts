import "server-only";

import { prisma } from "@/lib/prisma";
import type { DemoEval } from "./demo-scenarios";
import { DEMO_USER_EMAILS } from "./demo-scenarios";

type CreateDemoCallInput = {
  userId: string;
  model: string;
  prompt: string;
  response: string;
  status: "SUCCESS" | "FAIL" | "FLAGGED";
  latencyMs: number;
  promptTokens: number;
  respTokens: number;
  costUsd: number;
  hallucinated: boolean;
  toxic: boolean;
  createdAt: Date;
  evals: DemoEval[];
};

export async function countRecentDemoModelCalls(since: Date) {
  return prisma.modelCall.count({
    where: {
      createdAt: {
        gte: since,
      },
      user: {
        email: {
          in: [...DEMO_USER_EMAILS],
        },
      },
    },
  });
}

export async function getNewestDemoModelCall() {
  return prisma.modelCall.findFirst({
    where: {
      user: {
        email: {
          in: [...DEMO_USER_EMAILS],
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      createdAt: true,
    },
  });
}

export async function resetDemoModelCalls() {
  const demoCalls = await prisma.modelCall.findMany({
    where: {
      user: {
        email: {
          in: [...DEMO_USER_EMAILS],
        },
      },
    },
    select: {
      id: true,
    },
  });

  const demoCallIds = demoCalls.map((call) => call.id);

  if (!demoCallIds.length) {
    return;
  }

  await prisma.evalResult.deleteMany({
    where: {
      callId: {
        in: demoCallIds,
      },
    },
  });

  await prisma.modelCall.deleteMany({
    where: {
      id: {
        in: demoCallIds,
      },
    },
  });
}

export async function upsertDemoUsers() {
  return Promise.all(
    DEMO_USER_EMAILS.map((email) =>
      prisma.user.upsert({
        where: {
          email,
        },
        update: {},
        create: {
          email,
        },
      })
    )
  );
}

export async function createDemoModelCall(input: CreateDemoCallInput) {
  const call = await prisma.modelCall.create({
    data: {
      userId: input.userId,
      model: input.model,
      prompt: input.prompt,
      response: input.response,
      status: input.status,
      latencyMs: input.latencyMs,
      promptTokens: input.promptTokens,
      respTokens: input.respTokens,
      costUsd: input.costUsd,
      hallucinated: input.hallucinated,
      toxic: input.toxic,
      createdAt: input.createdAt,
    },
  });

  await prisma.evalResult.createMany({
    data: input.evals.map((evalItem) => ({
      callId: call.id,
      kind: evalItem.kind,
      passed: evalItem.passed,
      score: evalItem.score,
      details: evalItem.details,
    })),
  });

  return call;
}