import { NextResponse } from "next/server";



export const runtime = "nodejs";
export const revalidate = 0; 

export const dynamic = "force-dynamic";


export const maxDuration = 20;

export async function GET(req: Request) {
  const { prisma } = await import("@/lib/prisma");
  try {
    const { searchParams } = new URL(req.url);
    const takeParam = searchParams.get("take");
    const skipParam = searchParams.get("skip");

    const take = Math.min(Number.isFinite(+takeParam!) ? parseInt(takeParam!, 10) : 50, 200);
    const skip = Number.isFinite(+skipParam!) ? parseInt(skipParam!, 10) : 0;

    const rows = await prisma.modelCall.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });

    return NextResponse.json(rows);
  } catch (err) {
    console.error("/api/logs GET failed:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
