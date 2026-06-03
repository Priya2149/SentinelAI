import "server-only";

import { prisma } from "@/lib/prisma";

export async function getStatusCountsSince(since: Date) {
  return prisma.modelCall.groupBy({
    by: ["status"],
    _count: { status: true },
    where: {
      createdAt: {
        gte: since,
      },
    },
  });
}

export async function getLatestOverviewCalls({
  since,
  skip,
  take,
}: {
  since: Date;
  skip: number;
  take: number;
}) {
  return prisma.modelCall.findMany({
    skip,
    take,
    orderBy: {
      createdAt: "desc",
    },
    where: {
      createdAt: {
        gte: since,
      },
    },
    select: {
      id: true,
      createdAt: true,
      model: true,
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