"use client";

import {
  CheckCircle2,
  Copy,
  Loader2,
  Shield,
  TerminalSquare,
  XCircle,
} from "lucide-react";
import type { ApiResponse } from "@/types/playground";

export function ResponseCard({
  response,
  loading,
  modelName,
  onExport,
  showExport = true,
}: {
  response: ApiResponse | null;
  loading: boolean;
  modelName: string;
  onExport: () => void;
  showExport?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm flex flex-col h-full min-h-[220px]">
      <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <TerminalSquare className="h-4 w-4 text-indigo-600" />
          </div>

          <div>
            <div className="text-sm font-semibold">Response</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Model: {modelName || "—"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {response?.ok && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              Success
            </span>
          )}

          {!response?.ok && response && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 px-3 py-1.5 text-xs font-semibold">
              <XCircle className="h-4 w-4" />
              Error
            </span>
          )}

          {showExport && response?.ok && (
            <button
              onClick={onExport}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 dark:border-gray-700 px-2.5 py-1.5 text-xs text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              Export JSON
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4 flex-1 text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating response…
          </div>
        ) : !response ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center">
            Run a prompt to see the model response here.
          </div>
        ) : response.ok ? (
          response.output
        ) : (
          <span className="text-rose-500 dark:text-rose-300">
            {response.error}
          </span>
        )}
      </div>

      {response?.ok && (
        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex flex-wrap gap-3">
            <span>Latency: {response.call.latencyMs}ms</span>
            <span>
              Tokens: {response.call.promptTokens + response.call.respTokens}
            </span>
            <span>Cost: ${response.call.costUsd.toFixed(5)}</span>
          </div>

          {response.safety && (
            <div className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <span className="font-medium capitalize">
                {response.safety.score}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}