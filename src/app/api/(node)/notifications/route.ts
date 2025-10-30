// src/app/(dashboard)/api/notifications/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";       // ✅ add this
export const dynamic = "force-dynamic";
export const revalidate = 0; 
export async function GET() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rows = await prisma.modelCall.findMany({
    where: { createdAt: { gte: since }, status: { in: ["FAIL", "FLAGGED"] } },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, status: true, model: true, createdAt: true, user: { select: { email: true } } },
  });

  const windowSince = new Date(Date.now() - 10 * 60 * 1000);
  const last10 = await prisma.modelCall.groupBy({
    by: ["model", "status"],
    where: { createdAt: { gte: windowSince } },
    _count: { _all: true },
  });

  const modelTotals = Object.fromEntries(
    Object.entries(
      last10.reduce((m: Record<string, number>, r) => {
        m[r.model] = (m[r.model] ?? 0) + r._count._all;
        return m;
      }, {})
    )
  );

  const errorSpikes = last10
    .filter(r => r.status === "FAIL")
    .map(r => ({
      model: r.model,
      errPct: (r._count._all / Math.max(1, modelTotals[r.model])) * 100,
    }))
    .filter(x => x.errPct >= 10)
    .map(x => ({
      id: `errspike-${x.model}-${windowSince.getTime()}`,
      ts: new Date().toISOString(),
      severity: x.errPct >= 20 ? "CRITICAL" : "HIGH",
      category: "RELIABILITY",
      event: "ERROR_RATE_SPIKE",
      summary: `Error spike on ${x.model}: ${x.errPct.toFixed(1)}% in last 10m`,
      details: { model: x.model, window: "10m", errorRate: x.errPct },
      href: `/dashboard/analytics?focus=model:${encodeURIComponent(x.model)}`,
      fingerprint: `ERROR_RATE_SPIKE:${x.model}`,
    }));

  const items = rows.map(r => ({
    id: r.id,
    ts: r.createdAt.toISOString?.() ?? String(r.createdAt),
    severity: r.status === "FAIL" ? "HIGH" : "MEDIUM",
    category: "RELIABILITY",
    event: r.status === "FAIL" ? "MODEL_CALL_FAILED" : "FLAGGED_CONTENT",
    summary: r.status === "FAIL" ? `Call failed on ${r.model}` : `Flagged content on ${r.model}`,
    details: { model: r.model, user: r.user?.email ?? "unknown" },
    href: `/dashboard/logs?id=${r.id}`,
    fingerprint: `${r.status}:${r.model}`,
  }));

  const merged = [...errorSpikes, ...items]
    .sort((a, b) => (a.ts < b.ts ? 1 : -1))
    .filter((n, i, arr) => arr.findIndex(m => m.fingerprint === n.fingerprint) === i);

  return NextResponse.json(merged, { headers: { "cache-control": "no-store" } });
}
