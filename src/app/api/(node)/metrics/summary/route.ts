import { NextResponse } from "next/server";
import { getMetricsSummary } from "@/server/metrics/metrics.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const summary = await getMetricsSummary();

    return NextResponse.json(summary);
  } catch (error) {
    console.error("GET /api/metrics/summary failed:", error);

    return NextResponse.json(
      { error: "summary_failed" },
      { status: 500 }
    );
  }
}