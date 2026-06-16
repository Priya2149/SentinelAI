import "server-only";

import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export async function findLogsPage({
  where,
  skip,
  take,
}: {
  where: Prisma.ModelCallWhereInput;
  skip: number;
  take: number;
}) {
  return prisma.modelCall.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take,
    select: {
      id: true,
      createdAt: true,
      model: true,
      prompt: true,
      response: true,
      latencyMs: true,
      promptTokens: true,
      respTokens: true,
      costUsd: true,
      status: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });
}

export async function getLogsStats(where: Prisma.ModelCallWhereInput) {
  const [totalCalls, sumCost, avgLatency, errorCount] = await Promise.all([
    prisma.modelCall.count({ where }),

    prisma.modelCall.aggregate({
      where,
      _sum: { costUsd: true },
    }),

    prisma.modelCall.aggregate({
      where,
      _avg: { latencyMs: true },
    }),

    prisma.modelCall.count({
      where: {
        ...where,
        status: { not: "SUCCESS" },
      },
    }),
  ]);

  return {
    totalCalls,
    totalCost: Number(sumCost._sum.costUsd ?? 0),
    avgLatency: Math.round(avgLatency._avg.latencyMs ?? 0),
    errorRate: totalCalls > 0 ? errorCount / totalCalls : 0,
  };
}

type LogsFilterOptionRow = {
  model: string;
  user: {
    email: string;
  } | null;
};

export async function getLogsFilterOptions() {
  const rows: LogsFilterOptionRow[] = await prisma.modelCall.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
    select: {
      model: true,
      user: {
        select: {
          email: true,
        },
      },
    },
  });

  const models = Array.from(new Set(rows.map((row) => row.model)))
    .filter((model): model is string => Boolean(model))
    .sort();

  const users = Array.from(
    new Set(
      rows
        .map((row) => row.user?.email)
        .filter((email): email is string => Boolean(email))
    )
  ).sort();

  return {
    models,
    users,
  };
}