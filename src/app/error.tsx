"use client";

import { RouteError } from "@/components/system/route-error";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <RouteError
          title="Application error"
          description="The application could not recover from an unexpected error."
          error={error}
          reset={reset}
        />
      </body>
    </html>
  );
}