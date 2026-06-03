import type { ReactNode } from "react";
import { DollarSign, Target, Zap } from "lucide-react";
import type { AnalyticsInsights } from "@/server/analytics/analytics.types";

export function AnalyticsInsightCards({
  insights,
}: {
  insights: AnalyticsInsights;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <InsightCard
        title="Top Performing Model"
        value={insights.topModel.value}
        metric={insights.topModel.metric}
        icon={<Target className="h-6 w-6" />}
        color="blue"
        description="Most frequently used model"
      />

      <InsightCard
        title="Power User"
        value={insights.topUser.value}
        metric={insights.topUser.metric}
        icon={<Zap className="h-6 w-6" />}
        color="green"
        description="Highest usage this period"
      />

      <InsightCard
        title="Cost Leader"
        value={insights.costLeader.value}
        metric={insights.costLeader.metric}
        icon={<DollarSign className="h-6 w-6" />}
        color="purple"
        description="Highest total spend"
      />
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
  icon: ReactNode;
  color: "blue" | "green" | "purple";
  description: string;
}) {
  const colorClasses = {
    blue: "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50",
    green:
      "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200/50",
    purple:
      "from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border-purple-200/50",
  };

  const iconClasses = {
    blue: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
    green: "text-green-600 bg-green-100 dark:bg-green-900/30",
    purple: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  };

  return (
    <div
      className={`rounded-xl border bg-gradient-to-r p-6 ${colorClasses[color]}`}
    >
      <div className="mb-4 flex items-center space-x-3">
        <div className={`rounded-lg p-2 ${iconClasses[color]}`}>{icon}</div>

        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <p className="truncate text-lg font-bold text-gray-900 dark:text-gray-100">
        {value}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{metric}</p>
    </div>
  );
}