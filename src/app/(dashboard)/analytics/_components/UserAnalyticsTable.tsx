import {
  Activity,
  AlertTriangle,
  Clock,
  DollarSign,
  PieChart,
  Users,
} from "lucide-react";
import type { UserRow } from "@/server/analytics/analytics.types";
import {
  TableCell,
  TableHeader,
  UsageBar,
  UserTypeBadge,
} from "../../../../components/analytics/table/AnalyticsTablePrimitives";

export function UserAnalyticsTable({
  users,
  totalCalls,
}: {
  users: UserRow[];
  totalCalls: number;
}) {
  const maxCalls = Math.max(...users.map((user) => user.calls), 1);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
              <Users className="h-5 w-5 text-green-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold">
                User Behavior Analytics
              </h2>
              <p className="text-sm text-muted-foreground">
                Usage patterns and cost analysis by user
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {users.length} active users
            </span>
          </div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
          No user analytics available.
        </div>
      ) : (
        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>User</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <Activity className="h-4 w-4" />
                      <span>API Calls</span>
                    </div>
                  </TableHeader>

                  <TableHeader>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-4 w-4" />
                      <span>Total Cost</span>
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
                      <AlertTriangle className="h-4 w-4" />
                      <span>Error Rate</span>
                    </div>
                  </TableHeader>

                  <TableHeader>User Type</TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <tr
                    key={user.user}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-sm font-medium text-white">
                          {(user.user?.[0] ?? "U").toUpperCase()}
                        </div>

                        <div>
                          <div className="text-sm font-semibold">
                            {user.user?.split("@")[0] ?? "Unknown"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {user.user?.split("@")[1] || "Internal user"}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <UsageBar value={user.calls} max={maxCalls} />

                        <div className="text-right">
                          <div className="font-semibold">
                            {user.calls.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {(
                              (user.calls / Math.max(totalCalls, 1)) *
                              100
                            ).toFixed(1)}
                            % share
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div className="font-mono font-medium text-green-600">
                          ${user.totalCostUsd.toFixed(5)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          $
                          {(
                            user.totalCostUsd / Math.max(user.calls, 1)
                          ).toFixed(6)}
                          /call
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div
                          className={`font-mono font-medium ${
                            user.avgLatencyMs < 500
                              ? "text-green-600"
                              : user.avgLatencyMs < 1000
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(user.avgLatencyMs)}ms
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-right">
                        <div
                          className={`font-medium ${
                            user.errorRate > 0.1
                              ? "text-red-600"
                              : user.errorRate > 0.05
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {(user.errorRate * 100).toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <UserTypeBadge
                        calls={user.calls}
                        cost={user.totalCostUsd}
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