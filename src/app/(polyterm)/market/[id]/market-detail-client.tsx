"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { polymarketEventUrl } from "@/lib/polymarket/urls";
import {
  buildMarketSummary,
  generateSimpleBacktestSignal,
  inferWinningOutcomeIndex,
  kellyFractionYes,
  parseTokenIds,
  pickResolutionEndDate,
  profitIfOutcomeWins,
} from "@/lib/polymarket/agent-advice";

function normalizeConditionId(cid: unknown): string | null {
  if (typeof cid !== "string") return null;
  let s = cid.trim();
  if (!s) return null;
  if (!s.startsWith("0x") && /^[a-fA-F0-9]{64}$/i.test(s)) s = `0x${s}`;
  return /^0x[a-fA-F0-9]{64}$/.test(s) ? s : null;
}

function pickEventSlug(m: Record<string, unknown>, fromQuery: string | null): string | null {
  if (fromQuery?.trim()) return fromQuery.trim();
  const evs = m.events;
  if (Array.isArray(evs) && evs[0] && typeof evs[0] === "object") {
    const slug = (evs[0] as Record<string, unknown>).slug;
    if (slug) return String(slug);
  }
  const es = m.eventSlug;
  if (typeof es === "string" && es.trim()) return es.trim();
  return null;
}

type MetaHolder = {
  token?: string;
  holders?: Array<{
    proxyWallet?: string;
    pseudonym?: string;
    name?: string;
    amount?: number;
    outcomeIndex?: number;
  }>;
};

type PricePoint = { t: number; p: number };

