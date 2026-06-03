import "server-only";

import type { DailyResponse } from "./metrics.types";
import { getDefaultDailyRange, parseDate } from "./metrics.filters";
import {
  getDailyMetricRows,
  getMetricsSummaryData,
  getRealtimeSnapshot,
} from "./metrics.repository";

export async function getDailyMetrics({
  from,
  to,
}: {
  from?: string | null;
  to?: string | null;
}): Promise<DailyResponse> {
  const parsedFrom = parseDate(from ?? null);
  const parsedTo = parseDate(to ?? null);

  const range = getDefaultDailyRange({
    from: parsedFrom,
    to: parsedTo,
  });

  const rows = await getDailyMetricRows({
    start: range.start,
    end: range.endExclusive,
  });

  const data = rows.map((row) => {
    const calls = Number(row.calls);
    const errors = Number(row.errors);

    return {
      date: new Date(row.day).toISOString().slice(0, 10),
      calls,
      avgLatencyMs: Math.round(row.avg_latency ?? 0),
      costUsd: Number(row.cost ?? 0),
      errors,
      errorRate: calls ? errors / calls : 0,
    };
  });

  return {
    from: range.start.toISOString(),
    to: range.end.toISOString(),
    data,
  };
}

export async function getMetricsSummary() {
  return getMetricsSummaryData();
}

export async function getMetricsRealtimeSnapshot() {
  return getRealtimeSnapshot();
}