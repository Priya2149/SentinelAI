"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  AlertTriangle,
  Activity,
  BarChart3,
  RefreshCw,
  Eye,
  X as CloseIcon,
  FileDown,
} from "lucide-react";

/* ------------------------- PDF (client-only) ------------------------- */
// Preview viewer (no SSR)
const PDFViewerNoSSR = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFViewer),
  { ssr: false }
);
// The PDF document component (for preview) – client-only
const ComplianceReportNoSSR = dynamic(() => import("@/components/pdf/ComplianceReport"), {
  ssr: false,
});

/* ----------------------------- Types ----------------------------- */
interface DailyMetric {
  date: string;
  calls: number;
  avgLatencyMs: number;
  costUsd: number;
  errors: number;
  errorRate: number;
}
interface DailyResponse {
  from: string;
  to: string;
  data: DailyMetric[];
}
interface SummaryData {
  total: number;
  avg_latency_ms: number;
  avg_cost_usd: number;
  hallucination_rate: number;
  toxicity_rate: number;
  statuses: { SUCCESS: number; FAIL: number; FLAGGED: number };
}
interface PieDataItem {
  name: string;
  value: number;
  color: string;
  [k: string]: string | number;
}
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

/* -------- Safe fetch + demo fallbacks so the page never crashes ------- */
async function fetchJsonSafe<T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, { headers: { Accept: "application/json" }, ...init });
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  if (!res.ok) {
    throw new Error(
      `HTTP ${res.status} ${res.statusText} at ${
        typeof input === "string" ? input : ""
      }\n${text.slice(0, 300)}`
    );
  }
  if (!ct.includes("application/json")) {
    throw new Error(
      `Non-JSON response at ${
        typeof input === "string" ? input : ""
      }\nStarts with: ${text.slice(0, 80)}`
    );
  }
  return JSON.parse(text) as T;
}
function mockDaily(days = 30): DailyMetric[] {
  const out: DailyMetric[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const calls = Math.floor(800 + Math.random() * 1200);
    const errors = Math.floor(calls * (Math.random() * 0.03));
    const costUsd = calls * (0.0005 + Math.random() * 0.0004);
    const avgLatencyMs = Math.floor(300 + Math.random() * 400);
    out.push({
      date: d.toISOString().slice(0, 10),
      calls,
      avgLatencyMs,
      costUsd,
      errors,
      errorRate: errors / calls,
    });
  }
  return out;
}
function mockSummary(daily: DailyMetric[]): SummaryData {
  const total = daily.reduce((s, r) => s + r.calls, 0);
  const avg_latency_ms = Math.round(
    daily.reduce((s, r) => s + r.avgLatencyMs, 0) / Math.max(daily.length, 1)
  );
  const avg_cost_usd = total
    ? daily.reduce((s, r) => s + r.costUsd, 0) / total
    : 0;
  const fails = daily.reduce((s, r) => s + r.errors, 0);
  const flagged = Math.floor(total * 0.01);
  return {
    total,
    avg_latency_ms,
    avg_cost_usd,
    hallucination_rate: 0.042,
    toxicity_rate: 0.008,
    statuses: {
      SUCCESS: Math.max(total - fails - flagged, 0),
      FAIL: fails,
      FLAGGED: flagged,
    },
  };
}

