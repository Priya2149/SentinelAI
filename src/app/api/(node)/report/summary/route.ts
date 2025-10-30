import { NextResponse } from "next/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 20;
export const revalidate = 0; 
export async function GET() {
  const { prisma } = await import("@/lib/prisma");
  try {
    const total = await prisma.modelCall.count();
    const cost = await prisma.modelCall.aggregate({ _sum: { costUsd: true } });
    const hallucinations = await prisma.modelCall.count({ where: { hallucinated: true } });
    const avgLatency = await prisma.modelCall.aggregate({ _avg: { latencyMs: true } });
    const fail = await prisma.modelCall.count({ where: { status: { in: ["FAIL", "FLAGGED"] } } });

    const rate = total ? hallucinations / total : 0;

    return NextResponse.json({
      totalCalls: total,
      estimatedCostUsd: Number(cost._sum.costUsd ?? 0),
      avgLatencyMs: Math.round(avgLatency._avg.latencyMs ?? 0),
      hallucinationRate: rate,
      failures: fail,
      euAiActRisk: "Minimal risk (demo)",
    });
  } catch (err) {
    console.error("/api/overview GET failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
