import { NextRequest, NextResponse } from "next/server";
import { getAnalyticsUserRows } from "@/server/analytics/analytics.service";
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

    const rows = await getAnalyticsUserRows(params);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/analytics/users failed:", error);

    return NextResponse.json(
      { error: "Failed to fetch user analytics" },
      { status: 500 }
    );
  }
}