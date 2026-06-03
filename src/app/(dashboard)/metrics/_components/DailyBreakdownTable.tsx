"use client";

import { Activity, AlertTriangle, BarChart3, ChevronDown, ChevronUp } from "lucide-react";
import type { DailyMetric } from "@/server/metrics/metrics.types";

export function DailyBreakdownTable({
  dailyData,
  showBreakdown,
  setShowBreakdown,
}: {
  dailyData: DailyMetric[];
  showBreakdown: boolean;
  setShowBreakdown: (value: boolean) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 sm:px-5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold sm:text-base">
              Daily Breakdown
            </h2>
            <p className="text-xs text-muted-foreground">
              Detailed metrics by day
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center space-x-1.5 text-xs text-muted-foreground sm:flex">
              <BarChart3 className="h-4 w-4" />
              <span>{dailyData.length} days tracked</span>
            </div>

            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              {showBreakdown ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  Hide table
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  Show table
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {showBreakdown && (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>API Calls</TableHeader>
                  <TableHeader>Daily Cost</TableHeader>
                  <TableHeader>Avg Latency</TableHeader>
                  <TableHeader>Errors</TableHeader>
                  <TableHeader>Error Rate</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {dailyData
                  .slice()
                  .reverse()
                  .slice(0, 10)
                  .map((row) => (
                    <tr
                      key={row.date}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell>
                        <div className="font-medium">
                          {new Date(row.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            weekday: "short",
                          })}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Activity className="h-4 w-4 text-blue-500" />
                          <span className="font-mono font-medium">
                            {row.calls.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="font-mono font-medium text-green-600">
                          ${row.costUsd.toFixed(4)}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`h-2 w-2 rounded-full ${
                              row.avgLatencyMs < 400
                                ? "bg-green-400"
                                : row.avgLatencyMs < 700
                                ? "bg-yellow-400"
                                : "bg-red-400"
                            }`}
                          />
                          <span className="font-mono">
                            {row.avgLatencyMs}ms
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {row.errors > 0 ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4" />
                          )}

                          <span
                            className={
                              row.errors > 5 ? "font-medium text-red-600" : ""
                            }
                          >
                            {row.errors}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <span
                          className={`font-medium ${
                            row.errorRate > 0.1
                              ? "text-red-600"
                              : row.errorRate > 0.05
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {(row.errorRate * 100).toFixed(1)}%
                        </span>
                      </TableCell>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-[11px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400 sm:px-5 sm:text-xs">
      {children}
    </th>
  );
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="whitespace-nowrap px-4 py-2.5 text-xs sm:px-5 sm:text-sm">
      {children}
    </td>
  );
}