import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client"; // ✅ type-only; no runtime code

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0; // ✅ stop ISR/build from touching this

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
    // ✅ Lazy import so Prisma client isn't loaded at build
    const { prisma } = await import("@/lib/prisma");

    const url = new URL(req.url);
    const from = parseDate(url.searchParams.get("from"));
    const to = parseDate(url.searchParams.get("to"));
    const models: string[] = url.searchParams.getAll("model");

    const where: Prisma.ModelCallWhereInput = {};

    if (from || to) {
      const createdAt: Prisma.DateTimeFilter = {};
      if (from) createdAt.gte = from;
      if (to) createdAt.lt = endExclusive(to);
      where.createdAt = createdAt;
    }

    if (models.length) {
      where.model = { in: models };
    }

    const byModel = await prisma.modelCall.groupBy({
      by: ["model"],
      where,
      _count: { _all: true },
      _avg: { latencyMs: true, costUsd: true },
    });

    const fails = await prisma.modelCall.groupBy({
      by: ["model"],
      where: { ...where, status: { not: "SUCCESS" } }, // ✅ fixed spread
      _count: { _all: true },
    });

    const failMap = new Map<string, number>(
      fails.map((f) => [f.model, f._count._all])
    );

    const rows = byModel.map((m) => ({
      model: m.model,
      calls: m._count._all,
      avgLatencyMs: Math.round(m._avg.latencyMs ?? 0),
      avgCostUsd: +(m._avg.costUsd ?? 0),
      errorRate: m._count._all
        ? (failMap.get(m.model) ?? 0) / m._count._all
        : 0,
    }));

    return NextResponse.json(rows);
  } catch (err) {
    // Prevent a stray build-time hit from crashing the build
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
