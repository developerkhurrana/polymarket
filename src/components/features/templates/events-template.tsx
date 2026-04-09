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

function flattenEvents(raw: unknown[]): Row[] {
  const rows: Row[] = [];
  for (const ev of raw) {
    if (!ev || typeof ev !== "object") continue;
    const e = ev as Record<string, unknown>;
    const evTitle = String(e.title ?? e.question ?? "Event");
    const evSlug = e.slug ? String(e.slug) : undefined;
    const markets = e.markets;
    if (Array.isArray(markets) && markets.length > 0) {
      for (const m of markets) {
        if (!m || typeof m !== "object") continue;
        const mm = m as Record<string, unknown>;
        const mslug = mm.slug ? String(mm.slug) : undefined;
        rows.push({
          id: String(mm.id ?? mm.slug ?? evTitle),
          title: String(mm.question ?? mm.title ?? evTitle),
          eventSlug: evSlug ?? "",
          marketSlug: mslug,
          volume24hr: num(mm.volume24hr ?? mm.volume24Hr),
          volume: num(mm.volume),
          endDate: mm.endDate ? String(mm.endDate) : undefined,
        });
      }
    } else {
      rows.push({
        id: String(e.id ?? evTitle),
        title: evTitle,
        eventSlug: evSlug ?? "",
        marketSlug: undefined,
        volume24hr: num(e.volume24hr ?? e.volume24Hr),
        volume: num(e.volume),
        endDate: e.endDate ? String(e.endDate) : undefined,
      });
    }
  }
  return rows;
}

export function EventsTemplate({ feature }: { feature: FeatureDef }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

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

  const filtered = useMemo(() => {
    let r = rows;
    const slug = feature.slug;
    if (slug === "hot" || slug === "whales") {
      r = [...r].sort((a, b) => b.volume24hr - a.volume24hr);
    }
    if (slug === "crypto15m") {
      r = r.filter(
        (x) =>
          /15m|15-min|btc|eth|sol|xrp|crypto/i.test(x.title) ||
          (x.marketSlug?.includes("crypto") ?? false) ||
          (x.eventSlug?.includes("crypto") ?? false)
      );
    }
    if (q.trim()) {
      const qq = q.toLowerCase();
      r = r.filter((x) => x.title.toLowerCase().includes(qq));
    }
    return r.slice(0, 100);
  }, [rows, feature.slug, q]);

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
      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder="Filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="h-7 max-w-md border-border bg-secondary/40 font-data text-[11px] placeholder:text-muted-foreground"
        />
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
