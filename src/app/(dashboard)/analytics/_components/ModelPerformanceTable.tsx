import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Cpu,
  DollarSign,
} from "lucide-react";
import type { ModelRow } from "@/server/analytics/analytics.types";
import {
  LatencyIndicator,
  PerformanceScore,
  TableCell,
  TableHeader,
  UsageBar,
} from "../../../../components/analytics/table/AnalyticsTablePrimitives";

export function ModelPerformanceTable({
  models,
  totalCalls,
}: {
  models: ModelRow[];
  totalCalls: number;
}) {
  const maxCalls = Math.max(...models.map((model) => model.calls), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
              <Cpu className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                Model Performance Analysis
              </h2>
              <p className="text-sm text-muted-foreground">
                Comprehensive breakdown by AI model
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {models.length} models tracked
            </span>
          </div>
        </div>
      </div>

      {models.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
          No model analytics available.
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Cpu className="h-4 w-4" />
                      <span>Model</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>Calls</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Avg Latency</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Avg Cost</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Error Rate</span>
                    </div>
                  </TableHeader>

                  <TableHeader>Performance</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {models.map((model, index) => (
                  <tr
                    key={model.model}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-sm font-medium text-white">
                          {model.model.slice(0, 2).toUpperCase()}
                        </div>

                        <div>
                          <div className="text-sm font-semibold">
                            {model.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            #{index + 1} by usage
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UsageBar value={model.calls} max={maxCalls} />

                        <div className="text-right">
                          <div className="font-semibold">
                            {model.calls.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(
                              (model.calls / Math.max(totalCalls, 1)) *
                              100
                            ).toFixed(1)}
                            % share
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <LatencyIndicator latency={model.avgLatencyMs} />

                        <div className="text-right">
                          <div
                            className={`font-mono font-medium ${
                              model.avgLatencyMs < 500
                                ? "text-green-600"
                                : model.avgLatencyMs < 1000
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {Math.round(model.avgLatencyMs)}ms
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {model.avgLatencyMs < 500
                              ? "Excellent"
                              : model.avgLatencyMs < 1000
                              ? "Good"
                              : "Needs improvement"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div className="font-mono font-medium text-green-600">
                          ${model.avgCostUsd.toFixed(5)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${model.totalCostUsd.toFixed(4)} total
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            model.errorRate > 0.1
                              ? "text-red-600"
                              : model.errorRate > 0.05
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {(model.errorRate * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(model.errorRate * model.calls)} errors
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <PerformanceScore
                        latency={model.avgLatencyMs}
                        errorRate={model.errorRate}
                        usage={model.calls}
                      />
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