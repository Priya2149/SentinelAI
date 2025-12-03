// src/app/(dashboard)/api/notifications/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type NotificationItem = {
  id: string;
  kind: "FAIL" | "FLAGGED";
  title: string;
  subtitle: string;
  createdAt: string;
  href: string;
};

export async function GET() {
  const { prisma } = await import("@/lib/prisma");

  // last 24 hours
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const rows = await prisma.modelCall.findMany({
    where: {
      createdAt: { gte: since },
      status: { in: ["FAIL", "FLAGGED"] },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      status: true,
      model: true,
      createdAt: true,
      user: { select: { email: true } },
    },
  });

  const items: NotificationItem[] = rows.map((r) => ({
    id: r.id,
    kind: r.status === "FAIL" ? "FAIL" : "FLAGGED",
    title:
      r.status === "FAIL"
        ? `Call failed on ${r.model}`
        : `Flagged content on ${r.model}`,
    subtitle: r.user?.email ? `User: ${r.user.email}` : "",
    createdAt: r.createdAt.toISOString(),
    // 👇 IMPORTANT: logs URL, no "(dashboard)" in the path
    href: `/logs?id=${r.id}`,
  }));

  return NextResponse.json(items, {
    headers: { "cache-control": "no-store" },
  });
}
