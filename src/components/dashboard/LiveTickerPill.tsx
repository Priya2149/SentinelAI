"use client";
import { useEffect, useState } from "react";

export default function LiveTickerPill() {
  const [data, setData] = useState<{callsPerMin:number; errorRate:number; p95:number} | null>(null);
  async function load() {
    try {
      const r = await fetch("/api/metrics/live", { cache: "no-store" });
      if (!r.ok) throw new Error("live api");
      const j = await r.json();
      setData({ callsPerMin: j.callsPerMin ?? 0, errorRate: j.errorRate ?? 0, p95: j.p95 ?? 0 });
    } catch { /* ignore */ }
  }
  useEffect(() => { load(); const id = setInterval(load, 5000); return () => clearInterval(id); }, []);
  return (
    <div className="hidden sm:flex items-center gap-3 rounded-full bg-white/90 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 px-3 py-1 shadow-sm">
      <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs">
        Live: <b>{data?.callsPerMin ?? 0}</b> cpm · p95 <b>{data?.p95 ?? 0}ms</b> · err <b>{(data?.errorRate ?? 0).toFixed(1)}%</b>
      </span>
    </div>
  );
}
