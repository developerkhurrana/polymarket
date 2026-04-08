"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { FeatureDef } from "@/lib/features/types";
import { polymarketEventUrl } from "@/lib/polymarket/urls";

type Row = {
  id: string;
  title: string;
  /** Parent event slug — use for polymarket.com/event/… */
  eventSlug: string;
  /** Per-outcome slug from Gamma (filters only; not the event URL). */
  marketSlug?: string;
  /** Lowercase blob for search (title, description, tags, slugs, etc.). */
  searchText: string;
  volume24hr: number;
  volume: number;
  endDate?: string;
};

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function tagsText(tags: unknown): string {
  if (!Array.isArray(tags)) return "";
  const parts: string[] = [];
  for (const t of tags) {
    if (!t || typeof t !== "object") continue;
    const o = t as Record<string, unknown>;
    if (o.label) parts.push(String(o.label));
    if (o.slug) parts.push(String(o.slug));
  }
  return parts.join(" ");
}

function joinSearchParts(...parts: string[]): string {
  return parts
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function flattenEvents(raw: unknown[]): Row[] {
  const rows: Row[] = [];
  for (const ev of raw) {
    if (!ev || typeof ev !== "object") continue;
    const e = ev as Record<string, unknown>;
    const evTitle = String(e.title ?? e.question ?? "Event");
    const evSlug = e.slug ? String(e.slug) : "";
    const evDesc = e.description ? String(e.description) : "";
    const evTicker = e.ticker ? String(e.ticker) : "";
    const tagStr = tagsText(e.tags);

    const markets = e.markets;
    if (Array.isArray(markets) && markets.length > 0) {
      for (const m of markets) {
        if (!m || typeof m !== "object") continue;
        const mm = m as Record<string, unknown>;
        const mslug = mm.slug ? String(mm.slug) : undefined;
        const mQ = String(mm.question ?? mm.title ?? evTitle);
        const mDesc = mm.description ? String(mm.description) : "";
        const groupTitle = mm.groupItemTitle ? String(mm.groupItemTitle) : "";
        rows.push({
          id: String(mm.id ?? mm.slug ?? evTitle),
          title: mQ,
          eventSlug: evSlug,
          marketSlug: mslug,
          searchText: joinSearchParts(
            evTitle,
            evSlug,
            evTicker,
            evDesc,
            tagStr,
            mQ,
            mslug ?? "",
            mDesc,
            groupTitle
          ),
          volume24hr: num(mm.volume24hr ?? mm.volume24Hr),
          volume: num(mm.volume),
          endDate: mm.endDate ? String(mm.endDate) : undefined,
        });
      }
    } else {
      rows.push({
        id: String(e.id ?? evTitle),
        title: evTitle,
        eventSlug: evSlug,
        marketSlug: undefined,
        searchText: joinSearchParts(evTitle, evSlug, evTicker, evDesc, tagStr),
        volume24hr: num(e.volume24hr ?? e.volume24Hr),
        volume: num(e.volume),
        endDate: e.endDate ? String(e.endDate) : undefined,
      });
    }
  }
  return rows;
}

function mergeRowsById(a: Row[], b: Row[]): Row[] {
  const map = new Map<string, Row>();
  for (const r of a) map.set(r.id, r);
  for (const r of b) if (!map.has(r.id)) map.set(r.id, r);
  return Array.from(map.values());
}

export function EventsTemplate({ feature }: { feature: FeatureDef }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [searchRows, setSearchRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [volumeBand, setVolumeBand] = useState<"all" | "1k" | "10k" | "100k">("all");
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"vol24h" | "totalVol" | "endingSoon">("vol24h");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/gamma/events?limit=80");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? res.statusText);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setRows(flattenEvents(list));
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const qq = q.trim();
    if (qq.length < 2) {
      setSearchRows([]);
      return;
    }
    let cancelled = false;
    const t = window.setTimeout(() => {
      (async () => {
        try {
          const res = await fetch(
            `/api/gamma/public-search?q=${encodeURIComponent(qq)}&limit_per_type=40`
          );
          const data = (await res.json()) as { events?: unknown[]; error?: string };
          if (!res.ok || !Array.isArray(data.events)) {
            if (!cancelled) setSearchRows([]);
            return;
          }
          if (!cancelled) setSearchRows(flattenEvents(data.events));
        } catch {
          if (!cancelled) setSearchRows([]);
        }
      })();
    }, 320);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [q]);

  const combinedRows = useMemo(() => mergeRowsById(rows, searchRows), [rows, searchRows]);

  const searchIds = useMemo(() => new Set(searchRows.map((r) => r.id)), [searchRows]);

  const filtered = useMemo(() => {
    let r = combinedRows;
    const slug = feature.slug;

    // Feature-level pre-filtering.
    if (slug === "crypto15m") {
      r = r.filter(
        (x) =>
          /15m|15-min|btc|eth|sol|xrp|crypto/i.test(x.title) ||
          (x.marketSlug?.includes("crypto") ?? false) ||
          (x.eventSlug?.includes("crypto") ?? false)
      );
    }

    if (showOnlyOpen) {
      const nowTs = Date.now();
      r = r.filter((x) => {
        if (!x.endDate) return true;
        const t = Date.parse(x.endDate);
        return Number.isFinite(t) ? t > nowTs : true;
      });
    }

    if (volumeBand !== "all") {
      const threshold = volumeBand === "1k" ? 1_000 : volumeBand === "10k" ? 10_000 : 100_000;
      r = r.filter((x) => x.volume24hr >= threshold);
    }

    if (q.trim()) {
      const qq = q.toLowerCase();
      r = r.filter((x) => x.searchText.includes(qq) || searchIds.has(x.id));
    }

    if (sortBy === "totalVol") {
      r = [...r].sort((a, b) => b.volume - a.volume);
    } else if (sortBy === "endingSoon") {
      r = [...r].sort((a, b) => {
        const nowTs = Date.now();
        const aTs = a.endDate ? Date.parse(a.endDate) : Number.POSITIVE_INFINITY;
        const bTs = b.endDate ? Date.parse(b.endDate) : Number.POSITIVE_INFINITY;
        const an = Number.isFinite(aTs) ? aTs : Number.POSITIVE_INFINITY;
        const bn = Number.isFinite(bTs) ? bTs : Number.POSITIVE_INFINITY;
        const aOpen = an > nowTs;
        const bOpen = bn > nowTs;
        if (aOpen !== bOpen) return aOpen ? -1 : 1;
        return an - bn;
      });
    } else {
      r = [...r].sort((a, b) => b.volume24hr - a.volume24hr);
    }

    return r.slice(0, 100);
  }, [combinedRows, feature.slug, q, showOnlyOpen, volumeBand, sortBy, searchIds]);

  if (loading) {
    return (
      <div className="terminal-panel p-2">
        <Skeleton className="mb-2 h-7 w-full max-w-md bg-muted" />
        <Skeleton className="h-48 w-full bg-muted" />
      </div>
    );
  }

  if (err) {
    return (
      <div className="terminal-panel p-2">
        <p className="font-data text-[11px] text-terminal-down">
          {err} — check network to gamma-api.polymarket.com and API routes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="terminal-panel p-2">
        <div className="grid gap-1.5 md:grid-cols-[minmax(18rem,28rem)_auto]">
          <Input
            placeholder="Search market, event slug, keyword…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-7 w-full border-border bg-secondary/40 font-data text-[11px] placeholder:text-muted-foreground"
          />
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => setShowOnlyOpen((v) => !v)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                showOnlyOpen && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              OPEN ONLY
            </button>
            <button
              type="button"
              onClick={() => setVolumeBand("all")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                volumeBand === "all" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              ALL VOL
            </button>
            <button
              type="button"
              onClick={() => setVolumeBand("10k")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                volumeBand === "10k" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              24H &gt; $10K
            </button>
            <button
              type="button"
              onClick={() => setVolumeBand("100k")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                volumeBand === "100k" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              24H &gt; $100K
            </button>
            <button
              type="button"
              onClick={() => setSortBy("vol24h")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                sortBy === "vol24h" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              SORT 24H
            </button>
            <button
              type="button"
              onClick={() => setSortBy("totalVol")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                sortBy === "totalVol" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              SORT TOTAL
            </button>
            <button
              type="button"
              onClick={() => setSortBy("endingSoon")}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 border-border px-2 font-data text-[10px]",
                sortBy === "endingSoon" && "border-primary/40 bg-primary/10 text-primary"
              )}
            >
              ENDING SOON
            </button>
          </div>
        </div>
        <div className="mt-1 font-data text-[10px] text-muted-foreground">
          Showing {filtered.length} of {combinedRows.length} markets
          {q.trim().length >= 2 ? " · Gamma search merged" : ""}
        </div>
      </div>
      <div className="terminal-panel overflow-hidden">
        <div className="terminal-panel-header">Markets</div>
        <Table className="text-[11px]">
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="h-7 font-data text-[10px] uppercase tracking-wider text-primary">
                Instrument
              </TableHead>
              <TableHead className="h-7 text-right font-data text-[10px] uppercase tracking-wider text-primary">
                24h vol
              </TableHead>
              <TableHead className="h-7 text-right font-data text-[10px] uppercase tracking-wider text-primary">
                Total vol
              </TableHead>
              <TableHead className="h-7 w-[72px] font-data text-[10px] uppercase tracking-wider text-primary" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((row) => {
              const detailQs = row.eventSlug
                ? new URLSearchParams({ es: row.eventSlug }).toString()
                : "";
              const detailHref = `/market/${encodeURIComponent(row.id)}${detailQs ? `?${detailQs}` : ""}`;
              return (
                <TableRow key={row.id} className="border-border hover:bg-accent/40">
                  <TableCell className="max-w-[min(100vw,28rem)] py-1 align-top font-data text-[11px]">
                    <Link href={detailHref} className="line-clamp-2 block text-foreground/95 hover:underline">
                      {row.title}
                    </Link>
                    {row.endDate && (
                      <span className="mt-0.5 block text-[10px] text-muted-foreground">{row.endDate}</span>
                    )}
                  </TableCell>
                  <TableCell className="py-1 text-right font-data text-[11px] text-terminal-up tabular-nums">
                    ${row.volume24hr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="py-1 text-right font-data text-[11px] tabular-nums text-foreground/90">
                    ${row.volume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell className="py-1 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "h-6 border-border px-1.5 font-data text-[10px] text-foreground/90 hover:bg-accent"
                        )}
                        href={detailHref}
                      >
                        DETAIL
                      </Link>
                      {row.eventSlug ? (
                        <a
                          className={cn(
                            buttonVariants({ variant: "outline", size: "sm" }),
                            "h-6 border-primary/30 px-1.5 font-data text-[10px] text-primary hover:bg-primary/10"
                          )}
                          href={polymarketEventUrl(row.eventSlug)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          OPEN
                        </a>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
