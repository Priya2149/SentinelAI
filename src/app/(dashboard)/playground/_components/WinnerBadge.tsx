"use client";

import { Rocket } from "lucide-react";
import type { ApiResponse } from "@/types/playground";

export function WinnerBadge({
  resp1,
  resp2,
  model1,
  model2,
}: {
  resp1: ApiResponse;
  resp2: ApiResponse;
  model1: string;
  model2: string;
}) {
  if (!resp1.ok || !resp2.ok) return null;

  const costWinner = resp1.call.costUsd < resp2.call.costUsd ? model1 : model2;
  const latencyWinner =
    resp1.call.latencyMs < resp2.call.latencyMs ? model1 : model2;

  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-900/20 px-4 py-3 flex items-center justify-between gap-4 text-xs">
      <div className="flex items-center gap-2">
        <Rocket className="h-4 w-4 text-emerald-600" />
        <span className="font-semibold text-emerald-800 dark:text-emerald-100">
          Comparison Summary
        </span>
      </div>

      <div className="flex gap-4">
        <WinnerMetric label="Cheaper" value={costWinner} />
        <WinnerMetric label="Faster" value={latencyWinner} />
      </div>
    </div>
  );
}

function WinnerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-lg font-bold text-green-600">{value}</div>
    </div>
  );
}