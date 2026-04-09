import { NextRequest, NextResponse } from "next/server";
import { gammaGet } from "@/lib/polymarket/server-fetch";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = searchParams.get("limit") ?? "50";
  const offset = searchParams.get("offset") ?? "0";
  try {
    const data = await gammaGet("/events", {
      active: true,
      closed: false,
      limit: Number(limit),
      offset: Number(offset),
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
