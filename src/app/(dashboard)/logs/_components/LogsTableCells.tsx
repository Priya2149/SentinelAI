import type { ReactNode } from "react";
import { CheckCircle2, Flag, XCircle } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/server/logs/logs.utils";

export function TableHeaderCell({
  title,
  icon,
}: {
  title: string;
  icon?: ReactNode;
}) {
  return (
    <th className="px-4 py-4 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
    </th>
  );
}

export function TimeCell({ value }: { value: Date | string }) {
  return (
    <td className="px-4 py-5">
      <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
        {formatDate(value)}
      </div>
      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        {formatRelativeTime(value)}
      </div>
    </td>
  );
}

export function UserCell({ email }: { email: string }) {
  const name = email === "—" ? "Anonymous" : email.split("@")[0];
  const domain = email === "—" ? "Guest User" : email.split("@")[1];

  return (
    <td className="px-4 py-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 text-sm font-semibold text-white shadow-md">
          {email === "—" ? "U" : email[0].toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-medium text-gray-900 dark:text-gray-200">
            {name}
          </div>
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
            {domain}
          </div>
        </div>
      </div>
    </td>
  );
}

export function ModelCell({ model }: { model: string }) {
  return (
    <td className="px-4 py-5">
      <span className="inline-flex items-center whitespace-nowrap rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200">
        {model}
      </span>
    </td>
  );
}

export function LatencyCell({ latency }: { latency: number }) {
  const isFast = latency < 500;
  const color = isFast ? "bg-green-500" : "bg-yellow-500";
  const label = isFast ? "Fast" : "Normal";
  const width = `${Math.min((latency / 2000) * 100, 100)}%`;

  return (
    <td className="px-4 py-5">
      <div>
        <div className="mb-1 flex items-center gap-2">
          <div className="h-1.5 w-16 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
            <div className={`h-full ${color}`} style={{ width }} />
          </div>

          <div className="whitespace-nowrap text-sm font-semibold text-yellow-500 dark:text-yellow-400">
            {latency}ms
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      </div>
    </td>
  );
}

export function TokensCell({
  total,
  prompt,
  resp,
}: {
  total: number;
  prompt: number;
  resp: number;
}) {
  return (
    <td className="px-4 py-5">
      <div className="text-base font-semibold text-gray-900 dark:text-gray-200">
        {total.toLocaleString()}
      </div>
      <div className="mt-0.5 flex gap-1 text-xs text-gray-500 dark:text-gray-400">
        <span>{prompt}↑</span>
        <span>{resp}↓</span>
      </div>
    </td>
  );
}

export function CostCell({ cost }: { cost: number }) {
  return (
    <td className="px-4 py-5">
      <div className="text-base font-semibold text-green-600 dark:text-green-400">
        ${cost.toFixed(5)}
      </div>
      <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
        ${(cost * 1000).toFixed(2)}/1K
      </div>
    </td>
  );
}

export function StatusCell({ status }: { status: string }) {
  const cfg =
    status === "SUCCESS"
      ? {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          cls: "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400",
        }
      : status === "FAIL"
      ? {
          icon: <XCircle className="h-3.5 w-3.5" />,
          cls: "border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400",
        }
      : {
          icon: <Flag className="h-3.5 w-3.5" />,
          cls: "border-yellow-500/20 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
        };

  return (
    <td className="px-4 py-5">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-xs font-medium ${cfg.cls}`}
      >
        {cfg.icon}
        {status}
      </span>
    </td>
  );
}