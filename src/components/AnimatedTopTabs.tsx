"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, BarChart3, ListTree, FileText, SquarePlay } from "lucide-react";

type Item = { href: string; label: string; icon?: React.ElementType };

const ITEMS: Item[] = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/metrics", label: "Metrics", icon: BarChart3 },
  { href: "/logs", label: "Logs", icon: ListTree },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/playground", label: "Playground", icon: SquarePlay },
];

export default function AnimatedTopTabs() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav
      aria-label="Primary"
      className="
        relative inline-flex h-10 items-center gap-1 rounded-xl
        border border-border bg-background/60 backdrop-blur
        px-1.5 py-1 supports-[backdrop-filter]:bg-background/70
        shadow-sm
      "
    >
      {/* moving glass pill */}
      <AnimatePresence initial={false}>
        {ITEMS.map((it) =>
          isActive(it.href) ? (
            <motion.span
              key={`pill-${it.href}`}
              layoutId="active-pill"
              className="absolute left-0 top-0 h-10 rounded-xl bg-muted/70"
              style={{ zIndex: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.6 }}
              // The width + position will be inherited from the active tab button below via layoutId
            />
          ) : null
        )}
      </AnimatePresence>

      {/* tabs */}
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <motion.div
            key={href}
            layout
            className="
              relative z-10
              rounded-lg
            "
          >
            <Link
              href={href}
              className={`
                group inline-flex items-center gap-2 rounded-lg px-3 h-8
                transition
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}
              `}
            >
              {Icon ? (
                <Icon className={`h-4 w-4 ${active ? "" : "opacity-80 group-hover:opacity-100"}`} />
              ) : null}
              <span className="text-sm">{label}</span>

              {/* active underline */}
              {active && (
                <motion.span
                  layoutId="active-underline"
                  className="absolute -bottom-1 left-3 right-3 h-[2px] rounded-full
                             bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
                  transition={{ type: "spring", stiffness: 600, damping: 40 }}
                />
              )}

              {/* hover shimmer (no JS) */}
              <span
                className="
                  pointer-events-none absolute inset-0 rounded-lg opacity-0
                  group-hover:opacity-100 transition will-change-transform
                  [background:radial-gradient(40%_60%_at_30%_30%,hsl(var(--primary)/.18),transparent_60%)]
                  motion-reduce:hidden
                "
              />
            </Link>

            {/* give Framer a concrete box to animate the pill to */}
            {active && (
              <motion.span
                layoutId="active-pill"
                className="absolute inset-0 -z-10 rounded-lg bg-white/5 dark:bg-white/5 ring-1 ring-primary/15"
                transition={{ type: "spring", stiffness: 500, damping: 40, mass: 0.6 }}
              />
            )}
          </motion.div>
        );
      })}
    </nav>
  );
}
