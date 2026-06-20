"use client";

import Link from "next/link";
import { AlertTriangle, Home, RefreshCcw } from "lucide-react";

type RouteErrorProps = {
  title: string;
  description?: string;
  error: Error;
  reset: () => void;
};

export function RouteError({
  title,
  description = "Something went wrong while loading this page.",
  error,
  reset,
}: RouteErrorProps) {
  return (
    <div className="flex min-h-[420px] items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/40 dark:bg-red-950/30">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
            <AlertTriangle className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold text-red-950 dark:text-red-100">
              {title}
            </h2>

            <p className="mt-2 text-sm text-red-800/80 dark:text-red-200/80">
              {description}
            </p>

            {process.env.NODE_ENV === "development" && (
              <pre className="mt-4 max-h-40 overflow-auto rounded-xl border border-red-200 bg-white/70 p-3 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100">
                {error.message}
              </pre>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700"
              >
                <RefreshCcw className="h-4 w-4" />
                Try again
              </button>

              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200 dark:hover:bg-red-950/60"
              >
                <Home className="h-4 w-4" />
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}