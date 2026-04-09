import { NextRequest, NextResponse } from "next/server";
import { gammaGet } from "@/lib/polymarket/server-fetch";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const data = await gammaGet(`/markets/${encodeURIComponent(id)}`);
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
