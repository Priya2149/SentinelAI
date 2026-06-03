import Link from "next/link";
import {
  Activity,
  CheckCircle2,
  FlagTriangleRight,
  XCircle,
} from "lucide-react";
import type {
  OverviewCounts,
  RangeKey,
} from "@/server/overview/overview.types";
import { pct } from "@/server/overview/overview.utils";

export function OverviewKpiGrid({
  counts,
  range,
}: {
  counts: OverviewCounts;
  range: RangeKey;
}) {
  return (
    <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Link href={`/logs?range=${range}`} className="block group">
        <GlassKpi
          label="Total Calls"
          value={counts.total}
          icon={<Activity className="h-5 w-5" />}
          ring="from-indigo-400 via-violet-500 to-fuchsia-500"
        />
      </Link>

      <GlassKpi
        label="Success"
        value={counts.ok}
        helper={`${pct(counts.ok, counts.total)}% of total calls`}
        icon={<CheckCircle2 className="h-5 w-5" />}
        ring="from-emerald-400 via-green-500 to-teal-500"
      />

      <GlassKpi
        label="Failures"
        value={counts.fail}
        helper={`${pct(counts.fail, counts.total)}% error rate`}
        icon={<XCircle className="h-5 w-5" />}
        ring="from-rose-400 via-red-500 to-orange-500"
      />

      <GlassKpi
        label="Flagged"
        value={counts.flagged}
        helper={`${pct(counts.flagged, counts.total)}% flagged calls`}
        icon={<FlagTriangleRight className="h-5 w-5" />}
        ring="from-amber-400 via-yellow-500 to-orange-500"
      />
    </section>
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
    <div className="relative flex h-[116px] flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            {label}
          </div>

          <div className="text-3xl font-bold tracking-tight">
            {value.toLocaleString()}
          </div>
        </div>

        <div className="relative shrink-0">
          <div
            className={`absolute -inset-1 rounded-lg bg-gradient-to-br opacity-20 blur ${ring}`}
          />
          <div
            className={`relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-lg ${ring}`}
          >
            {icon}
          </div>
        </div>
      </div>

      {helper && (
        <div className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-current opacity-50" />
          {helper}
        </div>
      )}
    </div>
  );
}