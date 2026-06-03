export type TimeRange = "7d" | "30d";

export type DailyMetric = {
  date: string;
  calls: number;
  avgLatencyMs: number;
  costUsd: number;
  errors: number;
  errorRate: number;
};

export type DailyResponse = {
  from: string;
  to: string;
  data: DailyMetric[];
};

export type SummaryData = {
  total: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  hallucination_rate: number;
  toxicity_rate: number;
  statuses: {
    SUCCESS: number;
    FAIL: number;
    FLAGGED: number;
  };
};

export type MetricsStats = {
  totalCalls: number;
  totalCost: number;
  avgLatency: number;
  totalErrors: number;
  overallErrorRate: number;
};

export type PieDataItem = {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
};

export type RealtimeSnapshot = {
  totalCalls: number;
  recentCalls: number;
  avgLatency: number;
  errorCount: number;
  callsPerMin: number;
  errorRate: number;
  p50: number;
  p95: number;
  p99: number;
  cost60s: number;
  timestamp: string;
};

export type ComplianceReportData = {
  totalCalls: number;
  estimatedCostUsd: number;
  avgLatencyMs: number;
  hallucinationRate: number;
  failures: number;
  euAiActRisk: string;
  successCount: number;
  flaggedCount: number;
  toxicityRate: number;
  daily: DailyMetric[];
  window?: string;
};