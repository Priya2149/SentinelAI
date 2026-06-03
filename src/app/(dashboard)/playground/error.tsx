"use client";

export default function PlaygroundError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center gap-4 p-6 text-center">
      <div>
        <h2 className="text-xl font-semibold">Could not load playground</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong while loading the AI playground.
        </p>
      </div>

      <button
        onClick={reset}
        className="rounded-md border px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        Try again
      </button>
    </div>
  );
}