/* ------------------------- Component ------------------------- */
export default function MetricsPage() {
  const [dailyData, setDailyData] = useState<DailyMetric[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d">("30d");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* --------------------- Data fetch (sequential, typed) --------------------- */
  async function fetchData() {
    setLoading(true);

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (timeRange === "7d" ? 7 : 30));
    const daysCount = timeRange === "7d" ? 7 : 30;

    const dailyUrl = `/api/metrics/daily?from=${start
      .toISOString()
      .split("T")[0]}&to=${end.toISOString().split("T")[0]}`;
    const summaryUrl = `/api/metrics/summary`;

    try {
      // 1) DAILY
      let dailyJson: DailyResponse;
      try {
        dailyJson = await fetchJsonSafe<DailyResponse>(dailyUrl, {
          cache: "no-store",
        });
      } catch (err) {
        console.warn(
          "[metrics] daily API failed, using mock:",
          (err as Error).message
        );
        dailyJson = {
          from: start.toISOString().slice(0, 10),
          to: end.toISOString().slice(0, 10),
          data: mockDaily(daysCount),
        };
      }

      // 2) SUMMARY (computed fallback from daily)
      let summaryJson: SummaryData;
      try {
        summaryJson = await fetchJsonSafe<SummaryData>(summaryUrl, {
          cache: "no-store",
        });
      } catch (err) {
        console.warn(
          "[metrics] summary API failed, using mock:",
          (err as Error).message
        );
        summaryJson = mockSummary(dailyJson.data);
      }

      setDailyData(Array.isArray(dailyJson.data) ? dailyJson.data : []);
      setSummaryData(summaryJson ?? null);
      setLastUpdated(new Date());
    } catch (e) {
      console.error("Failed to fetch metrics (fatal):", e);
      const d = mockDaily(daysCount);
      setDailyData(d);
      setSummaryData(mockSummary(d));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [timeRange]);

  /* ----- Derived (dashboard) ----- */
  const totalCalls = dailyData.reduce((s, d) => s + d.calls, 0);
  const totalCost = dailyData.reduce((s, d) => s + d.costUsd, 0);
  const avgLatency =
    dailyData.length > 0
      ? Math.round(
          dailyData.reduce((s, d) => s + d.avgLatencyMs, 0) / dailyData.length
        )
      : 0;
  const totalErrors = dailyData.reduce((s, d) => s + d.errors, 0);
  const overallErrorRate = totalCalls > 0 ? (totalErrors / totalCalls) * 100 : 0;

  const pieData: PieDataItem[] = summaryData?.statuses
    ? [
        {
          name: "Success",
          value: summaryData.statuses.SUCCESS,
          color: "#10b981",
        },
        { name: "Failed", value: summaryData.statuses.FAIL, color: "#ef4444" },
        {
          name: "Flagged",
          value: summaryData.statuses.FLAGGED,
          color: "#f59e0b",
        },
      ].filter((i) => i.value > 0)
    : [];

  /* ----- Map API → PDF props ----- */
  const pdfData = useMemo(() => {
    const total = summaryData?.total ?? totalCalls;
    const avgLatencyMs = Math.round(summaryData?.avg_latency_ms ?? avgLatency);
    const estimatedCostUsd =
      summaryData?.avg_cost_usd != null && total > 0
        ? Number(summaryData.avg_cost_usd) * total
        : totalCost;

    const hallucinationRate = summaryData?.hallucination_rate ?? 0;
    const toxicityRate = summaryData?.toxicity_rate ?? 0;

    const failures = summaryData?.statuses.FAIL ?? 0;
    const flaggedCount = summaryData?.statuses.FLAGGED ?? 0;
    const successCount =
      summaryData?.statuses.SUCCESS ??
      Math.max(total - failures - flaggedCount, 0);

    const euAiActRisk = "Minimal Risk"; // simple demo label

    return {
      totalCalls: total,
      estimatedCostUsd,
      avgLatencyMs,
      hallucinationRate,
      failures,
      euAiActRisk,
      successCount,
      flaggedCount,
      toxicityRate,
      daily: dailyData,
      window: undefined,
    };
  }, [summaryData, dailyData, totalCalls, totalCost, avgLatency]);

  /* ---------------- PDF download (no PDFDownloadLink) ---------------- */
  async function handleDownloadPdf() {
    try {
      setDownloading(true);
      const [{ pdf }, { default: ComplianceReport }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/pdf/ComplianceReport"),
      ]);
      const doc = <ComplianceReport data={pdfData} />;
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = `AI_Governance_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Could not generate the PDF. Check the console for details.");
    } finally {
      setDownloading(false);
    }
  }

  /* ------------------------ Tooltips ------------------------ */
  const CallsTooltip = ({ active, payload, label }: CustomTooltipProps) =>
    active && payload && payload.length ? (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium">
          {new Date(label || "").toLocaleDateString()}
        </p>
        <p className="text-blue-600">
          API Calls: {payload[0]?.value?.toLocaleString?.()}
        </p>
      </div>
    ) : null;

  const CostTooltip = ({ active, payload, label }: CustomTooltipProps) =>
    active && payload && payload.length ? (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium">
          {new Date(label || "").toLocaleDateString()}
        </p>
        <p className="text-green-600">
          Daily Cost: ${Number(payload[0]?.value ?? 0).toFixed(4)}
        </p>
      </div>
    ) : null;

  const LatencyTooltip = ({ active, payload, label }: CustomTooltipProps) =>
    active && payload && payload.length ? (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium">
          {new Date(label || "").toLocaleDateString()}
        </p>
        <p className="text-purple-600">
          Avg Latency: {Math.round(Number(payload[0]?.value ?? 0))}ms
        </p>
      </div>
    ) : null;

  const PieTooltip = ({ active, payload }: CustomTooltipProps) =>
    active && payload && payload.length ? (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium">
          {payload[0]?.name}:{" "}
          {Number(payload[0]?.value ?? 0).toLocaleString()}
        </p>
      </div>
    ) : null;

  const fileName = `AI_Governance_Report_${new Date()
    .toISOString()
    .slice(0, 10)}.pdf`;

  /* ----------------------------- JSX ----------------------------- */
  return (
    <div className="space-y-8 p-6">
      {/* Loading */}
      {loading && !dailyData.length ? (
        <div className="flex items-center justify-center min-h-[400px] space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading metrics...</span>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Performance Metrics
              </h1>
              <div className="mt-1">
  <RiskBadge
    hallucinationRate={summaryData?.hallucination_rate ?? 0}
    toxicityRate={summaryData?.toxicity_rate ?? 0}
  />
</div>

              <p className="text-muted-foreground mt-2">
                Real-time insights into your AI system performance
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
              </div>

              <select
                value={timeRange}
                onChange={(e) =>
                  setTimeRange(e.target.value as "7d" | "30d")
                }
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
              </select>

              {/* Preview PDF */}
              <button
                onClick={() => setShowPdfPreview(true)}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700"
                title="Preview PDF"
              >
                <Eye className="h-4 w-4" />
                Preview PDF
              </button>

              {/* Download PDF (no PDFDownloadLink) */}
              <button
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700 disabled:opacity-60"
                title="Download PDF"
                disabled={downloading}
              >
                <FileDown className="h-4 w-4" />
                {downloading ? "Preparing…" : "Download PDF"}
              </button>

{/* Burn-rate & forecast */}
<div className="hidden md:flex items-center text-xs text-muted-foreground border rounded-lg px-3 py-2">
  {(() => {
    const minutes =
      dailyData.length
        ? (new Date(pdfData.daily[pdfData.daily.length-1].date).getTime() -
           new Date(pdfData.daily[0].date).getTime()) / 60000 || 1
        : 1;
    const burnPerMin = minutes > 0 ? (totalCost / minutes) : 0;
    const projectedMonthly = burnPerMin * 60 * 24 * 30;
    return (
      <span>Burn ${burnPerMin.toFixed(4)}/min · ~${projectedMonthly.toFixed(2)}/mo</span>
    );
  })()}
</div>

              <button
                onClick={fetchData}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Calls"
              value={totalCalls.toLocaleString()}
              change={`+${(
                totalCalls / Math.max(dailyData.length, 1) / 10
              ).toFixed(1)}%`}
              trend="up"
              icon={<Activity className="h-5 w-5" />}
              color="blue"
            />
            <StatsCard
              title="Total Cost"
              value={`$${totalCost.toFixed(4)}`}
              change={`+${(totalCost * 100).toFixed(1)}%`}
              trend="up"
              icon={<DollarSign className="h-5 w-5" />}
              color="green"
            />
            <StatsCard
              title="Avg Latency"
              value={`${avgLatency}ms`}
              change={avgLatency < 500 ? "-12%" : "+8%"}
              trend={avgLatency < 500 ? "up" : "down"}
              icon={<Clock className="h-5 w-5" />}
              color="purple"
            />
            <StatsCard
              title="Error Rate"
              value={`${overallErrorRate.toFixed(1)}%`}
              change={overallErrorRate < 5 ? "-2.4%" : "+1.2%"}
              trend={overallErrorRate < 5 ? "up" : "down"}
              icon={<AlertTriangle className="h-5 w-5" />}
              color={overallErrorRate > 10 ? "red" : "orange"}
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard title="API Calls Trend" description="Daily API call volume">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CallsTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="calls"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#callsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Cost Analysis" description="Daily spending trends">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<CostTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="costUsd"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#costGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Response Time" description="Average latency performance">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="date"
                    stroke="#6b7280"
                    fontSize={12}
                    tickFormatter={(v: string) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip content={<LatencyTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="avgLatencyMs"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Error Distribution" description="Success vs failure rates">
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="80%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center space-x-6">
                {pieData.map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {item.name} ({Number(item.value).toLocaleString()})
                    </span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </div>

          {/* Daily Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Daily Breakdown</h2>
                  <p className="text-sm text-muted-foreground">
                    Detailed metrics by day
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {dailyData.length} days tracked
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>API Calls</TableHeader>
                      <TableHeader>Daily Cost</TableHeader>
                      <TableHeader>Avg Latency</TableHeader>
                      <TableHeader>Errors</TableHeader>
                      <TableHeader>Error Rate</TableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {dailyData
                      .slice()
                      .reverse()
                      .slice(0, 15)
                      .map((row) => (
                        <tr
                          key={row.date}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <TableCell>
                            <div className="font-medium">
                              {new Date(row.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                weekday: "short",
                              })}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Activity className="h-4 w-4 text-blue-500" />
                              <span className="font-mono font-medium">
                                {row.calls.toLocaleString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono text-green-600 font-medium">
                              ${row.costUsd.toFixed(4)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  row.avgLatencyMs < 400
                                    ? "bg-green-400"
                                    : row.avgLatencyMs < 700
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                                }`}
                              />
                              <span className="font-mono">
                                {row.avgLatencyMs}ms
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {row.errors > 0 ? (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                              <span
                                className={
                                  row.errors > 5 ? "text-red-600 font-medium" : ""
                                }
                              >
                                {row.errors}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`font-medium ${
                                row.errorRate > 0.1
                                  ? "text-red-600"
                                  : row.errorRate > 0.05
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {(row.errorRate * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* --------------------- PDF PREVIEW MODAL --------------------- */}
      {showPdfPreview && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setShowPdfPreview(false)}
            aria-hidden
          />
          <div className="absolute inset-4 bg-white dark:bg-gray-900 rounded-xl shadow-xl flex flex-col">
            {/* Modal top bar */}
            <div className="flex items-center gap-3 px-4 py-2 border-b dark:border-gray-800">
              <div className="text-sm font-medium">PDF Preview</div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={handleDownloadPdf}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 disabled:opacity-60"
                  title="Download PDF"
                  disabled={downloading}
                >
                  <FileDown className="h-4 w-4" />
                  {downloading ? "Preparing…" : "Download"}
                </button>

                <button
                  onClick={() => setShowPdfPreview(false)}
                  className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700"
                  title="Close preview"
                >
                  <CloseIcon className="h-4 w-4" />
                  Close
                </button>
              </div>
            </div>

            {/* Full-height PDF viewer (no SSR) */}
            <div className="flex-1 min-h-0">
              <PDFViewerNoSSR style={{ width: "100%", height: "100%" }}>
                <ComplianceReportNoSSR data={pdfData} />
              </PDFViewerNoSSR>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------- UI helpers ---------------------- */
function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red";
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div
          className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center space-x-1 text-sm ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{change}</span>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
}
function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}
function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-4 whitespace-nowrap">{children}</td>;
}

function RiskBadge({ hallucinationRate, toxicityRate }: { hallucinationRate: number; toxicityRate: number }) {
  const score = 0.7 * hallucinationRate + 0.3 * toxicityRate;
  const label = score > 0.15 ? "High" : score > 0.07 ? "Medium" : "Low";
  const cls =
    label === "High" ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" :
    label === "Medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
  return <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${cls}`}>Risk: {label}</span>;
}

