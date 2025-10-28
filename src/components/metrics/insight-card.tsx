import * as React from "react";

export default function InsightCard({
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
    blue:
      "from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200/50",
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
    <div className={`bg-gradient-to-r ${colorClasses[color]} rounded-xl p-6 border`}>
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 rounded-lg ${iconClasses[color]}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-500">{description}</p>
        </div>
      </div>
      <div>
        <p className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate">
          {value}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{metric}</p>
      </div>
    </div>
  );
}
