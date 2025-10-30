import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";          // make sure this runs on the server
export const dynamic = "force-dynamic";   // tells Next/Vercel not to pre-render at build
export const revalidate = 0; 
function parseDate(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = parseDate(url.searchParams.get("from"));
    const to = parseDate(url.searchParams.get("to"));

    // default: last 14 days (inclusive range)
    const end = to ?? new Date();
    const start = from ?? new Date(end.getTime() - 13 * 24 * 3600_000);

    // Query daily aggregates

const rows = await prisma.$queryRaw<Array<{
  day: Date;
  calls: bigint;
  avg_latency: number | null;
  cost: number | null;
  errors: bigint;
}>>(Prisma.sql`
  SELECT date_trunc('day', "createdAt") AS day,
         COUNT(*)                         AS calls,
         AVG("latencyMs")                 AS avg_latency,
         SUM("costUsd")                   AS cost,
         SUM(CASE WHEN status <> 'SUCCESS' THEN 1 ELSE 0 END) AS errors
  FROM "ModelCall"
  WHERE "createdAt" >= ${start} AND "createdAt" < ${new Date(end.getTime() + 24 * 3600_000)}
  GROUP BY 1
  ORDER BY 1 ASC
`);

    // Shape data for the frontend
    const data = rows.map((r) => ({
      date: new Date(r.day).toISOString().slice(0, 10), // YYYY-MM-DD
      calls: Number(r.calls),
      avgLatencyMs: Math.round(r.avg_latency ?? 0),
      costUsd: +(r.cost ?? 0),
      errors: Number(r.errors),
      errorRate: Number(r.calls)
        ? Number(r.errors) / Number(r.calls)
        : 0,
    }));

    return NextResponse.json({
      from: start.toISOString(),
      to: end.toISOString(),
      data,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";

    return NextResponse.json(
      { ok: false, error: message },
      { status: 500 }
    );
  }
}
