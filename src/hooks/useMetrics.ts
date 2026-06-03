"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  DailyMetric,
  DailyResponse,
  SummaryData,
  TimeRange,
} from "@/server/metrics/metrics.types";
import {
  buildComplianceReportData,
  buildMetricsStats,
  buildPieData,
} from "@/server/metrics/metrics.utils";

async function fetchJsonSafe<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    headers: { Accept: "application/json" },
    ...init,
  });

  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status} ${response.statusText}\n${text.slice(0, 300)}`
    );
  }

  if (!contentType.includes("application/json")) {
    throw new Error(`Non-JSON response\nStarts with: ${text.slice(0, 80)}`);
  }

  return JSON.parse(text) as T;
}

function mockDaily(days = 30): DailyMetric[] {
  const output: DailyMetric[] = [];

  for (let index = days - 1; index >= 0; index--) {
    const date = new Date();
    date.setDate(date.getDate() - index);

    const calls = Math.floor(800 + Math.random() * 1200);
    const errors = Math.floor(calls * (Math.random() * 0.03));
    const costUsd = calls * (0.0005 + Math.random() * 0.0004);
    const avgLatencyMs = Math.floor(300 + Math.random() * 400);

    output.push({
      date: date.toISOString().slice(0, 10),
      calls,
      avgLatencyMs,
      costUsd,
      errors,
      errorRate: calls ? errors / calls : 0,
    });
  }

  return output;
}

function mockSummary(daily: DailyMetric[]): SummaryData {
  const total = daily.reduce((sum, row) => sum + row.calls, 0);

  const avgLatency =
    daily.length > 0
      ? Math.round(
          daily.reduce((sum, row) => sum + row.avgLatencyMs, 0) / daily.length
        )
      : 0;

  const avgCostUsd =
    total > 0 ? daily.reduce((sum, row) => sum + row.costUsd, 0) / total : 0;

  const fails = daily.reduce((sum, row) => sum + row.errors, 0);
  const flagged = Math.floor(total * 0.01);

  return {
    total,
    avg_latency_ms: avgLatency,
    avg_cost_usd: avgCostUsd,
    hallucination_rate: 0.042,
    toxicity_rate: 0.008,
    statuses: {
      SUCCESS: Math.max(total - fails - flagged, 0),
      FAIL: fails,
      FLAGGED: flagged,
    },
  };
}

export function useMetrics() {
  const [dailyData, setDailyData] = useState<DailyMetric[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showBreakdown, setShowBreakdown] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const end = new Date();
    const start = new Date();
    const daysCount = timeRange === "7d" ? 7 : 30;

    start.setDate(start.getDate() - daysCount);

    const dailyUrl = `/api/metrics/daily?from=${
      start.toISOString().split("T")[0]
    }&to=${end.toISOString().split("T")[0]}`;

    const summaryUrl = "/api/metrics/summary";

    try {
      let dailyJson: DailyResponse;

      try {
        dailyJson = await fetchJsonSafe<DailyResponse>(dailyUrl, {
          cache: "no-store",
        });
      } catch (error) {
        console.warn(
          "[metrics] daily API failed, using mock:",
          error instanceof Error ? error.message : error
        );

        dailyJson = {
          from: start.toISOString().slice(0, 10),
          to: end.toISOString().slice(0, 10),
          data: mockDaily(daysCount),
        };
      }

      let summaryJson: SummaryData;

      try {
        summaryJson = await fetchJsonSafe<SummaryData>(summaryUrl, {
          cache: "no-store",
        });
      } catch (error) {
        console.warn(
          "[metrics] summary API failed, using mock:",
          error instanceof Error ? error.message : error
        );

        summaryJson = mockSummary(dailyJson.data);
      }

      setDailyData(Array.isArray(dailyJson.data) ? dailyJson.data : []);
      setSummaryData(summaryJson);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to fetch metrics:", error);

      const fallback = mockDaily(daysCount);

      setDailyData(fallback);
      setSummaryData(mockSummary(fallback));
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();

    const intervalId = window.setInterval(fetchData, 30_000);

    return () => window.clearInterval(intervalId);
  }, [fetchData]);

  const stats = useMemo(() => buildMetricsStats(dailyData), [dailyData]);

  const pieData = useMemo(() => buildPieData(summaryData), [summaryData]);

  const pdfData = useMemo(
    () =>
      buildComplianceReportData({
        dailyData,
        summaryData,
        stats,
      }),
    [dailyData, summaryData, stats]
  );

  return {
    dailyData,
    summaryData,
    loading,
    timeRange,
    setTimeRange,
    lastUpdated,
    showBreakdown,
    setShowBreakdown,
    fetchData,
    stats,
    pieData,
    pdfData,
  };
}