export function MarketDetailClient({
  marketId,
  initialEventSlug,
}: {
  marketId: string;
  initialEventSlug: string | null;
}) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [market, setMarket] = useState<Record<string, unknown> | null>(null);
  const [holders, setHolders] = useState<MetaHolder[] | null>(null);
  const [holdersErr, setHoldersErr] = useState<string | null>(null);

  const [bankroll, setBankroll] = useState(100);
  const [edgeYes, setEdgeYes] = useState("");
  const [targetDate, setTargetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [history, setHistory] = useState<PricePoint[]>([]);
  const [historyErr, setHistoryErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    setHoldersErr(null);
    try {
      const res = await fetch(`/api/gamma/markets/${encodeURIComponent(marketId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
      const m = data as Record<string, unknown>;
      setMarket(m);

      const conditionId = normalizeConditionId(m.conditionId ?? m["condition_id"]);
      if (conditionId) {
        const hr = await fetch(`/api/data/holders?market=${encodeURIComponent(conditionId)}&limit=20`);
        const hd = await hr.json();
        if (!hr.ok) throw new Error((hd as { error?: string }).error ?? hr.statusText);
        setHolders(Array.isArray(hd) ? (hd as MetaHolder[]) : []);
      } else {
        setHolders([]);
        setHoldersErr("No condition id — whale list unavailable for this market.");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load market");
      setMarket(null);
      setHolders(null);
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  useEffect(() => {
    void load();
  }, [load]);

  const eventSlug = useMemo(() => (market ? pickEventSlug(market, initialEventSlug) : null), [market, initialEventSlug]);

  const summary = useMemo(() => (market ? buildMarketSummary(market) : null), [market]);
  const tokenIds = useMemo(() => parseTokenIds(market?.clobTokenIds), [market]);
  const yesToken = summary ? tokenIds[summary.yesIndex] ?? tokenIds[0] ?? null : null;

  const resolutionEnd = useMemo(() => (market ? pickResolutionEndDate(market) : null), [market]);
  const resolutionLabel = useMemo(() => {
    if (!resolutionEnd) return null;
    const d = new Date(resolutionEnd);
    if (Number.isNaN(d.getTime())) return resolutionEnd;
    return d.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
      timeZoneName: "short",
    });
  }, [resolutionEnd]);

  const edgeN = parseFloat(edgeYes);
  const hasEdge = Number.isFinite(edgeN) && edgeN > 0 && edgeN < 1;
  const kelly =
    hasEdge && summary?.marketYesPrice != null
      ? kellyFractionYes(edgeN, summary.marketYesPrice)
      : 0;
  const stakeUsd = hasEdge && summary?.marketYesPrice != null ? kelly * bankroll : 0;

  const question = market ? String(market.question ?? market.title ?? "Market") : "";

  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  async function copyAddr(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedWallet(addr);
      window.setTimeout(() => setCopiedWallet(null), 2000);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function loadHistory() {
      if (!yesToken || !targetDate) {
        setHistory([]);
        return;
      }
      setHistoryErr(null);
      try {
        const d = new Date(`${targetDate}T00:00:00Z`);
        if (Number.isNaN(d.getTime())) throw new Error("Invalid date");
        const endTs = Math.floor(d.getTime() / 1000);
        const startTs = endTs - 5 * 24 * 60 * 60;
        const res = await fetch(
          `/api/clob/prices-history?market=${encodeURIComponent(yesToken)}&startTs=${startTs}&endTs=${endTs}&interval=1d`
        );
        const data = await res.json();
        if (!res.ok) throw new Error((data as { error?: string }).error ?? res.statusText);
        const raw = (data as { history?: unknown[] }).history;
        const rows = Array.isArray(raw)
          ? raw
              .map((x) => {
                const o = x as { t?: unknown; p?: unknown };
                const t = typeof o.t === "number" ? o.t : Number(o.t ?? NaN);
                const p = typeof o.p === "number" ? o.p : Number(o.p ?? NaN);
                return { t, p };
              })
              .filter((x) => Number.isFinite(x.t) && Number.isFinite(x.p))
              .sort((a, b) => a.t - b.t)
          : [];
        if (!cancelled) setHistory(rows);
      } catch (e) {
        if (!cancelled) {
          setHistory([]);
          setHistoryErr(e instanceof Error ? e.message : "History fetch failed");
        }
      }
    }
    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, [yesToken, targetDate]);

  const backtest = useMemo(() => {
    if (!summary) return null;
    const entry = history.at(-1)?.p ?? null;
    if (entry == null || entry <= 0 || entry >= 1) return null;
    const btSummary = {
      ...summary,
      marketYesPrice: entry,
      prices: summary.prices.map((p, i) => (i === summary.yesIndex ? entry : p)),
    };
    return generateSimpleBacktestSignal(btSummary, bankroll);
  }, [summary, history, bankroll]);

  const winnerIndex = useMemo(() => (summary ? inferWinningOutcomeIndex(summary) : null), [summary]);
  const realized = useMemo(() => {
    if (!summary || !backtest || winnerIndex == null) return null;
    const won = backtest.sideIndex === winnerIndex;
    const pnl = won ? backtest.expectedProfitIfWin : -bankroll;
    return { won, pnl };
  }, [summary, backtest, winnerIndex, bankroll]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-2 p-2">
        <p className="font-data text-[11px] text-muted-foreground">Loading market…</p>
      </div>
    );
  }

  if (err || !market) {
    return (
      <div className="mx-auto max-w-6xl space-y-2 p-2">
        <p className="font-data text-[11px] text-terminal-down">{err ?? "Not found"}</p>
        <Link href="/" className="font-data text-[11px] text-primary underline-offset-2 hover:underline">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/" className="font-data text-[11px] text-muted-foreground underline-offset-2 hover:underline">
          ← Terminal
        </Link>
        {eventSlug && (
          <a
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 border-primary/40 font-data text-[11px] text-primary hover:bg-primary/10"
            )}
            href={polymarketEventUrl(eventSlug)}
            target="_blank"
            rel="noreferrer"
          >
            OPEN ON POLYMARKET
          </a>
        )}
      </div>

      <div className="terminal-panel">
        <div className="terminal-panel-header flex items-center justify-between gap-2">
          <span>Forecast</span>
          <span className="font-data text-[10px] font-normal normal-case text-muted-foreground">
            gamma /markets/{marketId}
          </span>
        </div>
        <div className="border-b border-border px-2 py-2">
          <h1 className="font-data text-sm font-semibold uppercase tracking-wide text-foreground">{question}</h1>
          {resolutionLabel && (
            <p className="mt-2 font-data text-[11px] text-foreground/90">
              <span className="text-primary">Resolves (scheduled):</span> {resolutionLabel}
            </p>
          )}
          {!resolutionLabel && (
            <p className="mt-2 font-data text-[10px] text-muted-foreground">
              No end date in API — check the event on Polymarket for the official resolution rules.
            </p>
          )}
        </div>
      </div>

      <div className="grid gap-2 lg:grid-cols-2">
        <div className="terminal-panel space-y-2 p-2">
          <div className="terminal-panel-header">Agent (educational)</div>
          <p className="font-data text-[10px] leading-relaxed text-muted-foreground">
            Not financial advice. Prices are what traders pay today, not forecasts. Polymarket resolves each market by its
            published rules; the date below is from the API when available.
          </p>
          {summary && (
            <div className="space-y-2 font-data text-[11px]">
              <div className="rounded border border-primary/25 bg-primary/5 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">What the prices mean</p>
                <p className="mt-1 text-foreground/95">{summary.headline}</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {summary.lines.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
              {summary.favoritePrice != null && (
                <div className="rounded border border-border bg-secondary/30 p-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                    Crowd favorite (highest implied %)
                  </p>
                  <p className="mt-1 text-foreground/95">
                    <span className="text-terminal-up">{summary.favoriteLabel}</span> at ~
                    {(summary.favoritePrice * 100).toFixed(2)}¢ per $1 payout if that outcome wins.
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    That only means this outcome is the most expensive (highest implied probability)—not that you should
                    buy it.
                  </p>
                </div>
              )}
              <div className="rounded border border-border bg-secondary/30 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                  If you stake ${bankroll.toFixed(0)} at today&apos;s prices (illustrative)
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  If your side loses, you lose the full stake. If it wins, you receive $1 per share; profit = payout −
                  stake.
                </p>
                <ul className="mt-2 space-y-1.5 text-[11px]">
                  {summary.outcomes.map((label, i) => {
                    const p = summary.prices[i];
                    if (p == null || Number.isNaN(p) || p <= 0 || p >= 1) return null;
                    const profit = profitIfOutcomeWins(bankroll, p);
                    return (
                      <li key={i} className="border-b border-border/60 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-foreground/90">{label}:</span>{" "}
                        <span className="tabular-nums text-terminal-up">
                          +${profit.toFixed(2)} profit
                        </span>{" "}
                        if <span className="text-foreground/90">{label}</span> wins (after ${bankroll.toFixed(0)} stake).
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="br" className="font-data text-[10px] uppercase text-primary">
                Bankroll ($)
              </Label>
              <Input
                id="br"
                type="number"
                min={1}
                value={bankroll}
                onChange={(e) => setBankroll(Number(e.target.value) || 0)}
                className="h-7 border-border bg-secondary/40 font-data text-[11px]"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edge" className="font-data text-[10px] uppercase text-primary">
                Your P({summary?.yesLabel ?? "YES"}) (optional, 0–1)
              </Label>
              <Input
                id="edge"
                placeholder="e.g. 0.42 — only for Kelly sizing"
                value={edgeYes}
                onChange={(e) => setEdgeYes(e.target.value)}
                className="h-7 border-border bg-secondary/40 font-data text-[11px]"
              />
            </div>
          </div>
          <div className="rounded border border-border bg-secondary/30 p-2 font-data text-[11px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              Optional: Kelly-sized bet on “{summary?.yesLabel ?? "YES"}”
            </p>
            {!hasEdge || summary?.marketYesPrice == null ? (
              <p className="mt-1 text-muted-foreground">
                Enter <span className="text-foreground/90">your own</span> probability that{" "}
                <span className="text-foreground/90">{summary?.yesLabel ?? "YES"}</span> wins. If it is higher than that
                outcome&apos;s price, we show a capped-Kelly stake on that side only (still educational).
              </p>
            ) : kelly <= 0 ? (
              <p className="mt-1 text-muted-foreground">
                Your P({summary.yesLabel}) is not above the current price — this rule would not add a position on{" "}
                {summary.yesLabel} at these odds.
              </p>
            ) : (
              <>
                <p className="mt-1 text-foreground/95">
                  On <span className="text-foreground">{summary.yesLabel}</span> only: stake{" "}
                  <span className="text-terminal-up tabular-nums">${stakeUsd.toFixed(2)}</span> of your ${bankroll.toFixed(0)}{" "}
                  bankroll (capped Kelly 25%).
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  If {summary.yesLabel} wins: illustrative profit on that stake ≈ $
                  {profitIfOutcomeWins(stakeUsd, summary.marketYesPrice).toFixed(2)} (before fees).
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Price used for {summary.yesLabel}: {summary.marketYesPrice.toFixed(4)}.
                </p>
              </>
            )}
          </div>

          <div className="rounded border border-border bg-secondary/30 p-2 font-data text-[11px]">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
              Backtest (5 days before target date)
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="btdate" className="font-data text-[10px] uppercase text-primary">
                  Target date (UTC)
                </Label>
                <Input
                  id="btdate"
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="h-7 border-border bg-secondary/40 font-data text-[11px]"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-data text-[10px] uppercase text-primary">Window</Label>
                <p className="rounded border border-border bg-background px-2 py-1.5 text-[10px] text-muted-foreground">
                  Previous 5 days up to selected date
                </p>
              </div>
            </div>
            {historyErr && <p className="mt-2 text-[10px] text-terminal-down">{historyErr}</p>}
            {!historyErr && !yesToken && (
              <p className="mt-2 text-[10px] text-muted-foreground">No CLOB token id for this market.</p>
            )}
            {!historyErr && yesToken && history.length === 0 && (
              <p className="mt-2 text-[10px] text-muted-foreground">No historical points in that window.</p>
            )}
            {!historyErr && backtest && (
              <div className="mt-2 space-y-1">
                <p className="text-foreground/95">
                  On {targetDate}, model signal:{" "}
                  <span className="text-terminal-up">
                    BUY {backtest.side}
                  </span>{" "}
                  at {Math.round(backtest.entryPrice * 100)}¢.
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {backtest.rationale}
                </p>
                <p className="text-[10px] text-foreground/90">
                  Shares to buy with ${bankroll.toFixed(0)}:{" "}
                  <span className="tabular-nums">{backtest.shares.toFixed(2)}</span>. Max profit if correct:{" "}
                  <span className="tabular-nums text-terminal-up">+${backtest.expectedProfitIfWin.toFixed(2)}</span>.
                </p>
                {winnerIndex != null ? (
                  <p className="text-[10px] text-foreground/90">
                    Actual resolved outcome:{" "}
                    <span className="text-primary">{summary?.outcomes[winnerIndex] ?? `#${winnerIndex}`}</span>.{" "}
                    Backtest result:{" "}
                    <span className={realized?.won ? "text-terminal-up" : "text-terminal-down"}>
                      {realized?.won ? "WIN" : "LOSS"}
                    </span>{" "}
                    ({realized ? `${realized.pnl >= 0 ? "+" : ""}$${realized.pnl.toFixed(2)}` : "n/a"}).
                  </p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    Outcome not fully resolved yet, so realized P/L cannot be confirmed.
                  </p>
                )}
                <p className="text-[10px] text-muted-foreground">
                  Redeem timing: after market is officially resolved and redemption is enabled on Polymarket (usually shortly
                  after oracle finalization).
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="terminal-panel overflow-hidden">
          <div className="terminal-panel-header">Whales (top holders)</div>
          {holdersErr && (
            <p className="p-2 font-data text-[10px] text-muted-foreground">{holdersErr}</p>
          )}
          {!holdersErr && holders && holders.length === 0 && (
            <p className="p-2 font-data text-[10px] text-muted-foreground">No holder data returned.</p>
          )}
          {holders && holders.some((h) => (h.holders?.length ?? 0) > 0) && (
            <Table className="text-[11px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-7 font-data text-[10px] uppercase text-primary">Wallet / name</TableHead>
                  <TableHead className="h-7 font-data text-[10px] uppercase text-primary">Side</TableHead>
                  <TableHead className="h-7 text-right font-data text-[10px] uppercase text-primary">Size</TableHead>
                  <TableHead className="h-7 w-[140px] font-data text-[10px] uppercase text-primary">Copy trade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holders.flatMap((group, gi) =>
                  (group.holders ?? []).map((h, hi) => {
                    const idx = h.outcomeIndex;
                    const sideLabel =
                      summary && typeof idx === "number" && idx >= 0 && idx < summary.outcomes.length
                        ? summary.outcomes[idx]
                        : typeof idx === "number"
                          ? `#${idx}`
                          : "—";
                    const w = h.proxyWallet;
                    return (
                      <TableRow key={`${gi}-${hi}-${w ?? hi}`} className="border-border hover:bg-accent/40">
                        <TableCell className="max-w-[12rem] py-1 font-data text-[10px]">
                          <span className="text-foreground/90">{h.pseudonym ?? h.name ?? "—"}</span>
                          {w && (
                            <span className="mt-0.5 block truncate text-[9px] text-muted-foreground" title={w}>
                              {w}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1 font-data text-[10px] text-foreground/85">{sideLabel}</TableCell>
                        <TableCell className="py-1 text-right font-data tabular-nums text-terminal-up">
                          {typeof h.amount === "number" ? h.amount.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex flex-wrap gap-1">
                            {eventSlug && (
                              <a
                                href={polymarketEventUrl(eventSlug)}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "sm" }),
                                  "h-6 px-1.5 font-data text-[9px] text-primary"
                                )}
                              >
                                Trade
                              </a>
                            )}
                            {w && (
                              <button
                                type="button"
                                onClick={() => void copyAddr(w)}
                                className={cn(
                                  buttonVariants({ variant: "outline", size: "sm" }),
                                  "h-6 px-1.5 font-data text-[9px]"
                                )}
                              >
                                {copiedWallet === w ? "Copied" : "Copy addr"}
                              </button>
                            )}
                            {w && (
                              <a
                                href={`https://polymarket.com/profile/${w}`}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                  buttonVariants({ variant: "ghost", size: "sm" }),
                                  "h-6 px-1 font-data text-[9px] text-muted-foreground"
                                )}
                              >
                                Profile
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
          {holders && holders.some((h) => (h.holders?.length ?? 0) > 0) && (
            <p className="border-t border-border p-2 font-data text-[9px] leading-snug text-muted-foreground">
              <span className="text-foreground/80">Copy trade:</span> opens this market on Polymarket so you can trade
              manually; it does not copy their position or size. Use <span className="text-foreground/80">Side</span> to
              see which outcome they hold. <span className="text-foreground/80">Copy addr</span> copies their wallet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
