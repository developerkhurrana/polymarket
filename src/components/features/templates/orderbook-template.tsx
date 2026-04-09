"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FeatureDef } from "@/lib/features/types";

export function OrderbookTemplate({ feature }: { feature: FeatureDef }) {
  const [tokenId, setTokenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [book, setBook] = useState<{ bids?: unknown[]; asks?: unknown[] } | null>(null);

  async function load() {
    if (!tokenId.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/clob/book?token_id=${encodeURIComponent(tokenId.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setBook(data as { bids?: unknown[]; asks?: unknown[] });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      setBook(null);
    } finally {
      setLoading(false);
    }
  }

  function rowPriceSize(level: unknown): { price: string; size: string } {
    if (!level || typeof level !== "object") return { price: "—", size: "—" };
    const o = level as Record<string, unknown>;
    const price = o.price ?? o.px;
    const size = o.size ?? o.sz;
    return { price: String(price ?? "—"), size: String(size ?? "—") };
  }

  const bids = Array.isArray(book?.bids) ? book!.bids! : [];
  const asks = Array.isArray(book?.asks) ? book!.asks! : [];

  return (
    <div className="space-y-2" data-feature={feature.slug}>
      <div className="terminal-panel p-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="token" className="font-data text-[10px] uppercase tracking-wider text-primary">
              CLOB token id
            </Label>
            <Input
              id="token"
              placeholder="clobTokenId …"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              className="h-7 border-border bg-secondary/40 font-data text-[11px]"
            />
          </div>
          <Button
            type="button"
            onClick={load}
            disabled={loading}
            variant="outline"
            size="sm"
            className="h-7 border-primary/40 font-data text-[11px] text-primary hover:bg-primary/10"
          >
            {loading ? "…" : "LOAD"}
          </Button>
        </div>
      </div>
      {err && (
        <p className="font-data text-[11px] text-terminal-down">{err}</p>
      )}
      {book && (
        <div className="grid gap-2 md:grid-cols-2">
          <div className="terminal-panel overflow-hidden">
            <div className="terminal-panel-header text-terminal-up">Bids</div>
            <Table className="text-[11px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-7 font-data text-[10px] uppercase text-primary">Px</TableHead>
                  <TableHead className="h-7 text-right font-data text-[10px] uppercase text-primary">Sz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bids.slice(0, 24).map((l, i) => {
                  const { price, size } = rowPriceSize(l);
                  return (
                    <TableRow key={`b-${i}`} className="border-border hover:bg-accent/40">
                      <TableCell className="py-0.5 font-data text-terminal-up tabular-nums">{price}</TableCell>
                      <TableCell className="py-0.5 text-right font-data tabular-nums">{size}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="terminal-panel overflow-hidden">
            <div className="terminal-panel-header text-terminal-down">Asks</div>
            <Table className="text-[11px]">
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-7 font-data text-[10px] uppercase text-primary">Px</TableHead>
                  <TableHead className="h-7 text-right font-data text-[10px] uppercase text-primary">Sz</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asks.slice(0, 24).map((l, i) => {
                  const { price, size } = rowPriceSize(l);
                  return (
                    <TableRow key={`a-${i}`} className="border-border hover:bg-accent/40">
                      <TableCell className="py-0.5 font-data text-terminal-down tabular-nums">{price}</TableCell>
                      <TableCell className="py-0.5 text-right font-data tabular-nums">{size}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
