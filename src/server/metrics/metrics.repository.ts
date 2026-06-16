import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { RealtimeSnapshot, SummaryData } from "./metrics.types";
import { percentile } from "./metrics.utils";

type RawDailyMetric = {
  day: Date;
  calls: bigint;
  avg_latency: number | null;
  cost: number | null;
  errors: bigint;
};

type RealtimeMetricRow = {
  latencyMs: number | null;
  status: string;
  costUsd: number | null;
};

export async function getDailyMetricRows({
  start,
  end,
}: {
  start: Date;
  end: Date;
}): Promise<RawDailyMetric[]> {
  return prisma.$queryRaw<RawDailyMetric[]>(Prisma.sql`
    SELECT date_trunc('day', "createdAt") AS day,
           COUNT(*) AS calls,
           AVG("latencyMs") AS avg_latency,
           SUM("costUsd") AS cost,
           SUM(CASE WHEN status <> 'SUCCESS' THEN 1 ELSE 0 END) AS errors
    FROM "ModelCall"
    WHERE "createdAt" >= ${start}
      AND "createdAt" < ${end}
    GROUP BY 1
    ORDER BY 1 ASC
  `);
}

export async function getMetricsSummaryData(): Promise<SummaryData> {
  const [
    total,
    latencyAgg,
    costAgg,
    successCount,
    failCount,
    flaggedCount,
  ] = await Promise.all([
    prisma.modelCall.count(),

    prisma.modelCall.aggregate({
      _avg: { latencyMs: true },
    }),

    prisma.modelCall.aggregate({
      _avg: { costUsd: true },
    }),

    prisma.modelCall.count({
      where: { status: "SUCCESS" },
    }),

    prisma.modelCall.count({
      where: { status: "FAIL" },
    }),

    prisma.modelCall.count({
      where: { status: "FLAGGED" },
    }),
  ]);

  const flaggedRate = total > 0 ? flaggedCount / total : 0;

  return {
    total,
    avg_latency_ms: Math.round(latencyAgg._avg.latencyMs ?? 0),
    avg_cost_usd: Number((costAgg._avg.costUsd ?? 0).toFixed(6)),
    hallucination_rate: flaggedRate,
    toxicity_rate: flaggedRate,
    statuses: {
      SUCCESS: successCount,
      FAIL: failCount,
      FLAGGED: flaggedCount,
    },
  };
}

export async function getRealtimeSnapshot(): Promise<RealtimeSnapshot> {
  const since = new Date(Date.now() - 60 * 1000);

  const totalCalls = await prisma.modelCall.count();

  const rows: RealtimeMetricRow[] = await prisma.modelCall.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    select: {
      latencyMs: true,
      status: true,
      costUsd: true,
    },
  });

  const calls = rows.length;

  const errors = rows.filter(
    (row: RealtimeMetricRow) => row.status !== "SUCCESS"
  ).length;

  const latencies = rows
    .map((row: RealtimeMetricRow) => row.latencyMs ?? 0)
    .sort((a: number, b: number) => a - b);

  const avgLatency = latencies.length
    ? Math.round(
        latencies.reduce((sum: number, value: number) => sum + value, 0) /
          latencies.length
      )
    : 0;

  const cost60s = Number(
    rows
      .reduce(
        (sum: number, row: RealtimeMetricRow) => sum + (row.costUsd ?? 0),
        0
      )
      .toFixed(6)
  );

  return {
    totalCalls,
    recentCalls: calls,
    avgLatency,
    errorCount: errors,
    callsPerMin: calls,
    errorRate: calls ? (errors / calls) * 100 : 0,
    p50: percentile(latencies, 0.5),
    p95: percentile(latencies, 0.95),
    p99: percentile(latencies, 0.99),
    cost60s,
    timestamp: new Date().toISOString(),
  };
}