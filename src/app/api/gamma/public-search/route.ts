import { NextRequest, NextResponse } from "next/server";
import { GAMMA_BASE } from "@/lib/polymarket/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ error: "Missing q" }, { status: 400 });
  }
  const limitPerType = searchParams.get("limit_per_type") ?? "25";
  try {
    const url = new URL(`${GAMMA_BASE}/public-search`);
    url.searchParams.set("q", q);
    url.searchParams.set("limit_per_type", limitPerType);
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: await res.text() }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
