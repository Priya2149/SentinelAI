import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsModelRows } from "@/server/analytics/analytics.service";
import type { AnalyticsQueryParams } from "@/server/analytics/analytics.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const params: AnalyticsQueryParams = {
      from: req.nextUrl.searchParams.get("from") ?? undefined,
      to: req.nextUrl.searchParams.get("to") ?? undefined,
      model: req.nextUrl.searchParams.getAll("model"),
    };

    const rows = await getAnalyticsModelRows(params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/analytics/models failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch model analytics" },
      { status: 500 }
    );
  }
}