export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import {
  TrendingUp,
  TrendingDown,
  Cpu,
  Users,
  DollarSign,
  Clock,
  AlertTriangle,
  Activity,
  Target,
  Zap,
  BarChart3,
  PieChart,
} from "lucide-react";

import VendorComparisonSection from "./VendorComparisonSection";

type ModelRow = {
  model: string;
  calls: number;
  avgLatencyMs: number;
  avgCostUsd: number;
  errorRate: number;
};

type UserRow = {
  user: string;
  calls: number;
  totalCostUsd: number;
  avgLatencyMs: number;
  errorRate: number;
};

type VendorStats = {
  provider: string;
  calls: number;
  avgLatencyMs: number;
  totalCostUsd: number;
  avgCostPerCall: number;
  models: number;
};

export default async function AnalyticsPage() {
  // —— LIVE fetch with no caching anywhere ——
  let byModel: ModelRow[] = [];
  let byUser: UserRow[] = [];
  let liveOk = true;

  try {
    const [mRes, uRes] = await Promise.all([
      fetch("http://localhost:3000/api/analytics/models", {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
      fetch("http://localhost:3000/api/analytics/users", {
        cache: "no-store",
        next: { revalidate: 0 },
      }),
    ]);
    liveOk = mRes.ok && uRes.ok;
    if (mRes.ok) byModel = (await mRes.json()) ?? [];
    if (uRes.ok) byUser = (await uRes.json()) ?? [];
  } catch {
    liveOk = false;
    byModel = [];
    byUser = [];
  }

  // —— Calculate vendor stats from byModel data ——
  const vendorMap = new Map<string, {
    calls: number;
    totalLatency: number;
    totalCost: number;
    models: Set<string>;
  }>();

  byModel.forEach((model) => {
    // Extract provider from model name
    let provider = "other";
    const modelLower = model.model.toLowerCase();
    
    if (modelLower.includes("gpt") || modelLower.includes("openai")) {
      provider = "openai";
    } else if (modelLower.includes("claude") || modelLower.includes("anthropic")) {
      provider = "anthropic";
    } else if (modelLower.includes("gemini") || modelLower.includes("palm") || modelLower.includes("bard")) {
      provider = "google";
    } else if (modelLower.includes("llama")) {
      provider = "meta";
    } else if (modelLower.includes("mistral")) {
      provider = "mistral";
    } else if (modelLower.includes("cohere")) {
      provider = "cohere";
    }

    const existing = vendorMap.get(provider) || {
      calls: 0,
      totalLatency: 0,
      totalCost: 0,
      models: new Set<string>(),
    };

    existing.calls += model.calls ?? 0;
    existing.totalLatency += (model.avgLatencyMs ?? 0) * (model.calls ?? 0);
    existing.totalCost += (model.avgCostUsd ?? 0) * (model.calls ?? 0);
    existing.models.add(model.model);

    vendorMap.set(provider, existing);
  });

  const vendorStats: VendorStats[] = Array.from(vendorMap.entries()).map(([provider, data]) => ({
    provider,
    calls: data.calls,
    avgLatencyMs: data.calls > 0 ? data.totalLatency / data.calls : 0,
    totalCostUsd: data.totalCost,
    avgCostPerCall: data.calls > 0 ? data.totalCost / data.calls : 0,
    models: data.models.size,
  })).sort((a, b) => b.calls - a.calls); // Sort by most calls

  // —— Aggregations with 0 fallbacks ——
  const totalModels = byModel.length;
  const totalUsers = byUser.length;
  const totalCalls = byModel.reduce((sum, m) => sum + (m.calls ?? 0), 0);
  const totalCost = byUser.reduce((sum, u) => sum + (u.totalCostUsd ?? 0), 0);
  const overallErrorRate =
    totalCalls > 0
      ? (byModel.reduce((s, m) => s + ((m.errorRate ?? 0) * (m.calls ?? 0)), 0) / totalCalls) * 100
      : 0;

  const topModel = [...byModel].sort((a, b) => (b.calls ?? 0) - (a.calls ?? 0))[0];
  const topUser = [...byUser].sort((a, b) => (b.calls ?? 0) - (a.calls ?? 0))[0];
  const mostExpensiveModel = [...byModel].sort(
    (a, b) => (b.avgCostUsd ?? 0) * (b.calls ?? 0) - (a.avgCostUsd ?? 0) * (a.calls ?? 0)
  )[0];

  // consider "live" only if fetch succeeded and we actually got rows
  const hasData = (byModel.length > 0 || byUser.length > 0) && liveOk;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground mt-2">Deep insights into model performance and user behavior</p>
        </div>

        <div className="flex items-center space-x-2">
          {hasData ? (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-full text-sm">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span>Live data</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full text-sm">
              <div className="h-2 w-2 bg-gray-400 rounded-full" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Models"
          value={totalModels}
          change="+0"
          trend="up"
          icon={<Cpu className="h-5 w-5" />}
          color="blue"
          subtitle="Active AI models"
        />
        <MetricCard
          title="Active Users"
          value={totalUsers}
          change="+0"
          trend="up"
          icon={<Users className="h-5 w-5" />}
          color="green"
          subtitle="Unique users this period"
        />
        <MetricCard
          title="Total Spend"
          value={`$${totalCost.toFixed(4)}`}
          change="+0%"
          trend="up"
          icon={<DollarSign className="h-5 w-5" />}
          color="purple"
          subtitle="Cumulative API costs"
        />
        <MetricCard
          title="Error Rate"
          value={`${overallErrorRate.toFixed(1)}%`}
          change="+0%"
          trend="up"
          icon={<AlertTriangle className="h-5 w-5" />}
          color={overallErrorRate > 10 ? "red" : "orange"}
          subtitle="System reliability"
        />
      </div>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightCard
          title="Top Performing Model"
          value={topModel?.model || "N/A"}
          metric={`${topModel?.calls ?? 0} calls`}
          icon={<Target className="h-6 w-6" />}
          color="blue"
          description="Most frequently used model"
        />
        <InsightCard
          title="Power User"
          value={topUser?.user || "N/A"}
          metric={`${topUser?.calls ?? 0} API calls`}
          icon={<Zap className="h-6 w-6" />}
          color="green"
          description="Highest usage this period"
        />
        <InsightCard
          title="Cost Leader"
          value={mostExpensiveModel?.model || "N/A"}
          metric={`$${(((mostExpensiveModel?.avgCostUsd ?? 0) * (mostExpensiveModel?.calls ?? 0))).toFixed(4)}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="purple"
          description="Highest total spend"
        />
      </div>

      {/* Vendor Comparison Section */}
      <VendorComparisonSection vendors={vendorStats} />

      {/* Model Performance Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Cpu className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Model Performance Analysis</h2>
                <p className="text-sm text-muted-foreground">Comprehensive breakdown by AI model</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{totalModels} models tracked</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span>Model</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Calls</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Avg Latency</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Avg Cost</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Error Rate</span>
                    </div>
                  </TableHeader>
                  <TableHeader>Performance</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {byModel.map((model, index) => (
                  <tr key={model.model} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                          {model.model.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{model.model}</div>
                          <div className="text-xs text-muted-foreground">#{index + 1} by usage</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <UsageBar value={model.calls ?? 0} max={Math.max(...byModel.map(m => m.calls ?? 0), 1)} />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{(model.calls ?? 0).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {((model.calls ?? 0) / Math.max(totalCalls, 1) * 100).toFixed(1)}% share
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <LatencyIndicator latency={model.avgLatencyMs ?? 0} />
                        <div className="text-right">
                          <div className={`font-mono font-medium ${
                            (model.avgLatencyMs ?? 0) < 500 ? "text-green-600" :
                            (model.avgLatencyMs ?? 0) < 1000 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {Math.round(model.avgLatencyMs ?? 0)}ms
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(model.avgLatencyMs ?? 0) < 500 ? "Excellent" :
                             (model.avgLatencyMs ?? 0) < 1000 ? "Good" : "Needs improvement"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-mono font-medium text-green-600">${(model.avgCostUsd ?? 0).toFixed(5)}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(((model.avgCostUsd ?? 0) * (model.calls ?? 0))).toFixed(4)} total
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className={`font-medium ${
                          (model.errorRate ?? 0) > 0.1 ? "text-red-600" :
                          (model.errorRate ?? 0) > 0.05 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {(((model.errorRate ?? 0) * 100)).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round((model.errorRate ?? 0) * (model.calls ?? 0))} errors
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PerformanceScore latency={model.avgLatencyMs ?? 0} errorRate={model.errorRate ?? 0} usage={model.calls ?? 0} />
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Analytics Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">User Behavior Analytics</h2>
                <p className="text-sm text-muted-foreground">Usage patterns and cost analysis by user</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{totalUsers} active users</span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>API Calls</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Total Cost</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Avg Latency</span>
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Error Rate</span>
                    </div>
                  </TableHeader>
                  <TableHeader>User Type</TableHeader>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {byUser.map((user) => (
                  <tr key={user.user} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                          {(user.user?.[0] ?? "U").toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-sm">{user.user?.split("@")[0] ?? "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{user.user?.split("@")[1] || "Internal user"}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          <UsageBar value={user.calls ?? 0} max={Math.max(...byUser.map(u => u.calls ?? 0), 1)} />
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{(user.calls ?? 0).toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">
                            {(((user.calls ?? 0) / Math.max(totalCalls, 1)) * 100).toFixed(1)}% share
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className="font-mono font-medium text-green-600">${(user.totalCostUsd ?? 0).toFixed(5)}</div>
                        <div className="text-xs text-muted-foreground">
                          ${(((user.totalCostUsd ?? 0) / Math.max(user.calls ?? 0, 1))).toFixed(6)}/call
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className={`font-mono font-medium ${
                          (user.avgLatencyMs ?? 0) < 500 ? "text-green-600" :
                          (user.avgLatencyMs ?? 0) < 1000 ? "text-yellow-600" : "text-red-600"
                        }`}>
                          {Math.round(user.avgLatencyMs ?? 0)}ms
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-right">
                        <div className={`font-medium ${
                          (user.errorRate ?? 0) > 0.1 ? "text-red-600" :
                          (user.errorRate ?? 0) > 0.05 ? "text-yellow-600" : "text-green-600"
                        }`}>
                          {(((user.errorRate ?? 0) * 100)).toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserTypeBadge calls={user.calls ?? 0} cost={user.totalCostUsd ?? 0} />
                    </TableCell>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ——— UI Components ——— */

function MetricCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number | string;
  change: string;
  trend: "up" | "down";
  icon: React.ReactNode;
  color: "blue" | "green" | "purple" | "orange" | "red";
  subtitle: string;
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
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>{icon}</div>
        <div className={`flex items-center space-x-1 text-sm ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
          {trend === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          <span>{change}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </div>
    </div>
  );
}

function InsightCard({
  title,
  value,
  metric,
  icon,
  color,
  description,
}: {
  title: string;
  value: string;
  metric: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "purple";
  description: string;
}) {
  const colorClasses = {
    blue: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50",
    green: "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50",
    purple: "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50",
  };
  const iconClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  };
  return (
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-6 border`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${iconClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
        </div>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">{value}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{metric}</p>
      </div>
    </div>
  );
}

function UsageBar({ value, max }: { value: number; max: number }) {
  const safeMax = Math.max(max || 0, 1);
  const percentage = Math.min((value / safeMax) * 100, 100);
  return (
    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300" style={{ width: `${percentage}%` }} />
    </div>
  );
}

function LatencyIndicator({ latency }: { latency: number }) {
  const l = latency ?? 0;
  const color =
    l < 500 ? "bg-green-400" : l < 1000 ? "bg-yellow-400" : "bg-red-400";
  const pct = Math.min((l / 2000) * 100, 100);
  return (
    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function PerformanceScore({ latency, errorRate, usage }: { latency: number; errorRate: number; usage: number }) {
  let score = 100;
  if (latency > 1000) score -= 30;
  else if (latency > 500) score -= 15;
  if (errorRate > 0.1) score -= 40;
  else if (errorRate > 0.05) score -= 20;
  if (usage > 1000) score += 5;
  score = Math.max(0, Math.min(100, score));
  const badge =
    score >= 90
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : score >= 80
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : score >= 70
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  const grade = score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : "C";
  return (
    <div className="text-center">
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${badge}`}>{grade}</span>
      <div className="text-xs text-muted-foreground mt-1">{score}/100</div>
    </div>
  );
}

function UserTypeBadge({ calls, cost }: { calls: number; cost: number }) {
  const type =
    calls > 1000 || cost > 0.1 ? "Power User" : calls > 100 || cost > 0.01 ? "Regular" : "Light";
  const color =
    type === "Power User"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      : type === "Regular"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>{type}</span>;
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return <td className="px-6 py-4">{children}</td>;
}