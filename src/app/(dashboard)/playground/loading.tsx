function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 ${className}`}
    />
  );
}

function WhiteSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-white/25 ${className}`} />
  );
}

export default function Loading() {
  return (
    <div className="space-y-6 p-0 md:p-6">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 text-white shadow-2xl">
        <div className="px-6 py-4 sm:px-8 sm:py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <WhiteSkeleton className="h-7 w-44 rounded-full" />
              <WhiteSkeleton className="mt-4 h-9 w-72" />
              <WhiteSkeleton className="mt-3 h-4 w-full max-w-2xl" />
              <WhiteSkeleton className="mt-2 h-4 w-96" />
            </div>

            <div className="flex gap-3">
              <WhiteSkeleton className="h-16 w-28 rounded-xl" />
              <WhiteSkeleton className="h-16 w-28 rounded-xl" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <WhiteSkeleton key={index} className="h-9 w-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 xl:grid-cols-2">
        <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="h-5 w-44" />
              </div>
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 border-b border-gray-100 px-6 py-4 dark:border-gray-800 md:grid-cols-2">
            <Skeleton className="h-20 rounded-lg md:col-span-2" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>

          <div className="space-y-6 px-6 py-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>

            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-10/12" />
              <Skeleton className="h-28 w-full rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <Skeleton className="h-6 w-36" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-14 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}