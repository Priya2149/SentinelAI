import type { ReactNode } from "react";
import Sidebar from "@/components/sidebar";
import Topbar from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="relative z-10 flex min-h-screen">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
       <Topbar>{null}</Topbar>

        <main className="relative flex-1">
          <div className="min-h-screen p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}