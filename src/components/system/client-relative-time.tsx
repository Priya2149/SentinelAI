"use client";

import { useEffect, useMemo, useState } from "react";

type ClientRelativeTimeProps = {
  date: Date | string;
  fallback?: string;
};

function formatRelativeTime(date: Date | string) {
  const timestamp = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.max(
    0,
    Math.floor((Date.now() - timestamp.getTime()) / 1000)
  );

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function ClientRelativeTime({
  date,
  fallback = "Just now",
}: ClientRelativeTimeProps) {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    setMounted(true);

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const label = useMemo(() => {
    if (!mounted) return fallback;

    // Recompute when interval updates.
    void now;
    return formatRelativeTime(date);
  }, [date, fallback, mounted, now]);

  return <span suppressHydrationWarning>{label}</span>;
}