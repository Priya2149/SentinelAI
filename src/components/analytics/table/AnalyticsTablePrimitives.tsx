import type { ReactNode } from "react";

export function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-6 py-4">{children}</td>;
}

export function UsageBar({ value, max }: { value: number; max: number }) {
  const safeMax = Math.max(max || 0, 1);
  const percentage = Math.min((value / safeMax) * 100, 100);

  return (
    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function LatencyIndicator({ latency }: { latency: number }) {
  const color =
    latency < 500
      ? "bg-green-400"
      : latency < 1000
      ? "bg-yellow-400"
      : "bg-red-400";

  const percentage = Math.min((latency / 2000) * 100, 100);

  return (
    <div className="h-2 w-12 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
      <div
        className={`h-full transition-all duration-300 ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

export function PerformanceScore({
  latency,
  errorRate,
  usage,
}: {
  latency: number;
  errorRate: number;
  usage: number;
}) {
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

  const grade =
    score >= 90 ? "A+" : score >= 80 ? "A" : score >= 70 ? "B" : "C";

  return (
    <div className="text-center">
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}
      >
        {grade}
      </span>
      <div className="mt-1 text-xs text-muted-foreground">{score}/100</div>
    </div>
  );
}

export function UserTypeBadge({
  calls,
  cost,
}: {
  calls: number;
  cost: number;
}) {
  const type =
    calls > 1000 || cost > 0.1
      ? "Power User"
      : calls > 100 || cost > 0.01
      ? "Regular"
      : "Light";

  const color =
    type === "Power User"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      : type === "Regular"
      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${color}`}
    >
      {type}
    </span>
  );
}