"use client";

import { useEffect, useState } from "react";
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

export function MywalletTemplate({ feature }: { feature: FeatureDef }) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [positions, setPositions] = useState<Record<string, unknown>[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const env = process.env.NEXT_PUBLIC_POLYMARKET_WALLET_ADDRESS;
    if (env) setAddress(env);
  }, []);

  async function load() {
    if (!address.trim()) return;
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`/api/data/positions?user=${encodeURIComponent(address.trim())}&limit=100`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? res.statusText);
      setPositions(Array.isArray(data) ? data : []);
      setHasLoaded(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      setPositions([]);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2" data-feature={feature.slug}>
      <div className="terminal-panel p-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-1">
            <Label htmlFor="addr" className="font-data text-[10px] uppercase tracking-wider text-primary">
              Wallet 0x…
            </Label>
            <Input
              id="addr"
              placeholder="0x…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-7 border-border bg-secondary/40 font-data text-[11px]"
            />
            <p className="font-data text-[10px] text-muted-foreground">
              Optional default: <span className="text-muted-foreground/80">NEXT_PUBLIC_POLYMARKET_WALLET_ADDRESS</span> in
              .env.local
            </p>
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
      {err && <p className="font-data text-[11px] text-terminal-down">{err}</p>}
      {!loading && !err && hasLoaded && positions.length === 0 && (
        <div className="terminal-panel p-2">
          <p className="font-data text-[11px] text-muted-foreground">
            No open positions found for this wallet.
          </p>
        </div>
      )}
      {positions.length > 0 && (
        <div className="terminal-panel overflow-hidden">
          <div className="terminal-panel-header">Positions</div>
          <Table className="text-[11px]">
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-7 font-data text-[10px] uppercase tracking-wider text-primary">Market</TableHead>
                <TableHead className="h-7 text-right font-data text-[10px] uppercase tracking-wider text-primary">
                  Size
                </TableHead>
                <TableHead className="h-7 text-right font-data text-[10px] uppercase tracking-wider text-primary">
                  Value
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p, i) => {
                const o = p as Record<string, unknown>;
                const title = String(o.title ?? o.market ?? o.slug ?? "—");
                const size = String(o.size ?? o.position ?? "—");
                const val = String(o.currentValue ?? o.current_value ?? o.value ?? "—");
                return (
                  <TableRow key={i} className="border-border hover:bg-accent/40">
                    <TableCell className="max-w-md py-1 font-data text-[11px]">{title}</TableCell>
                    <TableCell className="py-1 text-right font-data text-[11px] tabular-nums">{size}</TableCell>
                    <TableCell className="py-1 text-right font-data text-[11px] tabular-nums text-terminal-up">
                      {val}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
