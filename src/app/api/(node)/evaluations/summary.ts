// app/api/evaluations/summary/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ---------- API response types ----------
interface EvalSummaryByKind {
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  avgScore: number;
}
interface EvalSummary {
  totalEvaluations: number;
  overallPassRate: number;
  byKind: Record<string, EvalSummaryByKind>;
  recentTrends: {
    date: string;
    total: number;
    passed: number;
    passRate: number;
  }[];
  riskyCalls: {
    callId: string;
    timestamp: Date;
    failedEvals: string[];
    riskScore: number;
  }[];
}

// ------------------- GET: rollup summary -------------------
export async function GET(req: Request) {
  const url = new URL(req.url);
  const daysParam = url.searchParams.get("days");
  const days = Number.isFinite(Number(daysParam)) ? parseInt(daysParam || "30", 10) : 30;

  try {
    // Date range: [startDate, now)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // 1) Fetch eval results (no include)
    const evaluations = await prisma.evalResult.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
    });
    type Evaluation = (typeof evaluations)[number];

    // 2) Fetch related calls in one batch (by callId)
    const callIds = Array.from(new Set(evaluations.map((e) => e.callId)));
    const calls = await prisma.modelCall.findMany({
      where: { id: { in: callIds } },
      select: {
        id: true,
        createdAt: true,
        status: true,
        prompt: true,
        response: true,
        model: true,
      },
    });
    const callById = new Map(calls.map((c) => [c.id, c]));

    // Overall
    const totalEvaluations = evaluations.length;
    const passedEvaluations = evaluations.filter((e) => e.passed).length;
    const overallPassRate =
      totalEvaluations > 0 ? (passedEvaluations / totalEvaluations) * 100 : 100;

    // By kind
    const groupedByKind = evaluations.reduce<Record<string, Evaluation[]>>((acc, evaluation) => {
      (acc[evaluation.kind] ??= []).push(evaluation);
      return acc;
    }, {});

    const byKind: Record<string, EvalSummaryByKind> = {};
    Object.entries(groupedByKind).forEach(([kind, list]) => {
      const passed = list.filter((e) => e.passed).length;
      const total = list.length;
      const failed = total - passed;
      const avgScoreRaw = total > 0 ? list.reduce((s, e) => s + (e.score ?? 0), 0) / total : 0;

      byKind[kind] = {
        total,
        passed,
        failed,
        passRate: total > 0 ? (passed / total) * 100 : 100,
        avgScore: Math.round(avgScoreRaw * 100) / 100,
      };
    });

    // Recent 7-day trend (inclusive of today)
    const recentTrends: EvalSummary["recentTrends"] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const dayEvals = evaluations.filter(
        (e) => e.createdAt >= dayStart && e.createdAt < dayEnd
      );
      const dayPassed = dayEvals.filter((e) => e.passed).length;
      const dayTotal = dayEvals.length;

      recentTrends.push({
        date: dayStart.toISOString().split("T")[0],
        total: dayTotal,
        passed: dayPassed,
        passRate: dayTotal > 0 ? (dayPassed / dayTotal) * 100 : 100,
      });
    }

    // Risky calls (multiple failed evals)
    const failedByCall = evaluations
      .filter((e) => !e.passed)
      .reduce<Record<string, { callId: string; timestamp: Date; failedEvals: string[] }>>(
        (acc, evaluation) => {
          const call = callById.get(evaluation.callId);
          const timestamp = call?.createdAt ?? evaluation.createdAt; // fallback if call missing
          const callId = evaluation.callId;

          if (!acc[callId]) {
            acc[callId] = { callId, timestamp, failedEvals: [] };
          }
          acc[callId].failedEvals.push(evaluation.kind);
          return acc;
        },
        {}
      );

    const riskyCalls: EvalSummary["riskyCalls"] = Object.values(failedByCall)
      .map((call) => ({
        ...call,
        riskScore: call.failedEvals.length * 25,
      }))
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);

    const summary: EvalSummary = {
      totalEvaluations,
      overallPassRate: Math.round(overallPassRate * 100) / 100,
      byKind,
      recentTrends,
      riskyCalls,
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to generate evaluation summary:", error);
    return NextResponse.json(
      { error: "Failed to generate evaluation summary" },
      { status: 500 }
    );
  }
}

// ------------- POST: detailed evaluations for a given call -------------
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const callId =
      typeof body === "object" && body !== null && "callId" in body
        ? (body as { callId?: string }).callId
        : undefined;

    if (!callId) {
      return NextResponse.json({ error: "callId is required" }, { status: 400 });
    }

    // Fetch evals for that call
    const evaluations = await prisma.evalResult.findMany({
      where: { callId },
      orderBy: { createdAt: "asc" },
    });

    if (evaluations.length === 0) {
      return NextResponse.json({ error: "No evaluations found for this call" }, { status: 404 });
    }

    // Fetch the call itself
    const call = await prisma.modelCall.findUnique({
      where: { id: callId },
      select: {
        id: true,
        prompt: true,
        response: true,
        status: true,
        createdAt: true,
        model: true,
      },
    });

    return NextResponse.json({
      callId,
      modelCall: call ?? null,
      evaluations: evaluations.map((e) => ({
        kind: e.kind,
        passed: e.passed,
        score: e.score,
        details: e.details,
        createdAt: e.createdAt,
      })),
    });
  } catch (error) {
    console.error("Failed to get evaluation details:", error);
    return NextResponse.json({ error: "Failed to get evaluation details" }, { status: 500 });
  }
}
