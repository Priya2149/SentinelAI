"use client";

import { RouteError } from "@/components/system/route-error";

export default function LogsError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteError
      title="Could not load logs"
      description="Log data could not be loaded. Try refreshing or adjusting filters."
      error={error}
      reset={reset}
    />
  );
}