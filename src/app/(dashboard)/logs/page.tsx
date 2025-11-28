// app/(dashboard)/logs/page.tsx
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

// NOTE: This is a **server component** file. Do NOT add "use client" here.
// Client-only UI (hooks, useEffect, etc.) lives in ./LogsClient.tsx

// If you use Prisma, keep this. Otherwise replace with your own data fetch.
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  Search as SearchIcon,
  Filter,
  Download,
  Clock,
  User,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";
import LogsClient, { RowActions } from "./LogsClient";

type RangeKey = "24h" | "3d" | "7d" | "all";
type StatusKey = "SUCCESS" | "FAIL" | "FLAGGED";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
function formatRelativeTime(d: Date | string): string {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
function toNumberOrUndefined(v?: string): number | undefined {
  if (!v?.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

type SearchParamsShape = {
  q?: string;
  status?: string; // "SUCCESS,FAIL"
  model?: string;
  user?: string;
  minLatency?: string;
  maxLatency?: string;
  minCost?: string;
  maxCost?: string;
  range?: RangeKey;
  auto?: "on" | "off";
  ts?: string;
};

type ModelCallWithUser = Prisma.ModelCallGetPayload<{ include: { user: true } }>;

type LogRow = {
  id: string;
  at: Date;
  user: string;
  model: string;
  latency: number;
  tokens: number;
  cost: number;
  status: StatusKey | string;
  promptTokens: number;
  respTokens: number;
  input?: unknown;
  output?: unknown;
  meta?: unknown;
};



export default async function LogsPage({
  searchParams,
}: {
  searchParams?: SearchParamsShape;
}) {
  const q = (searchParams?.q ?? "").trim();
  const statusList: StatusKey[] =
    (searchParams?.status ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .filter(
        (s): s is StatusKey => s === "SUCCESS" || s === "FAIL" || s === "FLAGGED"
      ) ?? [];

  const model = (searchParams?.model ?? "").trim();
  const userEmail = (searchParams?.user ?? "").trim();
  const minLatency = toNumberOrUndefined(searchParams?.minLatency);
  const maxLatency = toNumberOrUndefined(searchParams?.maxLatency);
  const minCost = toNumberOrUndefined(searchParams?.minCost);
  const maxCost = toNumberOrUndefined(searchParams?.maxCost);
  const range: RangeKey = (searchParams?.range as RangeKey) ?? "24h";

  const since: Date | undefined =
    range === "24h"
      ? new Date(Date.now() - 24 * 60 * 60 * 1000)
      : range === "3d"
      ? new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      : range === "7d"
      ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : undefined;

  // Prisma where (replace with your own query if you’re not on Prisma)
  const where: Prisma.ModelCallWhereInput = {
    ...(since ? { createdAt: { gte: since } } : {}),
    ...(statusList.length ? { status: { in: statusList } } : {}),
    ...(model ? { model: { equals: model } } : {}),
    ...(q
      ? {
          OR: [
            { model: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),
    ...(userEmail
      ? { user: { email: { contains: userEmail, mode: "insensitive" } } }
      : {}),
    ...((minLatency !== undefined || maxLatency !== undefined) && {
      latencyMs: {
        ...(minLatency !== undefined ? { gte: minLatency } : {}),
        ...(maxLatency !== undefined ? { lte: maxLatency } : {}),
      },
    }),
    ...((minCost !== undefined || maxCost !== undefined) && {
      costUsd: {
        ...(minCost !== undefined ? { gte: minCost } : {}),
        ...(maxCost !== undefined ? { lte: maxCost } : {}),
      },
    }),
  };

  const raw: ModelCallWithUser[] = await prisma.modelCall.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: true },
  });

  const rows: LogRow[] = raw.map((r) => {
    const bag = r as unknown as Record<string, unknown>;
    const input = (bag["input"] ?? bag["prompt"]) as unknown;
    const output = (bag["output"] ?? bag["response"]) as unknown;
    const meta = (bag["meta"] ?? bag["metadata"]) as unknown;

    const promptTokens = Number(r.promptTokens ?? 0);
    const respTokens = Number(r.respTokens ?? 0);
    const latency = Number(r.latencyMs ?? 0);
    const cost = Number(r.costUsd ?? 0);

    return {
      id: r.id,
      at: r.createdAt,
      user: r.user?.email ?? "—",
      model: r.model,
      latency,
      tokens: promptTokens + respTokens,
      cost,
      status: r.status as StatusKey | string,
      promptTokens,
      respTokens,
      input,
      output,
      meta,
    };
  });

  const totalCalls = rows.length;
  const totalCost = rows.reduce((sum, r) => sum + r.cost, 0);
  const avgLatency = Math.round(
    totalCalls ? rows.reduce((s, r) => s + r.latency, 0) / totalCalls : 0
  );
  const errorRate =
    totalCalls === 0
      ? 0
      : (rows.filter((r) => r.status !== "SUCCESS").length / totalCalls) * 100;
  const lastUpdated = rows[0]?.at ?? new Date();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Call Logs</h1>
          <p className="text-muted-foreground mt-2">
           Logs every LLM call, tracks token cost & latency, and runs lightweight safety checks — all visualized here with realistic demo traffic.
          </p>
        </div>

        <LogsClient
          initialRows={rows}
          lastUpdated={lastUpdated}
          defaults={{
            q,
            statusList,
            model,
            userEmail,
            minLatency,
            maxLatency,
            minCost,
            maxCost,
            range,
            auto: (searchParams?.auto as "on" | "off") ?? "off",
          }}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickStat
          icon={<Zap className="h-5 w-5" />}
          label="Total Calls"
          value={totalCalls.toLocaleString()}
          color="blue"
        />
        <QuickStat
          icon={<DollarSign className="h-5 w-5" />}
          label="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          color="green"
        />
        <QuickStat
          icon={<Clock className="h-5 w-5" />}
          label="Avg Latency"
          value={`${avgLatency}ms`}
          color="purple"
        />
        <QuickStat
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Error Rate"
          value={`${errorRate.toFixed(1)}%`}
          color={errorRate > 10 ? "red" : "orange"}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium">Live Feed</span>
                <span className="text-xs text-muted-foreground">
                  ({totalCalls} entries, last{" "}
                  {range === "all" ? "all time" : range})
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                Auto-refresh:{" "}
                <strong className="font-medium">
                  {((searchParams?.auto ?? "off") as "on" | "off").toUpperCase()}
                </strong>
              </span>
              <div className="h-1 w-1 bg-gray-400 rounded-full" />
              <span>Last updated: {formatRelativeTime(lastUpdated)}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/30">
              <tr>
                <TableHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Time</span>
                  </div>
                </TableHeader>
                <TableHeader>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>User</span>
                  </div>
                </TableHeader>
                <TableHeader>Model</TableHeader>
                <TableHeader>Latency</TableHeader>
                <TableHeader>Tokens</TableHeader>
                <TableHeader>Cost</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-150 ${
                    index < 5 ? "bg-blue-50/30 dark:bg-blue-950/10" : ""
                  }`}
                >
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm">{formatDate(row.at)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelativeTime(row.at)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full grid place-items-center text-white text-xs font-medium">
                        {row.user === "—"
                          ? "U"
                          : row.user[0]!.toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">
                          {row.user === "—"
                            ? "Anonymous"
                            : row.user.split("@")[0]}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.user === "—" ? "Guest User" : row.user.split("@")[1]}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border">
                      {row.model}
                    </span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <LatencyIndicator latency={row.latency} />
                      <div className="text-right">
                        <div
                          className={`font-mono text-sm font-medium ${
                            row.latency < 500
                              ? "text-green-600"
                              : row.latency < 1000
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {row.latency}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.latency < 500 ? "Fast" : row.latency < 1000 ? "Normal" : "Slow"}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-sm font-medium">
                        {row.tokens.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{row.promptTokens}↑</span>
                        <span>{row.respTokens}↓</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-right">
                      <div className="font-mono text-sm font-medium text-green-600">
                        ${row.cost.toFixed(5)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(row.cost * 1000).toFixed(2)}/1K
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusBadgeEnhanced status={row.status} />
                  </TableCell>

                  <TableCell>
                    {/* Client-only actions imported from LogsClient.tsx */}
                    <RowActions row={row} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing <span className="font-medium">{Math.min(rows.length, 200)}</span> of{" "}
              <span className="font-medium">{rows.length}</span> results
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Previous
              </button>
              <button className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 dark:hover:bg-gray-700">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== server-side table bits ===================== */

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
function QuickStat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
}) {
  const colorClasses: Record<typeof color, string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-lg font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
function LatencyIndicator({ latency }: { latency: number }) {
  const color = latency < 500 ? "bg-green-400" : latency < 1000 ? "bg-yellow-400" : "bg-red-400";
  const width = `${Math.min((latency / 2000) * 100, 100)}%`;
  return (
    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width }} />
    </div>
  );
}
function StatusBadgeEnhanced({ status }: { status: string }) {
  const cfg =
    status === "SUCCESS"
      ? {
          icon: <CheckCircle2 className="h-3 w-3" />,
          cls: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          pulse: false,
        }
      : status === "FAIL"
      ? {
          icon: <XCircle className="h-3 w-3" />,
          cls: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
          pulse: true,
        }
      : status === "FLAGGED"
      ? {
          icon: <Flag className="h-3 w-3" />,
          cls: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
          pulse: true,
        }
      : {
          icon: <AlertTriangle className="h-3 w-3" />,
          cls: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
          pulse: false,
        };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.cls} ${cfg.pulse ? "animate-pulse" : ""}`}>
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
}

export type { RangeKey, StatusKey, LogRow };
