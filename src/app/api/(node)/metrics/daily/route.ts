import { NextRequest, NextResponse } from "next/server";
import { getDailyMetrics } from "@/server/metrics/metrics.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  try {
    const data = await getDailyMetrics({
      from: req.nextUrl.searchParams.get("from"),
      to: req.nextUrl.searchParams.get("to"),
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/metrics/daily failed:", error);

    return NextResponse.json(
      { ok: false, error: "daily_metrics_failed" },
      { status: 500 }
    );
  }
}