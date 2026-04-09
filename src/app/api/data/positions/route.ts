import { NextRequest, NextResponse } from "next/server";
import { dataGet } from "@/lib/polymarket/server-fetch";

export async function GET(req: NextRequest) {
  const user = req.nextUrl.searchParams.get("user");
  if (!user) {
    return NextResponse.json({ error: "user (wallet address) required" }, { status: 400 });
  }
  const limit = req.nextUrl.searchParams.get("limit") ?? "50";
  const sortBy = req.nextUrl.searchParams.get("sortBy") ?? "CURRENT";
  const sortDirection = req.nextUrl.searchParams.get("sortDirection") ?? "DESC";
  try {
    const data = await dataGet("/positions", {
      user,
      limit: Number(limit),
      offset: 0,
      sortBy,
      sortDirection,
    });
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    // Some Data API deployments can reject specific sort enums; fallback to default server sorting.
    if (msg.includes("Invalid position sortBy")) {
      try {
        const fallback = await dataGet("/positions", {
          user,
          limit: Number(limit),
          offset: 0,
        });
        return NextResponse.json(fallback);
      } catch (e2) {
        const msg2 = e2 instanceof Error ? e2.message : "Unknown error";
        return NextResponse.json({ error: msg2 }, { status: 502 });
      }
    }
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
