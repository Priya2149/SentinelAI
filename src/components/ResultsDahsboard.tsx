"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Eye,
  Activity,
} from "lucide-react";

interface EvalSummary {
  totalEvaluations: number;
  overallPassRate: number;
  byKind: {
    [key: string]: {
      total: number;
      passed: number;
      failed: number;
      passRate: number;
      avgScore: number;
    };
  };
  recentTrends: {
    date: string;
    total: number;
    passed: number;
    passRate: number;
  }[];
  riskyCalls: {
    callId: string;
    timestamp: string | Date; // arrives as JSON -> string, keep Date-compatible
    failedEvals: string[];
    riskScore: number;
  }[];
}

export default function EvaluationDashboard() {
  const [summary, setSummary] = useState<EvalSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchEvaluationSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchEvaluationSummary = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/evaluations/summary?days=${timeRange}`);
      const data = (await response.json()) as EvalSummary;
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch evaluation summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading evaluation data...</span>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <p className="text-gray-600">No evaluation data available</p>
      </div>
    );
  }

  // Prepare chart data
  const evalKindData = Object.entries(summary.byKind).map(([kind, data]) => ({
    name: kind,
    passed: data.passed,
    failed: data.failed,
    passRate: data.passRate,
    avgScore: data.avgScore,
  }));

  const pieData = Object.entries(summary.byKind)
    .map(([kind, data]) => ({
      name: kind,
      value: data.failed,
      color: getKindColor(kind),
    }))
    .filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI Safety Evaluation Dashboard</h2>
          <p className="text-gray-600">
            Real-time monitoring of AI safety metrics
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EvalMetricCard
          title="Total Evaluations"
          value={summary.totalEvaluations.toLocaleString()}
          icon={<Activity className="h-5 w-5" />}
          color="blue"
          subtitle="Safety checks performed"
        />
        <EvalMetricCard
          title="Overall Pass Rate"
          value={`${summary.overallPassRate.toFixed(1)}%`}
          icon={
            summary.overallPassRate >= 90 ? (
              <ShieldCheck className="h-5 w-5" />
            ) : (
              <ShieldAlert className="h-5 w-5" />
            )
          }
          color={
            summary.overallPassRate >= 90
              ? "green"
              : summary.overallPassRate >= 70
                ? "yellow"
                : "red"
          }
          subtitle="System safety score"
        />
        <EvalMetricCard
          title="Risk Alerts"
          value={summary.riskyCalls.length.toString()}
          icon={<AlertTriangle className="h-5 w-5" />}
          color={
            summary.riskyCalls.length > 5
              ? "red"
              : summary.riskyCalls.length > 0
                ? "yellow"
                : "green"
          }
          subtitle="High-risk calls flagged"
        />
        <EvalMetricCard
          title="Safety Categories"
          value={Object.keys(summary.byKind).length.toString()}
          icon={<Shield className="h-5 w-5" />}
          color="purple"
          subtitle="Active safety checks"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass Rate by Evaluation Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Safety Check Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={evalKindData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={formatSafetyTooltip} />
              <Bar dataKey="passed" fill="#10b981" name="passed" />
              <Bar dataKey="failed" fill="#ef4444" name="failed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trend Over Time */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">
            Safety Trends (Last 7 Days)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={summary.recentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={formatTrendTooltip}
              />
              <Line
                type="monotone"
                dataKey="passRate"
                stroke="#8b5cf6"
                strokeWidth={3}
                name="passRate"
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#3b82f6"
                strokeWidth={2}
                name="total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Failure Distribution */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">
              Safety Violations by Type
            </h3>
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
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
               <Tooltip formatter={formatPieTooltip} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {pieData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Safety Check Details</h3>
          <div className="space-y-4">
            {Object.entries(summary.byKind).map(([kind, data]) => (
              <SafetyCheckRow key={kind} kind={kind} data={data} />
            ))}
          </div>
        </div>
      </div>

      {/* Risky Calls Table */}
      {summary.riskyCalls.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>High-Risk API Calls</span>
            </h3>
            <p className="text-sm text-gray-600">
              Calls that failed multiple safety checks
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Call ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Failed Checks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Risk Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summary.riskyCalls.slice(0, 10).map((call) => (
                  <tr key={call.callId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono">
                      {call.callId.slice(0, 8)}...
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {new Date(call.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {call.failedEvals.map((evaluationKind) => (
                          <span
                            key={evaluationKind}
                            className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800"
                          >
                            {evaluationKind}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={`text-sm font-bold ${
                          call.riskScore >= 75
                            ? "text-red-600"
                            : call.riskScore >= 50
                              ? "text-yellow-600"
                              : "text-green-600"
                        }`}
                      >
                        {call.riskScore}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function EvalMetricCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "red" | "purple";
  subtitle: string;
}) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function SafetyCheckRow({
  kind,
  data,
}: {
  kind: string;
  data: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
    avgScore: number;
  };
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-full ${getKindBgColor(kind)}`}>{getKindIcon(kind)}</div>
        <div>
          <p className="font-medium">{kind}</p>
          <p className="text-sm text-gray-600">{data.total} checks</p>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-lg font-bold ${
            data.passRate >= 95
              ? "text-green-600"
              : data.passRate >= 80
              ? "text-yellow-600"
              : "text-red-600"
          }`}
        >
          {data.passRate.toFixed(1)}%
        </p>
        <p className="text-xs text-gray-600">{data.failed} failures</p>
      </div>
    </div>
  );
}

function getKindColor(kind: string): string {
  const colors: { [key: string]: string } = {
    INJECTION: "#ef4444",
    PII: "#f59e0b",
    TOXICITY: "#dc2626",
    GROUNDING: "#8b5cf6",
    HALLUCINATION: "#3b82f6",
  };
  return colors[kind] || "#6b7280";
}
function toNumber(value: unknown): number {
  if (typeof value === "number") return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function formatSafetyTooltip(
  value: unknown,
  name: unknown
): [string | number, string] {
  const key = String(name);
  const numericValue = toNumber(value);

  return [
    key === "passRate" ? `${numericValue.toFixed(1)}%` : numericValue,
    key === "passRate"
      ? "Pass Rate"
      : key === "passed"
      ? "Passed"
      : key === "failed"
      ? "Failed"
      : key,
  ];
}

function formatTrendTooltip(
  value: unknown,
  name: unknown
): [string | number, string] {
  const key = String(name);
  const numericValue = toNumber(value);

  return [
    key === "passRate" ? `${numericValue.toFixed(1)}%` : numericValue,
    key === "passRate"
      ? "Pass Rate"
      : key === "total"
      ? "Total Evals"
      : key === "passed"
      ? "Passed"
      : key,
  ];
}

function formatPieTooltip(
  value: unknown,
  name: unknown
): [string, string] {
  return [`${toNumber(value)} failures`, String(name)];
}
function getKindBgColor(kind: string): string {
  const colors: { [key: string]: string } = {
    INJECTION: "bg-red-100",
    PII: "bg-yellow-100",
    TOXICITY: "bg-red-100",
    GROUNDING: "bg-purple-100",
    HALLUCINATION: "bg-blue-100",
  };
  return colors[kind] || "bg-gray-100";
}

function getKindIcon(kind: string) {
  switch (kind) {
    case "INJECTION":
      return <ShieldAlert className="h-5 w-5 text-red-600" />;
    case "PII":
      return <Shield className="h-5 w-5 text-yellow-600" />;
    case "TOXICITY":
      return <ShieldAlert className="h-5 w-5 text-red-600" />;
    case "GROUNDING":
      return <Shield className="h-5 w-5 text-purple-600" />;
    case "HALLUCINATION":
      return <ShieldAlert className="h-5 w-5 text-blue-600" />;
    default:
      return <Shield className="h-5 w-5 text-gray-600" />;
  }
}
