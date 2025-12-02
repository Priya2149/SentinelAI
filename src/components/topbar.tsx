"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import NotificationsBell from "./NotificationsBell";
import { SidebarMobile } from "./sidebar";
import { FeedbackModal } from "./FeedbackModal";

/** If you have next-auth, you can wire real user info here.
 *  For now, this is a simple hook with optional overrides. */
function useCurrentUser() {
  // TODO: replace with next-auth's useSession() if you have it
  const [user] = useState<{
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }>({
    // try to read demo values that you might set somewhere else
    name:
      (typeof window !== "undefined" && localStorage.getItem("user.name")) ||
      null,
    email:
      (typeof window !== "undefined" && localStorage.getItem("user.email")) ||
      "user@example.com",
    image:
      (typeof window !== "undefined" && localStorage.getItem("user.image")) ||
      null,
  });
  return user;
}

function initialsFrom(name?: string | null, email?: string | null) {
  const n = (name ?? "").trim();
  if (n) {
    const parts = n.split(" ").filter(Boolean);
    const a = parts[0]?.[0];
    const b = parts.length > 1 ? parts[parts.length - 1][0] : "";
    return (a + (b || "")).toUpperCase();
  }
  const e = (email ?? "").trim();
  if (e) return e[0].toUpperCase();
  return "U";
}

export function Topbar() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
   const [feedbackOpen, setFeedbackOpen] = useState(false);
  const FEEDBACK_FORM_URL =
    "https://docs.google.com/forms/d/e/1FAIpQLSekxYrjOMkZhLxzX0l9XRt3MCLsmHkjdau5SCEwA1opVBllzA/viewform?usp=header";

  useEffect(() => setMounted(true), []);
  const isDark = theme === "dark";

  const user = useCurrentUser();
  const initials = useMemo(
    () => initialsFrom(user.name, user.email),
    [user.name, user.email]
  );

  return (
    <>
      <header
        className="
          sticky top-0 z-40 h-16
          bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl 
          border-b border-slate-200/50 dark:border-slate-700/50
          supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-slate-900/70
        "
        role="banner"
      >
        <div className="relative mx-auto flex h-16 items-center gap-3 px-3 sm:gap-4 sm:px-6">
          {/* Mobile menu */}
          <button
            type="button"
            aria-label="Open menu"
            className="md:hidden h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* Notifications */}
            <NotificationsBell />

            {/* Theme toggle */}
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => mounted && setTheme(isDark ? "light" : "dark")}
              className="h-10 w-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm"
            >
              {mounted && (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />)}
            </button>

            {/* Account avatar (restored) */}
            <div className="relative">
              <button
                type="button"
                aria-label="Account menu"
                onClick={() => setAvatarOpen((v) => !v)}
                className="h-10 w-10 rounded-full border border-slate-200/60 dark:border-slate-700/60 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden shadow-sm hover:brightness-105 transition"
              >
                {user.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.image}
                    alt={user.name ?? user.email ?? "Account"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {initials}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {avatarOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="text-sm font-semibold">
                      {user.name || "Account"}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {user.email}
                    </div>
                  </div>
                  <ul className="py-1 text-sm">
                    <li>
                      <Link
                        href="/(dashboard)/settings/profile"
                        className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        onClick={() => setAvatarOpen(false)}
                      >
                        Profile
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/(dashboard)/settings"
                        className="block px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        onClick={() => setAvatarOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                    <li className="border-t border-slate-200 dark:border-slate-700 mt-1">
                      <form
                        action="/api/auth/signout"
                        method="POST"
                        onSubmit={() => setAvatarOpen(false)}
                      >
                        <button
                          type="submit"
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        >
                          Sign out
                        </button>
                      </form>
                    </li>
                  </ul>
                </div>
              )}
            </div>

              {/* Feedback */}
  <button
    type="button"
    onClick={() => setFeedbackOpen(true)}
    className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium bg-white/70 dark:bg-slate-900/70 hover:bg-white dark:hover:bg-slate-800 transition-colors"
  >
    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
    <span>Give Feedback</span>
  </button>
          </div>
        </div>
      </header>
          {/* Feedback modal */}
      <FeedbackModal
        open={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        formUrl={FEEDBACK_FORM_URL}
      />

      <SidebarMobile open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
