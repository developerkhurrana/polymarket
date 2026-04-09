import { NextRequest, NextResponse } from "next/server";
import { clobGet } from "@/lib/polymarket/server-fetch";

export async function GET(req: NextRequest) {
  const token_id = req.nextUrl.searchParams.get("token_id");
  if (!token_id) {
    return NextResponse.json({ error: "token_id required" }, { status: 400 });
  }
  try {
    const data = await clobGet("/book", { token_id });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
