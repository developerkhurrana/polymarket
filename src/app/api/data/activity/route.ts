import { NextRequest, NextResponse } from "next/server";
import { dataGet } from "@/lib/polymarket/server-fetch";

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  if (!user) {
    return NextResponse.json({ error: "user required" }, { status: 400 });
  }
  const limit = req.nextUrl.searchParams.get("limit") ?? "50";
  try {
    const data = await dataGet("/activity", {
      user,
      limit: Number(limit),
      offset: 0,
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
