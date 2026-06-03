import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  FlagTriangleRight,
  Gauge,
  User2,
  XCircle,
} from "lucide-react";
import type {
  OverviewCallRow,
  RangeKey,
  Status,
} from "@/server/overview/overview.types";
import { asStatus } from "@/server/overview/overview.utils";

export function LatestCallsTable({
  latest,
  range,
  total,
  page,
  pageSize,
  skip,
}: {
  latest: OverviewCallRow[];
  range: RangeKey;
  total: number;
  page: number;
  pageSize: number;
  skip: number;
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-600/10 p-2 text-indigo-600 dark:text-indigo-400">
            <Activity className="h-4 w-4" />
          </div>

          <h2 className="text-base font-semibold">Latest Calls</h2>
        </div>

        <span className="text-xs text-muted-foreground sm:text-sm">
          Showing {latest.length} most recent (last {range})
        </span>
      </header>

      <div>
        <table className="w-full table-fixed text-xs sm:text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <Th className="w-[28%]">
                <div className="inline-flex items-center gap-2">
                  <User2 className="h-3.5 w-3.5" />
                  User
                </div>
              </Th>

              <Th className="w-[16%]">
                <div className="inline-flex items-center gap-2">
                  <Cpu className="h-3.5 w-3.5" />
                  Model
                </div>
              </Th>

              <Th className="w-[12%]">
                <div className="inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" />
                  Latency
                </div>
              </Th>

              <Th className="w-[10%]">Tokens</Th>

              <Th className="w-[11%]">
                <div className="inline-flex items-center gap-2">
                  <Coins className="h-3.5 w-3.5" />
                  Cost
                </div>
              </Th>

              <Th className="w-[11%]">Status</Th>

              <Th className="w-[12%]">
                <div className="inline-flex items-center gap-2">
                  <Gauge className="h-3.5 w-3.5" />
                  At
                </div>
              </Th>
            </tr>
          </thead>

          <tbody className="[&_tr:nth-child(even)]:bg-gray-50/60 dark:[&_tr:nth-child(even)]:bg-gray-800/40">
            {latest.map((row) => {
              const tokenTotal = row.promptTokens + row.respTokens;

              return (
                <tr
                  key={row.id}
                  className="border-t border-gray-200/70 dark:border-gray-800/70"
                >
                  <Td>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-[11px] font-semibold text-white ring-2 ring-indigo-500/30">
                        {(row.user?.email?.[0] ?? "U").toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="truncate text-xs font-medium sm:text-sm">
                          {row.user?.email ?? "—"}
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {row.id}
                        </div>
                      </div>
                    </div>
                  </Td>

                  <Td className="truncate font-medium">{row.model ?? "—"}</Td>

                  <Td>
                    <LatencyBadge ms={row.latencyMs} />
                  </Td>

                  <Td>
                    <span className="font-mono">
                      {tokenTotal.toLocaleString()}
                    </span>
                  </Td>

                  <Td>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      ${row.costUsd.toFixed(5)}
                    </span>
                  </Td>

                  <Td>
                    <StatusPill status={asStatus(row.status)} />
                  </Td>

                  <Td className="text-[11px] sm:text-xs">
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {new Date(row.createdAt).toLocaleDateString("en-US", {
                          month: "numeric",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <span className="text-[10px] text-muted-foreground">
                        {new Date(row.createdAt).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </div>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={total}
        pageSize={pageSize}
        range={range}
        currentCount={latest.length}
        skip={skip}
      />
    </section>
  );
}

function StatusPill({ status }: { status: Status }) {
  const map = {
    SUCCESS:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    FAIL: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    FLAGGED:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  } as const;

  const Icon =
    status === "SUCCESS"
      ? CheckCircle2
      : status === "FAIL"
      ? XCircle
      : FlagTriangleRight;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold sm:text-xs ${map[status]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}

function LatencyBadge({ ms }: { ms: number }) {
  const tone =
    ms < 500
      ? "text-emerald-700 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30"
      : ms < 1000
      ? "text-amber-700 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30"
      : "text-rose-700 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] sm:text-xs ${tone}`}
    >
      <Clock className="h-3.5 w-3.5" />
      {Math.round(ms)}ms
    </span>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 sm:text-[11px] ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <td className={`px-3 py-2 align-middle text-xs sm:text-sm ${className}`}>
      {children}
    </td>
  );
}

function Pagination({
  page,
  total,
  pageSize,
  range,
  currentCount,
  skip,
}: {
  page: number;
  total: number;
  pageSize: number;
  range: RangeKey;
  currentCount: number;
  skip: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) return null;

  const start = total === 0 ? 0 : skip + 1;
  const end = skip + currentCount;

  const makeHref = (nextPage: number) => `?range=${range}&page=${nextPage}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3 text-xs dark:border-gray-800 sm:text-sm">
      <p className="text-muted-foreground">
        {total === 0
          ? "No calls in this range yet."
          : `Showing ${start}–${end} of ${total} results`}
      </p>

      <div className="flex items-center gap-2">
        <PageLink
          href={page > 1 ? makeHref(page - 1) : undefined}
          disabled={page <= 1}
        >
          Previous
        </PageLink>

        <PageLink
          href={page < totalPages ? makeHref(page + 1) : undefined}
          disabled={page >= totalPages}
        >
          Next
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  children,
  disabled,
}: {
  href?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg border px-4 py-2 text-xs font-medium transition";

  if (!href || disabled) {
    return (
      <span
        className={`${baseClasses} cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-900`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${baseClasses} border-gray-300 hover:border-gray-400 hover:bg-gray-100 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800`}
    >
      {children}
    </Link>
  );
}