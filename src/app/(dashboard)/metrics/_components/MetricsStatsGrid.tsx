import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { MetricsStats } from "@/server/metrics/metrics.types";

type Color = "blue" | "green" | "purple" | "orange" | "red";

export function MetricsStatsGrid({ stats }: { stats: MetricsStats }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Calls"
        value={stats.totalCalls.toLocaleString()}
        change={`+${(stats.totalCalls / 10).toFixed(1)}%`}
        trend="up"
        icon={<Activity className="h-4 w-4" />}
        color="blue"
      />

      <StatsCard
        title="Total Cost"
        value={`$${stats.totalCost.toFixed(4)}`}
        change={`+${(stats.totalCost * 100).toFixed(1)}%`}
        trend="up"
        icon={<DollarSign className="h-4 w-4" />}
        color="green"
      />

      <StatsCard
        title="Avg Latency"
        value={`${stats.avgLatency}ms`}
        change={stats.avgLatency < 500 ? "-12%" : "+8%"}
        trend={stats.avgLatency < 500 ? "up" : "down"}
        icon={<Clock className="h-4 w-4" />}
        color="purple"
      />

      <StatsCard
        title="Error Rate"
        value={`${stats.overallErrorRate.toFixed(1)}%`}
        change={stats.overallErrorRate < 5 ? "-2.4%" : "+1.2%"}
        trend={stats.overallErrorRate < 5 ? "up" : "down"}
        icon={<AlertTriangle className="h-4 w-4" />}
        color={stats.overallErrorRate > 10 ? "red" : "orange"}
      />
    </div>
  );
}

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
  icon: ReactNode;
  color: Color;
}) {
  const colorClasses: Record<Color, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4">
      <div className="flex items-center justify-between">
        <div
          className={`rounded-lg bg-gradient-to-r p-1.5 text-white ${colorClasses[color]}`}
        >
          {icon}
        </div>

        <div
          className={`flex items-center space-x-1 text-[11px] sm:text-xs ${
            trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="h-3.5 w-3.5" />
          ) : (
            <TrendingDown className="h-3.5 w-3.5" />
          )}
          <span>{change}</span>
        </div>
      </div>

      <div className="mt-2.5">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <p className="mt-0.5 text-lg font-bold sm:text-xl">{value}</p>
      </div>
    </div>
  );
}