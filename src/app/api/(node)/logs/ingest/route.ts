import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Read the request body (even if we don't use it)
    const body = await req.json();

    console.log("[SentinelAI Demo] Received mock ingest event:", body);

    return NextResponse.json(
      {
        success: true,
        message: "Ingest endpoint running in demo mode. Payload received but not stored.",
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON" },
      { status: 400 }
    );
  }
}
