import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getModelAnalyticsGroups(
  where: Prisma.ModelCallWhereInput
) {
  return prisma.modelCall.groupBy({
    by: ["model"],
    where,
    _count: { id: true },
    _avg: {
      latencyMs: true,
      costUsd: true,
    },
    _sum: {
      costUsd: true,
    },
  });
}

export async function getModelErrorGroups(where: Prisma.ModelCallWhereInput) {
  return prisma.modelCall.groupBy({
    by: ["model"],
    where: {
      ...where,
      status: { not: "SUCCESS" },
    },
    _count: { id: true },
  });
}

export async function getUserAnalyticsGroups(
  where: Prisma.ModelCallWhereInput
) {
  return prisma.modelCall.groupBy({
    by: ["userId"],
    where,
    _count: { id: true },
    _avg: {
      latencyMs: true,
    },
    _sum: {
      costUsd: true,
    },
  });
}

export async function getUserErrorGroups(where: Prisma.ModelCallWhereInput) {
  return prisma.modelCall.groupBy({
    by: ["userId"],
    where: {
      ...where,
      status: { not: "SUCCESS" },
    },
    _count: { id: true },
  });
}

export async function findUsersByIds(userIds: string[]) {
  if (userIds.length === 0) return [];

  return prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      id: true,
      email: true,
    },
  });
}