export function MetricsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 w-56 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-6 w-20 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
          <div className="mt-2 h-4 w-full max-w-md animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-28 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="mt-3 h-4 w-24 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-7 w-28 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:p-4"
          >
            <div className="h-5 w-36 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="mt-2 h-4 w-44 animate-pulse rounded-md bg-gray-200 dark:bg-gray-700" />
            <div className="mt-5 h-[180px] animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}