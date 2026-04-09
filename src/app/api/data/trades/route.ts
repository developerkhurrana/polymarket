import { NextRequest, NextResponse } from "next/server";
import { dataGet } from "@/lib/polymarket/server-fetch";

/** Proxies Data API GET /trades — optional market (condition id) or eventId. */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const market = searchParams.get("market");
  const eventId = searchParams.get("eventId");
  if (!market?.trim() && !eventId?.trim()) {
    return NextResponse.json({ error: "market or eventId required" }, { status: 400 });
  }
  const limit = searchParams.get("limit") ?? "50";
  try {
    const data = await dataGet("/trades", {
      ...(market ? { market } : {}),
      ...(eventId ? { eventId } : {}),
      limit: Math.min(Number(limit) || 50, 200),
      offset: Number(searchParams.get("offset") ?? "0") || 0,
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
