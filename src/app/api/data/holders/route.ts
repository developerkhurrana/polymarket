import { NextRequest, NextResponse } from "next/server";
import { dataGet } from "@/lib/polymarket/server-fetch";

/** Proxies Data API GET /holders — comma-separated condition IDs (0x…64 hex). */
export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market");
  if (!market?.trim()) {
    return NextResponse.json({ error: "market required (condition id)" }, { status: 400 });
  }
  const limit = req.nextUrl.searchParams.get("limit") ?? "20";
  try {
    const data = await dataGet("/holders", {
      market,
      limit: Math.min(Number(limit) || 20, 20),
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
