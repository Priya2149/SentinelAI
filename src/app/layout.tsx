import type { ReactNode } from "react";
import { Topbar } from "@/components/topbar";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />

        <main className="relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-slate-50/40 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/40" />

          <div className="relative z-10">
            <div className="min-h-screen p-4 md:p-6 lg:p-8">
              <div className="mx-auto max-w-7xl">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}