import { NextRequest, NextResponse } from "next/server";
import { getLogsPageData } from "@/server/logs/logs.service";
import type { LogsSearchParams } from "@/server/logs/logs.types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req: NextRequest) {
  try {
    const params = Object.fromEntries(
      req.nextUrl.searchParams.entries()
    ) as LogsSearchParams;

    const data = await getLogsPageData(params);

    return NextResponse.json({
      items: data.rows,
      pagination: data.pagination,
      stats: data.stats,
      lastUpdated: data.lastUpdated,
    });
  } catch (error) {
    console.error("GET /api/logs failed:", error);

    return NextResponse.json(
      {
        error: "Failed to load logs",
      },
      {
        status: 500,
      }
    );
  }
}