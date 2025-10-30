import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  // Block in production / on Vercel
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed in production" }, { status: 405 });
  }

  const cmd = `npx prisma db seed`;
  const cwd = path.resolve(process.cwd());

  await new Promise<void>((res, rej) =>
    exec(cmd, { cwd }, (e) => (e ? rej(e) : res()))
  );

  return NextResponse.json({ ok: true });
}
