"use client";

import { RouteError } from "@/components/system/route-error";

export default function PlaygroundError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <RouteError
      title="Could not load playground"
      description="The AI playground could not be loaded. Try again or return to the dashboard."
      error={error}
      reset={reset}
    />
  );
}