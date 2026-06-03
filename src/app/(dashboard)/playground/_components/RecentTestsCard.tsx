"use client";

import { History } from "lucide-react";
import type { ApiResponse } from "@/types/playground";

export function RecentTestsCard({ history }: { history: ApiResponse[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm min-h-[200px] flex flex-col">
      <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
          <History className="h-4 w-4 text-indigo-600" />
        </div>

        <div>
          <div className="text-sm font-semibold">Recent Tests</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last {history.length || 0} calls this session
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
            <History className="h-5 w-5" />
            No test history yet
          </div>
        ) : (
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800 text-xs">
            {history.map((item, index) =>
              item.ok ? (
                <li
                  key={item.id}
                  className="px-6 py-3 flex items-center justify-between gap-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="font-medium text-gray-800 dark:text-gray-100">
                      {item.model}
                    </div>

                    <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                      {item.prompt}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px] text-gray-500 dark:text-gray-400">
                    <span>{(item.call.costUsd * 1000).toFixed(3)}¢</span>
                    <span>{item.call.latencyMs}ms</span>
                  </div>
                </li>
              ) : (
                <li
                  key={item.callId ?? `${item.error}-${index}`}
                  className="px-6 py-3 flex items-center justify-between gap-3"
                >
                  <div className="text-[11px] text-rose-500">
                    {item.error.slice(0, 120)}
                  </div>
                </li>
              )
            )}
          </ul>
        )}
      </div>
    </div>
  );
}