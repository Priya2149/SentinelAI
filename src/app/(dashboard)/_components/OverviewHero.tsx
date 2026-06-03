import Link from "next/link";
import { CalendarDays, RefreshCw, Sparkles } from "lucide-react";
import type { RangeKey } from "@/server/overview/overview.types";

export function OverviewHero({
  range,
  refreshHref,
}: {
  range: RangeKey;
  refreshHref: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 text-white dark:border-gray-800">
      <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-overlay [background:radial-gradient(60%_50%_at_10%_10%,white,transparent_60%),radial-gradient(40%_40%_at_90%_20%,white,transparent_60%)]" />

      <div className="relative flex items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/20 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Live analytics
          </div>

          <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">
            Overview
          </h1>

          <p className="max-w-xl text-xs text-white/85 sm:text-sm">
            Simulated LLM monitoring with cost, latency, and basic safety signal
            tracking.
          </p>
        </div>

        <div className="hidden items-center gap-1.5 sm:flex">
          <ToolbarChip
            href="?range=24h&page=1"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="24h"
            active={range === "24h"}
          />

          <ToolbarChip
            href="?range=3d&page=1"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="3d"
            active={range === "3d"}
          />

          <ToolbarChip
            href="?range=7d&page=1"
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="7d"
            active={range === "7d"}
          />

          <Link
            href={refreshHref}
            className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1.5 text-xs backdrop-blur transition hover:bg-white/25"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

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
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs backdrop-blur transition ${
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