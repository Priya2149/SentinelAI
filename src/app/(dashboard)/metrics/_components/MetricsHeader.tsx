"use client";

import { Eye, FileDown, RefreshCw } from "lucide-react";
import type { TimeRange } from "@/server/metrics/metrics.types";

export function MetricsHeader({
  timeRange,
  setTimeRange,
  lastUpdated,
  loading,
  previewLoading,
  downloading,
  totalCost,
  firstDate,
  lastDate,
  onRefresh,
  onPreviewPdf,
  onDownloadPdf,
  hallucinationRate,
  toxicityRate,
}: {
  timeRange: TimeRange;
  setTimeRange: (value: TimeRange) => void;
  lastUpdated: Date;
  loading: boolean;
  previewLoading: boolean;
  downloading: boolean;
  totalCost: number;
  firstDate?: string;
  lastDate?: string;
  onRefresh: () => void;
  onPreviewPdf: () => void;
  onDownloadPdf: () => void;
  hallucinationRate: number;
  toxicityRate: number;
}) {
  const burnPerMin = (() => {
    if (!firstDate || !lastDate) return 0;

    const minutes =
      (new Date(lastDate).getTime() - new Date(firstDate).getTime()) / 60_000 ||
      1;

    return minutes > 0 ? totalCost / minutes : 0;
  })();

  const projectedMonthly = burnPerMin * 60 * 24 * 30;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
          Performance Metrics
        </h1>

        <div className="mt-1">
          <RiskBadge
            hallucinationRate={hallucinationRate}
            toxicityRate={toxicityRate}
          />
        </div>

        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          Explore simulated insights that illustrate how SentinelAI would track
          AI system performance in real time.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>

        <select
          value={timeRange}
          onChange={(event) => setTimeRange(event.target.value as TimeRange)}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs dark:border-gray-700 dark:bg-gray-800"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>

        <button
          onClick={onPreviewPdf}
          disabled={previewLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          title="Preview PDF"
        >
          <Eye className="h-3.5 w-3.5" />
          {previewLoading ? "Preparing…" : "Preview PDF"}
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
          title="Download PDF"
        >
          <FileDown className="h-3.5 w-3.5" />
          {downloading ? "Preparing…" : "Download PDF"}
        </button>

        <div className="hidden items-center rounded-lg border px-2.5 py-1 text-[11px] text-muted-foreground md:flex">
          <span>
            Burn ${burnPerMin.toFixed(4)}/min · ~$
            {projectedMonthly.toFixed(2)}/mo
          </span>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-2.5 py-1 text-xs text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>
    </div>
  );
}

function RiskBadge({
  hallucinationRate,
  toxicityRate,
}: {
  hallucinationRate: number;
  toxicityRate: number;
}) {
  const score = 0.7 * hallucinationRate + 0.3 * toxicityRate;
  const label = score > 0.15 ? "High" : score > 0.07 ? "Medium" : "Low";

  const className =
    label === "High"
      ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
      : label === "Medium"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";

  return (
    <span
      className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${className}`}
    >
      Risk: {label}
    </span>
  );
}