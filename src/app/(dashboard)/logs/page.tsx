export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

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
import LogsClient, { RowActions } from "./LogsClient";
import LiveFeedHeader from "./LiveFeedHeader";

type RangeKey = "24h" | "3d" | "7d" | "all";
export type StatusKey = "SUCCESS" | "FAIL" | "FLAGGED";

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString();
}

function formatRelativeTime(d: Date | string) {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function toNum(v?: string) {
  if (!v) return undefined;
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
  auto?: "on" | "off";
  page?: string;
  id?: string; // 👈 added so we can read /logs?id=...
};

export type LogRow = {
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
  searchParams: Promise<SearchParamsShape>;
}) {
  const resolved = await searchParams;
  const q = (resolved?.q ?? "").trim();

  const statusList: StatusKey[] = (resolved?.status ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(
      (x): x is StatusKey => x === "SUCCESS" || x === "FAIL" || x === "FLAGGED"
    );

  const model = (resolved?.model ?? "").trim();
  const userEmail = (resolved?.user ?? "").trim();

  const minLatency = toNum(resolved?.minLatency);
  const maxLatency = toNum(resolved?.maxLatency);
  const minCost = toNum(resolved?.minCost);
  const maxCost = toNum(resolved?.maxCost);

  const range: RangeKey = (resolved?.range as RangeKey) ?? "24h";
  const page = Number(resolved?.page ?? "1");

  const selectedId = (resolved?.id ?? "").trim() || undefined; // 👈 notification target row

  const pageSize = 10;
  const skip = (page - 1) * pageSize;

  const since =
    range === "24h"
      ? new Date(Date.now() - 86400000)
      : range === "3d"
      ? new Date(Date.now() - 3 * 86400000)
      : range === "7d"
      ? new Date(Date.now() - 7 * 86400000)
      : undefined;

  const where: Prisma.ModelCallWhereInput = {
    ...(since ? { createdAt: { gte: since } } : {}),
    ...(statusList.length ? { status: { in: statusList } } : {}),

    ...(q
      ? {
          OR: [
            { model: { contains: q, mode: "insensitive" } },
            { id: { contains: q, mode: "insensitive" } },
            { user: { email: { contains: q, mode: "insensitive" } } },
          ],
        }
      : {}),

    ...(model ? { model } : {}),
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

  const totalCount = await prisma.modelCall.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const raw = await prisma.modelCall.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
    take: pageSize,
    include: { user: true },
  });

  const rows: LogRow[] = raw.map((r) => {
    const bag = r as unknown as Record<string, unknown>;
    return {
      id: r.id,
      at: r.createdAt,
      user: r.user?.email ?? "—",
      model: r.model,
      latency: Number(r.latencyMs ?? 0),
      tokens: Number(r.promptTokens ?? 0) + Number(r.respTokens ?? 0),
      cost: Number(r.costUsd ?? 0),
      status: r.status as StatusKey,
      promptTokens: Number(r.promptTokens ?? 0),
      respTokens: Number(r.respTokens ?? 0),
      input: bag["input"] ?? bag["prompt"],
      output: bag["output"] ?? bag["response"],
      meta: bag["meta"] ?? bag["metadata"],
    };
  });

  const lastUpdated = rows[0]?.at ?? new Date();
  const totalCalls = totalCount;

  const sumCost = await prisma.modelCall.aggregate({ _sum: { costUsd: true } });
  const avgLatency = await prisma.modelCall.aggregate({
    _avg: { latencyMs: true },
  });

  const errorRate =
    totalCount > 0
      ? (await prisma.modelCall.count({
          where: { status: { not: "SUCCESS" } },
        })) / totalCount
      : 0;

  return (
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            API Call Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            View simulated LLM call logs with cost, latency, tokens, and safety signals — illustrating how real-time monitoring would work in a full integration.
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
          }}
        />
      </div>

      {/* STATS */}
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
          value={`$${(sumCost._sum.costUsd ?? 0).toFixed(4)}`}
          color="green"
        />
        <QuickStat
          icon={<Clock className="h-5 w-5" />}
          label="Avg Latency"
          value={`${Math.round(avgLatency._avg.latencyMs ?? 0)}ms`}
          color="purple"
        />
        <QuickStat
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Error Rate"
          value={`${(errorRate * 100).toFixed(1)}%`}
          color={errorRate > 0.1 ? "red" : "orange"}
        />
      </div>

      {/* TABLE */}
      <FullTableUI
        rows={rows}
        totalPages={totalPages}
        currentPage={page}
        pageSize={pageSize}
        totalCount={totalCount}
        lastUpdated={lastUpdated}
        selectedId={selectedId} // 👈 pass through
      />
    </div>
  );
}

