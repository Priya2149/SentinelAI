import * as React from "react";

export default function LatencyIndicator({ latency }: { latency: number }) {
  const color =
    latency < 500 ? "bg-green-400" : latency < 1000 ? "bg-yellow-400" : "bg-red-400";
  const width = `${Math.min((latency / 2000) * 100, 100)}%`;

  return (
    <div className="w-12 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={`h-full ${color} transition-all duration-300`} style={{ width }} />
    </div>
  );
}
