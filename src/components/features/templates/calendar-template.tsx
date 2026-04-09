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
import { Skeleton } from "@/components/ui/skeleton";
import type { FeatureDef } from "@/lib/features/types";
import { polymarketEventUrl } from "@/lib/polymarket/urls";

type Row = { id: string; title: string; eventSlug: string; endDate: string; volume24hr: number };

function num(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function flatten(raw: unknown[]): Row[] {
  const rows: Row[] = [];
  for (const ev of raw) {
    if (!ev || typeof ev !== "object") continue;
    const e = ev as Record<string, unknown>;
    const evTitle = String(e.title ?? "Event");
    const evSlug = e.slug ? String(e.slug) : undefined;
    const markets = e.markets;
    if (Array.isArray(markets)) {
      for (const m of markets) {
        if (!m || typeof m !== "object") continue;
        const mm = m as Record<string, unknown>;
        const end = mm.endDate ? String(mm.endDate) : "";
        if (!end) continue;
        rows.push({
          id: String(mm.id ?? mm.slug ?? evTitle + end),
          title: String(mm.question ?? mm.title ?? evTitle),
          eventSlug: evSlug ?? "",
          endDate: end,
          volume24hr: num(mm.volume24hr ?? mm.volume24Hr),
        });
      }
    }
  }
  return rows.sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());
}

export function CalendarTemplate({ feature }: { feature: FeatureDef }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/gamma/events?limit=100");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? res.statusText);
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) setRows(flatten(list));
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = useMemo(() => rows.filter((r) => new Date(r.endDate) > new Date()).slice(0, 80), [rows]);

  if (loading)
    return (
      <div className="terminal-panel p-2">
        <Skeleton className="mb-2 h-7 w-full max-w-md bg-muted" />
        <Skeleton className="h-48 w-full bg-muted" />
      </div>
    );
  if (err) return <p className="font-data text-[11px] text-terminal-down">{err}</p>;

  return (
    <div className="terminal-panel overflow-hidden" data-feature={feature.slug}>
      <div className="terminal-panel-header">Upcoming resolutions</div>
      <Table className="text-[11px]">
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-7 font-data text-[10px] uppercase tracking-wider text-primary">Time</TableHead>
            <TableHead className="h-7 font-data text-[10px] uppercase tracking-wider text-primary">Market</TableHead>
            <TableHead className="h-7 text-right font-data text-[10px] uppercase tracking-wider text-primary">
              24h vol
            </TableHead>
            <TableHead className="h-7 w-16" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {upcoming.map((row) => (
            <TableRow key={row.id} className="border-border hover:bg-accent/40">
              <TableCell className="whitespace-nowrap py-1 font-data text-[10px] text-muted-foreground">
                {new Date(row.endDate).toLocaleString()}
              </TableCell>
              <TableCell className="py-1 font-data text-[11px]">{row.title}</TableCell>
              <TableCell className="py-1 text-right font-data text-[11px] tabular-nums text-terminal-up">
                ${row.volume24hr.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </TableCell>
              <TableCell className="py-1 text-right">
                {row.eventSlug && (
                  <Link
                    className="font-data text-[10px] text-primary underline-offset-2 hover:underline"
                    href={polymarketEventUrl(row.eventSlug)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    LINK
                  </Link>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
