export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ensureAlwaysFreshData } from "@/lib/seedDemoDataAggressive";
import {
  Activity,
  CheckCircle2,
  XCircle,
  FlagTriangleRight,
  Gauge,
  Clock,
  Coins,
  User2,
  Cpu,
  RefreshCw,
  CalendarDays,
  Sparkles,
} from "lucide-react";

const STATUS_VALUES = ["SUCCESS", "FAIL", "FLAGGED"] as const;
type Status = (typeof STATUS_VALUES)[number];

function asStatus(s: unknown): Status {
  return STATUS_VALUES.includes(String(s) as Status)
    ? (s as Status)
    : "FLAGGED";
}

const RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};
type RangeKey = keyof typeof RANGE_MS;

const PAGE_SIZE = 10;

export default async function Page({
  searchParams,
}: {
  searchParams?: { range?: string; ts?: string; page?: string };
}) {
  await ensureAlwaysFreshData();

  const rangeParam = (searchParams?.range as RangeKey) || "24h";
  const requestedRange: RangeKey =
    rangeParam in RANGE_MS ? (rangeParam as RangeKey) : "24h";

  const rawPage = Number(searchParams?.page ?? "1");
  let page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  async function loadCounts(range: RangeKey) {
    const since = new Date(Date.now() - RANGE_MS[range]);
    const counts = await prisma.modelCall.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { createdAt: { gte: since } },
    });
    const total = counts.reduce((a, c) => a + c._count.status, 0);
    return { range, since, counts, total };
  }

  let { range, since, counts, total } = await loadCounts(requestedRange);
  if (range === "24h" && total === 0) {
    ({ range, since, counts, total } = await loadCounts("3d"));
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) page = totalPages;

  const skip = (page - 1) * PAGE_SIZE;

  const latest = await prisma.modelCall.findMany({
    skip,
    take: PAGE_SIZE,
    orderBy: { createdAt: "desc" },
    include: { user: true },
    where: { createdAt: { gte: since } },
  });

  const ok = counts.find((c) => c.status === "SUCCESS")?._count.status ?? 0;
  const fail = counts.find((c) => c.status === "FAIL")?._count.status ?? 0;
  const flagged =
    counts.find((c) => c.status === "FLAGGED")?._count.status ?? 0;
  const refreshHref = `?range=${range}&page=1&ts=${Date.now()}`;

  return (
    <div className="p-0 sm:p-4 relative isolate min-h-full">
      <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none [background:radial-gradient(60%_50%_at_10%_10%,white,transparent_60%),radial-gradient(40%_40%_at_90%_20%,white,transparent_60%)]" />
        <div className="relative px-4 py-4 sm:px-5 sm:py-5 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur border border-white/20 mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Live analytics
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
              Overview
            </h1>
            <p className="text-xs sm:text-sm text-white/85 max-w-xl">
              Simulated LLM monitoring with cost, latency, and basic safety signal tracking.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <ToolbarChip
              href={`?range=24h&page=1`}
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="24h"
              active={range === "24h"}
            />
            <ToolbarChip
              href={`?range=3d&page=1`}
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="3d"
              active={range === "3d"}
            />
            <ToolbarChip
              href={`?range=7d&page=1`}
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="7d"
              active={range === "7d"}
            />
            <Link
              href={refreshHref}
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition px-2.5 py-1.5 backdrop-blur text-xs"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </Link>
          </div>
        </div>
      </div>
      <section className="mt-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-semibold mb-1.5 text-muted-foreground uppercase tracking-wide">
              Getting Started
            </div>
            <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-0.5">
              <li>
                Explore the charts and tables below to see how SentinelAI tracks
                AI usage, cost, latency, and errors using realistic demo data.
              </li>
              <li>
               Open the Logs page to inspect how LLM calls would appear in a real deployment.
              </li>
              <li>
                Visit{" "}
                <a
                  className="underline font-medium"
                  href="/docs/connect"
                  rel="noreferrer"
                >
                  Connect
                </a>{" "}
                Docs to see a conceptual example of how applications could POST events to
                `/api/logs/ingest`in a full version of SentinelAI.
              </li>
            </ol>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/playground"
              className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[11px] hover:bg-indigo-700 font-medium whitespace-nowrap"
            >
              Run a test
            </a>
            <a
              href="/docs/connect"
              className="px-2.5 py-1 rounded-md border text-[11px] font-medium whitespace-nowrap"
            >
              Integration guide
            </a>
          </div>
        </div>
      </section>

      <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href={`/logs?range=${range}`} className="block group">
          <GlassKpi
            label="Total Calls"
            value={total}
            icon={<Activity className="h-5 w-5" />}
            ring="from-indigo-400 via-violet-500 to-fuchsia-500"
          />
        </Link>
        <GlassKpi
          label="Success"
          value={ok}
          helper={`${pct(ok, total)}% of total calls`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          ring="from-emerald-400 via-green-500 to-teal-500"
        />
        <GlassKpi
          label="Failures"
          value={fail}
          helper={`${pct(fail, total)}% error rate`}
          icon={<XCircle className="h-5 w-5" />}
          ring="from-rose-400 via-red-500 to-orange-500"
        />
        <GlassKpi
          label="Flagged"
          value={flagged}
          helper={`${pct(flagged, total)}% flagged calls`}
          icon={<FlagTriangleRight className="h-5 w-5" />}
          ring="from-amber-400 via-yellow-500 to-orange-500"
        />
      </section>

      <div className="mt-3 grid grid-cols-1 xl:grid-cols-[minmax(0,2.5fr)_minmax(0,1fr)] gap-3">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <header className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold">Latest Calls</h2>
            </div>
            <span className="text-xs sm:text-sm text-muted-foreground">
              Showing {latest.length} most recent (last {range})
            </span>
          </header>

          <div>
            <table className="w-full text-xs sm:text-sm table-fixed">
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
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white grid place-items-center text-[11px] font-semibold ring-2 ring-indigo-500/30">
                            {(row.user?.email?.[0] ?? "U").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium text-xs sm:text-sm">
                              {row.user?.email ?? "—"}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {row.id}
                            </div>
                          </div>
                        </div>
                      </Td>

                      <Td className="font-medium truncate">
                        {row.model ?? "—"}
                      </Td>

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
                            {new Date(
                              row.createdAt as unknown as string
                            ).toLocaleDateString("en-US", {
                              month: "numeric",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(
                              row.createdAt as unknown as string
                            ).toLocaleTimeString("en-US", {
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

          {/* Pagination */}
          <Pagination
            page={page}
            total={total}
            pageSize={PAGE_SIZE}
            range={range}
            currentCount={latest.length}
            skip={skip}
          />
        </section>
        <section className="space-y-4">
          <InsightCard
            title="Reliability"
            description="Success vs failure share"
            items={[
              { label: "Success", value: ok, tone: "green" },
              { label: "Failures", value: fail, tone: "red" },
              { label: "Flagged", value: flagged, tone: "amber" },
            ]}
          />
          <InsightCard
            title="Throughput (last 10)"
            description="Latency distribution"
            items={latest.slice(0, 5).map((r, i) => ({
              label: `Call #${i + 1}`,
              value: r.latencyMs,
              tone:
                r.latencyMs < 500
                  ? "green"
                  : r.latencyMs < 1000
                  ? "amber"
                  : "red",
            }))}
          />
        </section>
      </div>
    </div>
  );
}

/* ----------------- UI PIECES ----------------- */

function ToolbarChip({
  href,
  icon,
  label,
  active = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 backdrop-blur transition text-xs ${
        active
          ? "bg-white/20 text-white"
          : "bg-white/10 text-white/80 hover:bg-white/15"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function GlassKpi({
  label,
  value,
  icon,
  helper,
  ring,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  helper?: string;
  ring: string;
}) {
  return (
    <div className="relative rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm hover:shadow-md transition-shadow h-[116px] flex flex-col justify-between">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="text-xs font-medium text-muted-foreground mb-2">
            {label}
          </div>
          <div className="text-3xl font-bold tracking-tight">
            {value.toLocaleString()}
          </div>
        </div>
        <div className="relative shrink-0">
          <div
            className={`absolute -inset-1 rounded-lg blur opacity-20 bg-gradient-to-br ${ring}`}
          />
          <div
            className={`relative inline-flex items-center justify-center h-10 w-10 rounded-lg text-white bg-gradient-to-br ${ring} shadow-lg`}
          >
            {icon}
          </div>
        </div>
      </div>
      {helper && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-auto">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-50"></span>
          {helper}
        </div>
      )}
    </div>
  );
}

function InsightCard({
  title,
  description,
  items,
}: {
  title: string;
  description: string;
  items: { label: string; value: number; tone: "green" | "amber" | "red" }[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {description}
        </p>
      </div>
      <ul className="px-4 py-3 space-y-3">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between">
            <span className="text-xs sm:text-sm">{it.label}</span>
            <span
              className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-[11px] sm:text-xs font-mono ${
                it.tone === "green"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : it.tone === "amber"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  : "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
              }`}
            >
              {it.value.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold ${map[status]}`}
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
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-mono ${tone}`}
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
      className={`text-left px-3 py-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 ${className}`}
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

function pct(n: number, d: number) {
  const v = d ? (n / d) * 100 : 0;
  return v.toFixed(1);
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

  const makeHref = (p: number) => `?range=${range}&page=${p}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-800 text-xs sm:text-sm">
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
  active,
  disabled,
  ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg px-4 py-2 text-xs font-medium border transition";
  if (!href || disabled) {
    return (
      <span
        className={`${baseClasses} cursor-not-allowed border-gray-200 dark:border-gray-800 text-gray-400 bg-gray-50 dark:bg-gray-900`}
      >
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`${baseClasses} border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600`}
    >
      {children}
    </Link>
  );
}