import type { ReactNode } from "react";
import { AlertTriangle, Clock, DollarSign, Zap } from "lucide-react";
import type { LogsStats } from "@/server/logs/logs.types";

type Color = "blue" | "green" | "purple" | "orange" | "red";

export function LogsStatsGrid({ stats }: { stats: LogsStats }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <QuickStat
        icon={<Zap className="h-5 w-5" />}
        label="Total Calls"
        value={stats.totalCalls.toLocaleString()}
        color="blue"
      />

      <QuickStat
        icon={<DollarSign className="h-5 w-5" />}
        label="Total Cost"
        value={`$${stats.totalCost.toFixed(4)}`}
        color="green"
      />

      <QuickStat
        icon={<Clock className="h-5 w-5" />}
        label="Avg Latency"
        value={`${stats.avgLatency}ms`}
        color="purple"
      />

      <QuickStat
        icon={<AlertTriangle className="h-5 w-5" />}
        label="Error Rate"
        value={`${(stats.errorRate * 100).toFixed(1)}%`}
        color={stats.errorRate > 0.1 ? "red" : "orange"}
      />
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  color: Color;
}) {
  const colorMap: Record<Color, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-800">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg bg-gradient-to-r p-2 text-white ${colorMap[color]}`}
        >
          {icon}
        </div>

        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}