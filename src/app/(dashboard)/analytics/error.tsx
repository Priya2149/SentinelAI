"use client";

import { RouteError } from "@/components/system/route-error";

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteError
      title="Could not load analytics"
      description="Analytics data could not be loaded. Check the database connection or try again."
      error={error}
      reset={reset}
    />
  );
}