import { MarketDetailClient } from "./market-detail-client";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ es?: string }>;
};

function firstQuery(v: string | string[] | undefined): string | null {
  if (v == null) return null;
  return typeof v === "string" ? v : v[0] ?? null;
}

export default async function MarketPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;
  return <MarketDetailClient marketId={id} initialEventSlug={firstQuery(sp.es)} />;
}
