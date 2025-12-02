export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import type { ReactNode } from "react";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

import {
  Clock,
  User,
  Zap,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Flag,
} from "lucide-react";

import LogsClient, {
  RowActions,
  type RangeKey,
  type StatusKey,
  type LogRow,
} from "./LogsClient";
import LiveFeedHeader from "./LiveFeedHeader";

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
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  return `${Math.floor(diffSeconds / 86400)}d ago`;
}

function toNumberOrUndefined(v?: string): number | undefined {
  if (!v?.trim()) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

type SearchParamsShape = {
  q?: string;
  status?: string;
  model?: string;
  user?: string;
  minLatency?: string;
  maxLatency?: string;
  minCost?: string;
  maxCost?: string;
  range?: RangeKey;
  page?: string;
};

type ModelCallWithUser = Prisma.ModelCallGetPayload<{ include: { user: true } }>;

function buildQueryString(
  searchParams: SearchParamsShape | undefined,
  page: number,
): string {
  const params = new URLSearchParams();

  if (searchParams?.q) params.set("q", searchParams.q);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.model) params.set("model", searchParams.model);
  if (searchParams?.user) params.set("user", searchParams.user);
  if (searchParams?.minLatency) params.set("minLatency", searchParams.minLatency);
  if (searchParams?.maxLatency) params.set("maxLatency", searchParams.maxLatency);
  if (searchParams?.minCost) params.set("minCost", searchParams.minCost);
  if (searchParams?.maxCost) params.set("maxCost", searchParams.maxCost);
  if (searchParams?.range) params.set("range", searchParams.range);

  if (page > 1) params.set("page", String(page));
  else params.delete("page");

  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

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
      .filter((s): s is StatusKey =>
        ["SUCCESS", "FAIL", "FLAGGED"].includes(s),
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

  const allRows: LogRow[] = raw.map((r) => {
    const bag = r as unknown as Record<string, unknown>;
    const input = (bag["input"] ?? bag["prompt"]) as unknown;
    const output = (bag["output"] ?? bag["response"]) as unknown;
    const meta = (bag["meta"] ?? bag["metadata"]) as unknown;

    const promptTokens = Number(
      (r as { promptTokens?: number | null }).promptTokens ?? 0,
    );
    const respTokens = Number(
      (r as { respTokens?: number | null }).respTokens ?? 0,
    );
    const latency = Number(
      (r as { latencyMs?: number | null }).latencyMs ?? 0,
    );
    const cost = Number((r as { costUsd?: number | null }).costUsd ?? 0);

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

  const pageSize = 10;
  const totalCalls = allRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCalls / pageSize));

  const rawPage = Number(searchParams?.page ?? "1");
  let page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  if (page > totalPages) page = totalPages;

  const startIndex = (page - 1) * pageSize;
  const rows = allRows.slice(startIndex, startIndex + pageSize);

  const totalCost = allRows.reduce((sum, r) => sum + r.cost, 0);
  const avgLatency = Math.round(
    totalCalls ? allRows.reduce((s, r) => s + r.latency, 0) / totalCalls : 0,
  );
  const errorRate =
    totalCalls === 0
      ? 0
      : (allRows.filter((r) => r.status !== "SUCCESS").length / totalCalls) *
        100;

  const lastUpdated = allRows[0]?.at ?? new Date();

  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const entriesLabel =
    range === "all"
      ? `(${totalCalls} entries, all time)`
      : `(${totalCalls} entries, last ${range})`;

  return (
    <div className="space-y-4 px-4 pt-3 pb-4">
      {/* Header + search/filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Call Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Logs every LLM call, tracks token cost & latency, and runs lightweight
            safety checks — all visualized here with realistic demo traffic.
          </p>
        </div>

        <LogsClient
          initialRows={allRows}
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
          }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <QuickStat
          icon={<Zap className="h-4 w-4" />}
          label="Total Calls"
          value={totalCalls.toLocaleString()}
          color="blue"
        />
        <QuickStat
          icon={<DollarSign className="h-4 w-4" />}
          label="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          color="green"
        />
        <QuickStat
          icon={<Clock className="h-4 w-4" />}
          label="Avg Latency"
          value={`${avgLatency}ms`}
          color="purple"
        />
        <QuickStat
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Error Rate"
          value={`${errorRate.toFixed(1)}%`}
          color={errorRate > 10 ? "red" : "orange"}
        />
      </div>

      {/* Logs table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border overflow-hidden">
        {/* Live feed header with auto-refresh toggle */}
        <div className="px-4 sm:px-6 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
          <LiveFeedHeader entriesLabel={entriesLabel} lastUpdated={lastUpdated} />
        </div>

        {/* Scrollable table body */}
        <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0 z-10">
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

            <tbody className="divide-y">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-mono text-xs">{formatDate(row.at)}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {formatRelativeTime(row.at)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.model}</TableCell>
                  <TableCell>{row.latency}ms</TableCell>
                  <TableCell>{row.tokens}</TableCell>
                  <TableCell>${row.cost.toFixed(5)}</TableCell>
                  <TableCell>
                    <StatusBadgeEnhanced status={row.status} />
                  </TableCell>
                  <TableCell>
                    <RowActions row={row} />
                  </TableCell>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t bg-gray-50">
          <div className="text-xs text-muted-foreground">
            Showing{" "}
            {totalCalls === 0 ? 0 : startIndex + 1}–
            {startIndex + rows.length} of {totalCalls}
          </div>
          <div className="flex items-center gap-2">
            {hasPrev ? (
              <a
                href={buildQueryString(searchParams, page - 1)}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
              >
                Previous
              </a>
            ) : (
              <button
                className="px-3 py-1 text-xs border rounded opacity-50"
                disabled
              >
                Previous
              </button>
            )}
            {hasNext ? (
              <a
                href={buildQueryString(searchParams, page + 1)}
                className="px-3 py-1 text-xs border rounded hover:bg-gray-100"
              >
                Next
              </a>
            ) : (
              <button
                className="px-3 py-1 text-xs border rounded opacity-50"
                disabled
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- helper components (no `any`) ---------- */

function TableHeader({ children }: { children: ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] font-semibold uppercase text-gray-500">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-4 py-2 text-xs">{children}</td>;
}

type StatusConfig = {
  icon: ReactNode;
  classes: string;
  pulse: boolean;
};

function StatusBadgeEnhanced({ status }: { status: string | StatusKey }) {
  const base: StatusConfig = {
    icon: <AlertTriangle className="h-3 w-3" />,
    classes:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
    pulse: false,
  };

  const map: Partial<Record<string, StatusConfig>> = {
    SUCCESS: {
      icon: <CheckCircle2 className="h-3 w-3" />,
      classes:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
      pulse: false,
    },
    FAIL: {
      icon: <XCircle className="h-3 w-3" />,
      classes:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
      pulse: true,
    },
    FLAGGED: {
      icon: <Flag className="h-3 w-3" />,
      classes:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
      pulse: true,
    },
  };

  const cfg = map[status] ?? base;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg.classes} ${
        cfg.pulse ? "animate-pulse" : ""
      }`}
    >
      {cfg.icon}
      <span>{status}</span>
    </span>
  );
}

type QuickStatProps = {
  icon: ReactNode;
  label: string;
  value: string;
  color: "blue" | "green" | "purple" | "orange" | "red";
};

function QuickStat({ icon, label, value, color }: QuickStatProps) {
  const colorClasses: Record<QuickStatProps["color"], string> = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-3">
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-base font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
