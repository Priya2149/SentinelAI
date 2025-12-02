"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

type LiveFeedHeaderProps = {
  entriesLabel: string;            // e.g. "(68 entries, last 24h)"
  lastUpdated: Date | string;
};

function formatRelativeTime(d: Date | string): string {
  const now = new Date();
  const date = new Date(d);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LiveFeedHeader({
  entriesLabel,
  lastUpdated,
}: LiveFeedHeaderProps) {
  const router = useRouter();
  const [autoRefresh, setAutoRefresh] = useState(false);

  // poll the page when auto-refresh is ON
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      router.refresh();
    }, 10000); // 10s
    return () => clearInterval(id);
  }, [autoRefresh, router]);

  const lastUpdatedLabel = useMemo(
    () => formatRelativeTime(lastUpdated),
    [lastUpdated]
  );

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-sm font-medium">Live Feed</span>
        <span className="text-muted-foreground">{entriesLabel}</span>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>Auto-refresh</span>
          <Switch
            checked={autoRefresh}
            onCheckedChange={setAutoRefresh}
            className="scale-75 origin-right"
          />
        </div>
        <div className="h-1 w-1 bg-gray-400 rounded-full" />
        <span>Last updated: {lastUpdatedLabel}</span>
      </div>
    </div>
  );
}
