export function AnalyticsHeader({ hasData }: { hasData: boolean }) {
  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Advanced Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explore simulated analytics that illustrate how SentinelAI would track
          model performance, cost trends, and usage patterns.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        {hasData ? (
          <div className="flex items-center space-x-2 rounded-full bg-green-50 px-3 py-1.5 text-sm text-green-700 dark:bg-green-950/20 dark:text-green-400">
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            <span>Live data</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            <div className="h-2 w-2 rounded-full bg-gray-400" />
            <span>Offline</span>
          </div>
        )}
      </div>
    </div>
  );
}