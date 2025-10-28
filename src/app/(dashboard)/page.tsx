export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
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
import LiveTickerPill from "@/components/dashboard/LiveTickerPill";

/** ----- status typing (no 'any') ----- */
const STATUS_VALUES = ["SUCCESS", "FAIL", "FLAGGED"] as const;
type Status = (typeof STATUS_VALUES)[number];

function asStatus(s: unknown): Status {
  return STATUS_VALUES.includes(String(s) as Status) ? (s as Status) : "FLAGGED";
}

/** ----- time range handling ----- */
const RANGE_MS: Record<string, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
};
type RangeKey = keyof typeof RANGE_MS;

export default async function Page({
  searchParams,
}: {
  searchParams?: { range?: string; ts?: string };
}) {
  const rangeParam = (searchParams?.range as RangeKey) || "24h";
  const range: RangeKey = rangeParam in RANGE_MS ? (rangeParam as RangeKey) : "24h";
  const since = new Date(Date.now() - RANGE_MS[range]);

  // Query within selected range
  const [counts, latest] = await Promise.all([
    prisma.modelCall.groupBy({
      by: ["status"],
      _count: { status: true },
      where: { createdAt: { gte: since } },
    }),
    prisma.modelCall.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: true },
      where: { createdAt: { gte: since } },
    }),
  ]);

  const total = counts.reduce((a, c) => a + c._count.status, 0);
  const ok = counts.find((c) => c.status === "SUCCESS")?._count.status ?? 0;
  const fail = counts.find((c) => c.status === "FAIL")?._count.status ?? 0;
  const flagged = counts.find((c) => c.status === "FLAGGED")?._count.status ?? 0;

  // keep the same range when refreshing
  const refreshHref = `?range=${range}&ts=${Date.now()}`;

  return (
    <div className="p-0 sm:p-6 relative isolate min-h-full">
      {/* ===== HERO (badge + description + functional filters) ===== */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white">
        <div className="absolute inset-0 opacity-30 mix-blend-overlay pointer-events-none [background:radial-gradient(60%_50%_at_10%_10%,white,transparent_60%),radial-gradient(40%_40%_at_90%_20%,white,transparent_60%)]" />
        <div className="relative px-6 py-8 sm:px-8 sm:py-10 flex items-center justify-between">
          <div>
            {/* badge above title */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Live analytics
            </div>

            <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight">
              Overview
            </h1>

            {/* short description from your project doc */}
            <p className="mt-1 text-sm sm:text-base text-white/85">
              Logs every LLM call, tracks token cost &amp; latency, and runs lightweight evals for hallucinations and security.
            </p>
          </div>

          {/* Toolbar (links so it works in a Server Component) */}
          <div className="hidden sm:flex items-center gap-2">
            <ToolbarChip href={`?range=24h`} icon={<CalendarDays className="h-4 w-4" />} label="24h" active={range === "24h"} />
            <ToolbarChip href={`?range=3d`} icon={<CalendarDays className="h-4 w-4" />} label="3d" active={range === "3d"} />
            <ToolbarChip href={`?range=7d`} icon={<CalendarDays className="h-4 w-4" />} label="7d" active={range === "7d"} />
            <Link
              href={refreshHref}
              className="ml-2 inline-flex items-center gap-2 rounded-lg bg-white/15 hover:bg-white/25 transition px-3 py-2 backdrop-blur"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-sm">Refresh</span>
            </Link>
          </div>
          {/* Live ticker (client component) */}
{/* place just under the toolbar inside the hero */}
<div className="absolute top-2 right-3 sm:right-4">

  <LiveTickerPill />
</div>

        </div>
      </div>

      {/* Getting Started (first-run help) */}
<section className="mt-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
  <div className="flex items-start justify-between gap-4 flex-wrap">
    <div>
      <div className="text-sm font-semibold mb-1">Getting started</div>
      <ol className="text-sm text-muted-foreground list-decimal list-inside space-y-1">
        <li>Open <a className="underline" href="/playground" target="_self">Playground</a> and run a test prompt (free/local works).</li>
        <li>Or integrate your app by hitting <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">POST /api/logs/ingest</code> from your backend (copy snippets from <a className="underline" href="/docs/connect" target="_self">Connect</a>).</li>
        <li>Return here — dashboards update in real time.</li>
      </ol>
    </div>
    <div className="flex items-center gap-2">
      <a href="/playground" className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700">Run a test</a>
      <a href="/docs/connect" className="px-3 py-2 rounded-lg border text-sm">Integration guide</a>
    </div>
  </div>
</section>


      {/* ===== KPIs ===== */}
      <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <Link href={`/logs?status=FLAGGED&range=${range}`} className="block">
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
          helper={`${pct(ok, total)}% success`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          ring="from-emerald-400 via-green-500 to-teal-500"
        />
        <GlassKpi
          label="Failures"
          value={fail}
          helper={`${pct(fail, total)}% errors`}
          icon={<XCircle className="h-5 w-5" />}
          ring="from-rose-400 via-red-500 to-orange-500"
        />
        <GlassKpi
          label="Flagged"
          value={flagged}
          helper={`${pct(flagged, total)}% flagged`}
          icon={<FlagTriangleRight className="h-5 w-5" />}
          ring="from-amber-400 via-yellow-500 to-orange-500"
        />
      </section>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT: Activity Table */}
        <section className="xl:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <header className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400">
                <Activity className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold">Latest Calls</h2>
            </div>
            <span className="text-sm text-muted-foreground">
              Showing {latest.length} most recent (last {range})
            </span>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/60">
                <tr>
                  <Th>
                    <div className="inline-flex items-center gap-2">
                      <User2 className="h-4 w-4" />
                      User
                    </div>
                  </Th>
                  <Th>
                    <div className="inline-flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      Model
                    </div>
                  </Th>
                  <Th>
                    <div className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Latency
                    </div>
                  </Th>
                  <Th>Tokens</Th>
                  <Th>
                    <div className="inline-flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Cost
                    </div>
                  </Th>
                  <Th>Status</Th>
                  <Th>
                    <div className="inline-flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      At
                    </div>
                  </Th>
                </tr>
              </thead>
              <tbody className="[&_tr:nth-child(even)]:bg-gray-50/60 dark:[&_tr:nth-child(even)]:bg-gray-800/40">
                {latest.map((row) => {
                  const tokenTotal = row.promptTokens + row.respTokens;
                  return (
                    <tr key={row.id} className="border-t border-gray-200/70 dark:border-gray-800/70">
                      <Td>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-white grid place-items-center text-xs font-semibold ring-2 ring-indigo-500/30">
                            {(row.user?.email?.[0] ?? "U").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-medium">
                              {row.user?.email ?? "—"}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate">
                              {row.id}
                            </div>
                          </div>
                        </div>
                      </Td>

                      <Td className="font-medium">{row.model}</Td>

                      <Td>
                        <LatencyBadge ms={row.latencyMs} />
                      </Td>

                      <Td>
                        <span className="font-mono">{tokenTotal.toLocaleString()}</span>
                      </Td>

                      <Td>
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">
                          ${row.costUsd.toFixed(5)}
                        </span>
                      </Td>

                      <Td>
                        <StatusPill status={asStatus(row.status)} />
                      </Td>

                      <Td className="whitespace-nowrap">
                        {new Date(row.createdAt as unknown as string).toLocaleString()}
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* RIGHT: Quick Insights */}
        <section className="space-y-6">
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
            items={latest
              .slice(0, 5)
              .map((r, i) => ({
                label: `Call #${i + 1}`,
                value: r.latencyMs,
                tone: r.latencyMs < 500 ? "green" : r.latencyMs < 1000 ? "amber" : "red",
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
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 backdrop-blur transition ${
        active ? "bg-white/20 text-white" : "bg-white/10 text-white/80 hover:bg-white/15"
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
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
  ring: string; // gradient tailwind e.g. "from-... via-... to-..."
}) {
  return (
    <div className="relative rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className={`absolute -inset-1 rounded-xl blur-lg opacity-30 bg-gradient-to-r ${ring}`} />
          <div className={`relative inline-flex items-center justify-center h-10 w-10 rounded-xl text-white bg-gradient-to-r ${ring}`}>
            {icon}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{helper}</div>
      </div>
      <div className="mt-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-4xl sm:text-5xl font-bold font-mono leading-none">{value.toLocaleString()}</div>
      </div>
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
      <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <ul className="px-5 py-4 space-y-3">
        {items.map((it) => (
          <li key={it.label} className="flex items-center justify-between">
            <span className="text-sm">{it.label}</span>
            <span
              className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-mono ${
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
    SUCCESS: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    FAIL: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400",
    FLAGGED: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  } as const;

  const Icon = status === "SUCCESS" ? CheckCircle2 : status === "FAIL" ? XCircle : FlagTriangleRight;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
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
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono ${tone}`}>
      <Clock className="h-3.5 w-3.5" />
      {Math.round(ms)}ms
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">
      {children}
    </th>
  );
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function pct(n: number, d: number) {
  const v = d ? (n / d) * 100 : 0;
  return v.toFixed(1);
}
