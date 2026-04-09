/**
 * Educational sizing from user-provided edge vs market price — not predictive or financial advice.
 */

export function parseGammaStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x));
  if (typeof v === "string") {
    try {
      const j = JSON.parse(v) as unknown;
      return Array.isArray(j) ? j.map((x) => String(x)) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function parseGammaNumberArray(v: unknown): number[] {
  const s = parseGammaStringArray(v);
  return s.map((x) => {
    const n = parseFloat(x);
    return Number.isFinite(n) ? n : NaN;
  });
}

/** Kelly fraction for buying YES at price q when your true prob of YES is p. Capped. */
export function kellyFractionYes(trueProbYes: number, marketYesPrice: number, maxFraction = 0.25): number {
  const p = trueProbYes;
  const q = marketYesPrice;
  if (!(p > 0 && p < 1 && q > 0 && q < 1)) return 0;
  if (p <= q) return 0;
  const f = (p - q) / (1 - q);
  return Math.max(0, Math.min(f, maxFraction));
}

export type AgentPanelState = {
  outcomes: string[];
  prices: number[];
  yesIndex: number;
  /** Label for the YES-like outcome (first matching Yes/YES or first outcome). */
  yesLabel: string;
  marketYesPrice: number | null;
  headline: string;
  lines: string[];
  /** Outcome index with highest implied probability (crowd price). */
  favoriteIndex: number;
  favoriteLabel: string;
  favoritePrice: number | null;
};

/** Profit if the outcome you bought wins (stake in USDC, price = cost per $1 payout). */
export function profitIfOutcomeWins(stakeUsd: number, price: number): number {
  if (!(price > 0 && price < 1)) return 0;
  return stakeUsd / price - stakeUsd;
}

export function buildMarketSummary(market: Record<string, unknown>): AgentPanelState {
  const outcomes = parseGammaStringArray(market.outcomes);
  const prices = parseGammaNumberArray(market.outcomePrices);
  const yesIndex = outcomes.findIndex((o) => /^(yes|y)$/i.test(o.trim()));
  const idx = yesIndex >= 0 ? yesIndex : 0;
  const yesLabel = outcomes[idx] ?? "YES";
  const marketYesPrice =
    prices[idx] != null && !Number.isNaN(prices[idx]) && prices[idx] >= 0 && prices[idx] <= 1 ? prices[idx] : null;

  let favoriteIndex = 0;
  let best = -1;
  const n = Math.min(outcomes.length, prices.length);
  for (let i = 0; i < n; i++) {
    const p = prices[i];
    if (p != null && !Number.isNaN(p) && p >= 0 && p <= 1 && p > best) {
      best = p;
      favoriteIndex = i;
    }
  }
  const fp = prices[favoriteIndex];
  const favoritePrice = fp != null && !Number.isNaN(fp) && fp >= 0 && fp <= 1 ? fp : null;
  const favoriteLabel = outcomes[favoriteIndex] ?? "—";

  const lines: string[] = [];
  if (outcomes.length && prices.length) {
    for (let i = 0; i < Math.min(outcomes.length, prices.length); i++) {
      const p = prices[i];
      if (p == null || Number.isNaN(p)) continue;
      const pct = (p * 100).toFixed(1);
      lines.push(`${outcomes[i]}: ${pct}% implied`);
    }
  } else {
    lines.push("No outcome prices in API response.");
  }

  const headline =
    marketYesPrice != null
      ? `“${yesLabel}” is priced at ~${(marketYesPrice * 100).toFixed(2)}¢ per $1 payout (implied ${(marketYesPrice * 100).toFixed(1)}%).`
      : "Implied probabilities unavailable";

  return {
    outcomes,
    prices,
    yesIndex: idx,
    yesLabel,
    marketYesPrice,
    headline,
    lines,
    favoriteIndex,
    favoriteLabel,
    favoritePrice,
  };
}

/** ISO-ish end time from Gamma market or nested events. */
export function pickResolutionEndDate(m: Record<string, unknown>): string | null {
  const direct = m.endDate ?? m.end_date;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const evs = m.events;
  if (Array.isArray(evs)) {
    for (const ev of evs) {
      if (ev && typeof ev === "object") {
        const e = ev as Record<string, unknown>;
        const ed = e.endDate ?? e.end_date;
        if (typeof ed === "string" && ed.trim()) return ed.trim();
      }
    }
  }
  return null;
}

export function parseTokenIds(v: unknown): string[] {
  return parseGammaStringArray(v).map((x) => x.trim()).filter(Boolean);
}

export function inferWinningOutcomeIndex(summary: AgentPanelState): number | null {
  let winner: number | null = null;
  for (let i = 0; i < summary.prices.length; i++) {
    const p = summary.prices[i];
    if (p == null || Number.isNaN(p)) continue;
    if (p >= 0.999) return i;
    if (winner == null || p > summary.prices[winner]) winner = i;
  }
  if (winner == null) return null;
  return summary.prices[winner] >= 0.95 ? winner : null;
}

export type BacktestSignal = {
  side: string;
  sideIndex: number;
  entryPrice: number;
  shares: number;
  expectedProfitIfWin: number;
  rationale: string;
};

/**
 * Deterministic rule-based signal for backtesting:
 * - For binary markets, buy YES when entry <= 0.48; buy NO when entry >= 0.52; else no clear edge.
 */
export function generateSimpleBacktestSignal(
  summary: AgentPanelState,
  stakeUsd: number
): BacktestSignal | null {
  if (!Number.isFinite(stakeUsd) || stakeUsd <= 0) return null;
  const n = Math.min(summary.outcomes.length, summary.prices.length);
  if (n < 2) return null;

  const yesIdx = summary.yesIndex;
  const yesPrice = summary.prices[yesIdx];
  if (yesPrice == null || Number.isNaN(yesPrice) || yesPrice <= 0 || yesPrice >= 1) return null;

  if (yesPrice <= 0.48) {
    const shares = stakeUsd / yesPrice;
    return {
      side: summary.yesLabel,
      sideIndex: yesIdx,
      entryPrice: yesPrice,
      shares,
      expectedProfitIfWin: shares - stakeUsd,
      rationale: `${summary.yesLabel} traded at ${(yesPrice * 100).toFixed(1)}%, below 48% threshold.`,
    };
  }

  const noIdx = summary.outcomes.findIndex((o) => /^(no|n)$/i.test(o.trim()));
  const fallbackNoIdx = yesIdx === 0 ? 1 : 0;
  const chosenNoIdx = noIdx >= 0 ? noIdx : fallbackNoIdx;
  const noPrice = summary.prices[chosenNoIdx];
  if (noPrice != null && !Number.isNaN(noPrice) && noPrice > 0 && noPrice < 1 && noPrice <= 0.48) {
    const shares = stakeUsd / noPrice;
    return {
      side: summary.outcomes[chosenNoIdx] ?? "NO",
      sideIndex: chosenNoIdx,
      entryPrice: noPrice,
      shares,
      expectedProfitIfWin: shares - stakeUsd,
      rationale: `${summary.outcomes[chosenNoIdx] ?? "NO"} traded at ${(noPrice * 100).toFixed(1)}%, below 48% threshold.`,
    };
  }

  if (yesPrice >= 0.52) {
    const syntheticNo = 1 - yesPrice;
    if (syntheticNo > 0 && syntheticNo < 1) {
      const shares = stakeUsd / syntheticNo;
      return {
        side: "NO",
        sideIndex: chosenNoIdx,
        entryPrice: syntheticNo,
        shares,
        expectedProfitIfWin: shares - stakeUsd,
        rationale: `YES traded rich at ${(yesPrice * 100).toFixed(1)}%, so model buys opposite side.`,
      };
    }
  }

  return null;
}
