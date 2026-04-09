import { NextRequest, NextResponse } from "next/server";
import { clobGet } from "@/lib/polymarket/server-fetch";

export async function GET(req: NextRequest) {
  const market = req.nextUrl.searchParams.get("market");
  if (!market) {
    return NextResponse.json({ error: "market required (token id)" }, { status: 400 });
  }

  const startTs = req.nextUrl.searchParams.get("startTs");
  const endTs = req.nextUrl.searchParams.get("endTs");
  const interval = req.nextUrl.searchParams.get("interval") ?? "1d";
  const fidelity = req.nextUrl.searchParams.get("fidelity");

  try {
    const data = await clobGet("/prices-history", {
      market,
      ...(startTs ? { startTs: Number(startTs) } : {}),
      ...(endTs ? { endTs: Number(endTs) } : {}),
      ...(interval ? { interval } : {}),
      ...(fidelity ? { fidelity: Number(fidelity) } : {}),
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

