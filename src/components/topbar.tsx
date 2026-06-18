import type { ReactNode } from "react";
import Topbar from "@/components/topbar";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div>
      <Topbar>{null}</Topbar>
      <main>{children}</main>
    </div>
  );
}