// app/api/metrics/summary/route.ts


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0; 


const HALLUCINATION_THRESHOLD = 0.30;
const TOXICITY_THRESHOLD = 0.10;

export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  try {
    // High-level aggregates
    const [countAgg, latencyAgg, costAgg] = await Promise.all([
      prisma.modelCall.count(),
      prisma.modelCall.aggregate({
        _avg: { latencyMs: true },
      }),
      prisma.modelCall.aggregate({
        _avg: { costUsd: true },
      }),
    ]);

    // Group calls by status so we can return SUCCESS / FAIL / FLAGGED counts
    const byStatus = await prisma.modelCall.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const statusCounts: Record<string, number> = {};
    for (const row of byStatus) {
      statusCounts[row.status] = row._count.status;
    }

    // "Safety" sample:
    // We cannot select hallucinationScore or toxicityScore because they don't exist
    // in your schema, so we just grab status for a recent slice of calls.
    const safetyRows = await prisma.modelCall.findMany({
      select: { status: true },
      take: 100_000, // sample cap; fast + good enough for rates
      orderBy: { createdAt: "desc" },
    });

    const total = typeof countAgg === "number" ? countAgg : 0;

    const avgLatency =
      Math.round((latencyAgg._avg.latencyMs ?? 0) as number) || 0;

    const avgCost =
      Number(((costAgg._avg.costUsd ?? 0) as number).toFixed(6)) || 0;

    // Since we don't have hallucinationScore/toxicityScore columns,
    // we'll approximate both "hallucination_rate" and "toxicity_rate"
    // as the fraction of calls that ended up FLAGGED.
    let flaggedCount = 0;
    for (const r of safetyRows) {
      if (r.status === "FLAGGED") {
        flaggedCount++;
      }
    }

    const flaggedRate = total ? flaggedCount / total : 0;

    return Response.json({
      total,
      avg_latency_ms: avgLatency,
      avg_cost_usd: avgCost,
      hallucination_rate: flaggedRate,
      toxicity_rate: flaggedRate,
      statuses: {
        SUCCESS: statusCounts["SUCCESS"] ?? 0,
        FAIL: statusCounts["FAIL"] ?? 0,
        FLAGGED: statusCounts["FLAGGED"] ?? 0,
      },
    });
  } catch (e) {
    return Response.json({ error: "summary_failed" }, { status: 500 });
  }
}
