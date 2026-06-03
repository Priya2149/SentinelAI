import type { ReactNode } from "react";
import {
  AlertTriangle,
  Cpu,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import type { AnalyticsStats } from "@/server/analytics/analytics.types";

type Color = "blue" | "green" | "purple" | "orange" | "red";

export function AnalyticsStatsGrid({ stats }: { stats: AnalyticsStats }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Models"
        value={stats.totalModels}
        change="+0"
        trend="up"
        icon={<Cpu className="h-5 w-5" />}
        color="blue"
        subtitle="Active AI models"
      />

      <MetricCard
        title="Active Users"
        value={stats.totalUsers}
        change="+0"
        trend="up"
        icon={<Users className="h-5 w-5" />}
        color="green"
        subtitle="Unique users this period"
      />

      <MetricCard
        title="Total Spend"
        value={`$${stats.totalCost.toFixed(4)}`}
        change="+0%"
        trend="up"
        icon={<DollarSign className="h-5 w-5" />}
        color="purple"
        subtitle="Cumulative API costs"
      />

      <MetricCard
        title="Error Rate"
        value={`${stats.overallErrorRate.toFixed(1)}%`}
        change="+0%"
        trend="up"
        icon={<AlertTriangle className="h-5 w-5" />}
        color={stats.overallErrorRate > 10 ? "red" : "orange"}
        subtitle="System reliability"
      />
    </div>
  );
}

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
  icon: ReactNode;
  color: Color;
  subtitle: string;
}) {
  const colorClasses: Record<Color, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 flex items-center justify-between">
        <div
          className={`rounded-lg bg-gradient-to-r p-2 text-white ${colorClasses[color]}`}
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

      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}