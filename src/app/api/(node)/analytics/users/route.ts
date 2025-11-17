// src/app/api/analytics/users/route.ts
import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(+d) ? null : d;
}

function endExclusive(d: Date): Date {
  return new Date(d.getTime() + 24 * 60 * 60 * 1000);
}

export async function GET(req: Request) {
  try {
    const { prisma } = await import("@/lib/prisma");

    const url = new URL(req.url);
    const from = parseDate(url.searchParams.get("from"));
    const to = parseDate(url.searchParams.get("to"));

    const where: Prisma.ModelCallWhereInput = {};

    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = from;
      if (to) createdAt.lt = endExclusive(to);
      where.createdAt = createdAt;
    }

    const byUser = await prisma.modelCall.groupBy({
      by: ["userId"],
      where,
      _count: { _all: true },
      _sum: { costUsd: true },
      _avg: { latencyMs: true },
    });

    const fails = await prisma.modelCall.groupBy({
      by: ["userId"],
      where: { ...where, status: { not: "SUCCESS" } },
      _count: { _all: true },
    });

    const failMap = new Map(fails.map((f) => [f.userId, f._count._all]));

    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });
    const emailById = new Map(users.map((u) => [u.id, u.email]));

    const rows = byUser.map((u) => ({
      user: emailById.get(u.userId ?? "") ?? "anon",
      calls: u._count._all,
      totalCostUsd: +(u._sum.costUsd ?? 0),
      avgLatencyMs: Math.round(u._avg.latencyMs ?? 0),
      errorRate: u._count._all
        ? (failMap.get(u.userId) ?? 0) / u._count._all
        : 0,
    }));

    return NextResponse.json(rows);
  } catch (err) {
    console.error("analytics/users error", err);
    return NextResponse.json(
      { error: "Failed to fetch user analytics" },
      { status: 500 }
    );
  }
}