/* ============================================================
   TABLE UI (LIGHT + DARK THEME COMPATIBLE)
   ============================================================ */

function FullTableUI({
  rows,
  currentPage,
  totalPages,
  totalCount,
  lastUpdated,
  selectedId,
}: {
  rows: LogRow[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  lastUpdated: Date;
  selectedId?: string;
}) {
  function pageHref(p: number) {
    const sp = new URLSearchParams();
    sp.set("page", String(p));
    return `/logs?${sp.toString()}`;
  }

  return (
    <div
      className="
      bg-white dark:bg-gray-900 
      rounded-xl shadow-sm 
      border border-gray-200 dark:border-gray-800 
      overflow-hidden"
    >
      {/* Live Feed Header */}
      <div
        className="
        px-6 py-4 
        border-b 
        bg-white dark:bg-gray-900
        border-gray-200 dark:border-gray-800"
      >
        <LiveFeedHeader
          entriesLabel={`(${totalCount.toLocaleString()} entries)`} 
          lastUpdated={lastUpdated}
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-hidden">
        <table className="w-full">
          <colgroup>
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "11%" }} />
            <col style={{ width: "12%" }} />
            <col style={{ width: "8%" }} />
          </colgroup>

          <thead
            className="
            bg-gray-50 dark:bg-gray-900 
            border-b border-gray-200 dark:border-gray-800"
          >
            <tr>
              <TableHeaderCell title="Time" icon={<Clock className="h-4 w-4" />} />
              <TableHeaderCell title="User" icon={<User className="h-4 w-4" />} />
              <TableHeaderCell title="Model" />
              <TableHeaderCell title="Latency" />
              <TableHeaderCell title="Tokens" />
              <TableHeaderCell title="Cost" />
              <TableHeaderCell title="Status" />
              <TableHeaderCell title="Actions" />
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className={[
                  "border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition",
                  row.id === selectedId
                    ? "bg-blue-50 dark:bg-blue-900/40 ring-1 ring-blue-300"
                    : "",
                ].join(" ")}
              >
                {/* TIME */}
                <td className="px-4 py-5">
                  <div className="font-medium text-sm text-gray-900 dark:text-gray-200">
                    {formatDate(row.at)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {formatRelativeTime(row.at)}
                  </div>
                </td>

                {/* USER */}
                <td className="px-4 py-5">
                  <UserCell email={row.user} />
                </td>

                {/* MODEL */}
                <td className="px-4 py-5">
                  <span
                    className="
                      inline-flex items-center 
                      px-3 py-1 
                      rounded-full 
                      bg-gray-100 text-gray-900
                      border border-gray-300
                      dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200
                      text-xs font-medium
                      whitespace-nowrap
                    "
                  >
                    {row.model}
                  </span>
                </td>

                {/* LATENCY */}
                <td className="px-4 py-5">
                  <LatencyCell latency={row.latency} />
                </td>

                {/* TOKENS */}
                <td className="px-4 py-5">
                  <TokensCell
                    total={row.tokens}
                    prompt={row.promptTokens}
                    resp={row.respTokens}
                  />
                </td>

                {/* COST */}
                <td className="px-4 py-5">
                  <CostCell cost={row.cost} />
                </td>

                {/* STATUS */}
                <td className="px-4 py-5">
                  <StatusBadge status={row.status} />
                </td>

                {/* ACTIONS */}
                <td className="px-4 py-5">
                  <RowActions row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div
        className="
        p-4 
        border-t 
        bg-white dark:bg-gray-900 
        border-gray-200 dark:border-gray-800 
        flex items-center justify-between"
      >
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </span>

        <div className="flex gap-2">
          <a
            href={pageHref(Math.max(1, currentPage - 1))}
            className="
              px-3 py-1 
              border rounded 
              text-gray-700 dark:text-gray-300 
              border-gray-300 dark:border-gray-700 
              hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
          >
            Previous
          </a>
          <a
            href={pageHref(Math.min(totalPages, currentPage + 1))}
            className="
              px-3 py-1 
              border rounded 
              text-gray-700 dark:text-gray-300 
              border-gray-300 dark:border-gray-700 
              hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
          >
            Next
          </a>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   UI COMPONENTS — THEME-AWARE
   ============================================================ */

function TableHeaderCell({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <th
      className="px-4 py-4 text-left text-xs font-semibold uppercase 
                   text-gray-500 dark:text-gray-400"
    >
      <div className="flex items-center gap-2">
        {icon}
        {title}
      </div>
    </th>
  );
}

function UserCell({ email }: { email: string }) {
  const name = email === "—" ? "Anonymous" : email.split("@")[0];
  const domain = email === "—" ? "Guest User" : email.split("@")[1];

  return (
    <div className="flex items-center gap-3 min-w-0">
      <div
        className="
        h-9 w-9 flex-shrink-0 rounded-full 
        bg-gradient-to-br from-purple-500 to-purple-600 
        grid place-items-center text-white text-sm font-semibold shadow-md"
      >
        {email === "—" ? "U" : email[0].toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-gray-900 dark:text-gray-200 truncate">
          {name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {domain}
        </div>
      </div>
    </div>
  );
}

function LatencyCell({ latency }: { latency: number }) {
  const isFast = latency < 500;
  const color = isFast ? "bg-green-500" : "bg-yellow-500";
  const label = isFast ? "Fast" : "Normal";
  const width = Math.min((latency / 2000) * 100, 100) + "%";

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex-shrink-0">
          <div className={`h-full ${color}`} style={{ width }} />
        </div>
        <div className="text-sm font-semibold text-yellow-500 dark:text-yellow-400 whitespace-nowrap">
          {latency}ms
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}

function TokensCell({
  total,
  prompt,
  resp,
}: {
  total: number;
  prompt: number;
  resp: number;
}) {
  return (
    <div>
      <div className="font-semibold text-base text-gray-900 dark:text-gray-200">
        {total.toLocaleString()}
      </div>
      <div className="flex gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        <span>{prompt}↑</span>
        <span>{resp}↓</span>
      </div>
    </div>
  );
}

function CostCell({ cost }: { cost: number }) {
  return (
    <div>
      <div className="font-semibold text-base text-green-600 dark:text-green-400">
        ${cost.toFixed(5)}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {(cost * 1000).toFixed(2)}/1K
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === "SUCCESS"
      ? {
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          cls: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
        }
      : status === "FAIL"
      ? {
          icon: <XCircle className="h-3.5 w-3.5" />,
          cls: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        }
      : {
          icon: <Flag className="h-3.5 w-3.5" />,
          cls: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
        };

  return (
    <span
      className={`px-2.5 py-1.5 rounded-full text-xs font-medium border inline-flex gap-1.5 items-center ${cfg.cls}`}
    >
      {cfg.icon}
      {status}
    </span>
  );
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
  const colorMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${colorMap[color]} text-white`}>
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
