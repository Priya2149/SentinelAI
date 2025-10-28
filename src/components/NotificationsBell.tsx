"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, FlagTriangleRight, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

type Item = {
  id: string;
  kind: "FAIL" | "FLAGGED";
  title: string;
  subtitle: string;
  createdAt: string | Date;
  href: string;
};

const POLL_MS = 20_000;
const STORAGE_KEY = "sentinel.unread.dismissed.v1";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState<Record<string, true>>({});
  const timer = useRef<number | null>(null);

  // load dismissed ids from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDismissed(JSON.parse(raw));
    } catch {}
  }, []);

  // fetch + poll
  async function fetchData(signal?: AbortSignal) {
    setLoading((v) => (items.length === 0 ? true : v));
    try {
      const r = await fetch("/api/notifications", { cache: "no-store", signal });
      const data: Item[] = await r.json();
      setItems(data ?? []);
    } catch {
      // ignore – keep previous
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const ctrl = new AbortController();
    fetchData(ctrl.signal);
    timer.current = window.setInterval(() => fetchData(ctrl.signal), POLL_MS) as unknown as number;
    return () => {
      ctrl.abort();
      if (timer.current) window.clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unread = useMemo(
    () => items.filter((i) => !dismissed[i.id]),
    [items, dismissed]
  );

  function markAllRead() {
    const next: Record<string, true> = { ...dismissed };
    for (const i of items) next[i.id] = true;
    setDismissed(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  function markOne(id: string) {
    const next = { ...dismissed, [id]: true as const };
    setDismissed(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        className="relative h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <Bell className="h-4 w-4" />
        {unread.length > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
            {unread.length > 99 ? "99+" : unread.length}
          </div>
        )}
      </button>

      {/* dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-96 max-w-[92vw] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
            <div className="text-sm font-semibold">Notifications</div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                title="Mark all as read"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Read all
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6 flex items-center justify-center text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No alerts in the last 24h.</div>
          ) : (
            <ul className="max-h-[60vh] overflow-auto divide-y divide-slate-200 dark:divide-slate-800">
              {items.map((n) => (
                <li key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <Link
                    href={n.href}
                    className="flex items-start gap-3"
                    onClick={() => markOne(n.id)}
                  >
                    <StatusIcon kind={n.kind} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium truncate">
                          {n.title}
                        </div>
                        <time className="text-[11px] text-slate-500 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleString()}
                        </time>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400 truncate">
                        {n.subtitle}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="px-3 py-2 border-t border-slate-200 dark:border-slate-700 text-right text-xs">
            <Link href="/(dashboard)/logs" className="underline underline-offset-2">
              View all logs →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusIcon({ kind }: { kind: "FAIL" | "FLAGGED" }) {
  if (kind === "FAIL")
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
        <XCircle className="h-4 w-4" />
      </span>
    );
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
      <FlagTriangleRight className="h-4 w-4" />
    </span>
  );
}
