/** Polymarket web URLs. Event pages use the parent event slug, not per-outcome market slugs. */
export function polymarketEventUrl(eventSlug: string): string {
  const s = eventSlug.trim();
  if (!s) return "https://polymarket.com";
  return `https://polymarket.com/event/${encodeURIComponent(s)}`;
}
