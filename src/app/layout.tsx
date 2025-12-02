import "@/app/globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { Providers } from "@/components/Providers";

import { Topbar } from "@/components/topbar";
import Sidebar from "@/components/sidebar";

export const metadata: Metadata = {
  title: { 
    default: process.env.NEXT_PUBLIC_APP_NAME ?? "SentinelAI", 
    template: "%s • SentinelAI" 
  },
  description: "Advanced AI Governance Dashboard - Monitor, analyze, and ensure the safety of your AI systems",
  keywords: ["AI", "Governance", "Dashboard", "Monitoring", "Safety", "Analytics"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-foreground antialiased overflow-x-hidden">
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.15)_1px,transparent_0)] [background-size:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.15)_1px,transparent_0)]" />
        
        {/* Gradient Overlays */}
        <div className="fixed inset-0 bg-gradient-to-r from-blue-50/20 via-transparent to-purple-50/20 dark:from-blue-950/10 dark:via-transparent dark:to-purple-950/10" />
        <div className="fixed inset-0 bg-gradient-to-t from-slate-50/50 via-transparent to-transparent dark:from-slate-950/50" />

        <Providers>
          <div className="relative z-10 flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />
            
            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0">
              <Topbar />
              
{/* Page content */}
<main className="flex-1 relative">
  {/* Content background */}
  <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-slate-50/40 dark:from-slate-900/40 dark:via-slate-800/20 dark:to-slate-900/40" />

  {/* Let the whole page scroll, not an inner div */}
  <div className="relative z-10">
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {children}
      </div>
    </div>
  </div>
</main>


            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}