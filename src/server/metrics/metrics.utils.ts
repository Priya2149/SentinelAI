import type {
  ComplianceReportData,
  DailyMetric,
  MetricsStats,
  PieDataItem,
  SummaryData,
} from "./metrics.types";

export function percentile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;

  const index = Math.min(sorted.length - 1, Math.floor(q * sorted.length));
  return sorted[index] ?? 0;
}

export function buildMetricsStats(dailyData: DailyMetric[]): MetricsStats {
  const totalCalls = dailyData.reduce((sum, day) => sum + day.calls, 0);
  const totalCost = dailyData.reduce((sum, day) => sum + day.costUsd, 0);
  const totalErrors = dailyData.reduce((sum, day) => sum + day.errors, 0);

  const avgLatency =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((sum, day) => sum + day.avgLatencyMs, 0) /
            dailyData.length
        )
      : 0;

  const overallErrorRate =
    totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

  return {
    totalCalls,
    totalCost,
    avgLatency,
    totalErrors,
    overallErrorRate,
  };
}

export function buildPieData(summaryData: SummaryData | null): PieDataItem[] {
  if (!summaryData?.statuses) return [];

  return [
    {
      name: "Success",
      value: summaryData.statuses.SUCCESS,
      color: "#10b981",
    },
    {
      name: "Failed",
      value: summaryData.statuses.FAIL,
      color: "#ef4444",
    },
    {
      name: "Flagged",
      value: summaryData.statuses.FLAGGED,
      color: "#f59e0b",
    },
  ].filter((item) => item.value > 0);
}

export function buildComplianceReportData({
  dailyData,
  summaryData,
  stats,
}: {
  dailyData: DailyMetric[];
  summaryData: SummaryData | null;
  stats: MetricsStats;
}): ComplianceReportData {
  const total = summaryData?.total ?? stats.totalCalls;

  const avgLatencyMs = Math.round(
    summaryData?.avg_latency_ms ?? stats.avgLatency
  );

  const estimatedCostUsd =
    summaryData?.avg_cost_usd != null && total > 0
      ? Number(summaryData.avg_cost_usd) * total
      : stats.totalCost;

  const hallucinationRate = summaryData?.hallucination_rate ?? 0;
  const toxicityRate = summaryData?.toxicity_rate ?? 0;

  const failures = summaryData?.statuses.FAIL ?? 0;
  const flaggedCount = summaryData?.statuses.FLAGGED ?? 0;

  const successCount =
    summaryData?.statuses.SUCCESS ??
    Math.max(total - failures - flaggedCount, 0);

  return {
    totalCalls: total,
    estimatedCostUsd,
    avgLatencyMs,
    hallucinationRate,
    failures,
    euAiActRisk: "Minimal Risk",
    successCount,
    flaggedCount,
    toxicityRate,
    daily: dailyData,
    window: undefined,
  };
}