import Link from "next/link";
import { ArrowUpRight, BookOpen, LineChart, Wallet } from "lucide-react";
import { FEATURES } from "@/lib/features/registry";

const QUICK = ["monitor", "orderbook", "arbitrage", "mywallet", "predict", "news", "tutorial"];

export function DashboardTemplate() {
  const links = QUICK.map((slug) => FEATURES.find((f) => f.slug === slug)).filter(Boolean);

  return (
    <div className="space-y-3">
      <div className="terminal-panel">
        <div className="terminal-panel-header flex items-center justify-between">
          <span>Overview</span>
          <span className="font-data text-[10px] font-normal normal-case tracking-normal text-muted-foreground">
            POLYTERM WEB
          </span>
        </div>
        <div className="p-2">
          <h1 className="font-data text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 max-w-3xl font-data text-[11px] leading-relaxed text-muted-foreground">
            Same feature surface as the PolyTerm CLI. Live feeds: Gamma <span className="text-primary">/events</span>,
            CLOB <span className="text-primary">/book</span>, Data API{" "}
            <span className="text-primary">/positions</span>. No private keys.
          </p>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {links.map((f) =>
          f ? (
            <Link key={f.slug} href={`/f/${f.slug}`} className="group block">
              <div className="terminal-panel h-full transition-colors hover:border-primary/40 hover:bg-accent/30">
                <div className="terminal-panel-header flex items-center justify-between py-0.5">
                  <span className="truncate">{f.title}</span>
                  <ArrowUpRight className="size-3 shrink-0 opacity-60 transition-opacity group-hover:opacity-100" />
                </div>
                <div className="p-2">
                  <p className="font-data text-[11px] leading-snug text-muted-foreground line-clamp-3">
                    {f.description}
                  </p>
                </div>
              </div>
            </Link>
          ) : null
        )}
      </div>

      <div className="grid gap-2 md:grid-cols-3">
        <div className="terminal-panel">
          <div className="terminal-panel-header">Markets</div>
          <div className="flex gap-2 p-2">
            <LineChart className="size-5 shrink-0 text-primary" aria-hidden />
            <p className="font-data text-[11px] leading-snug text-muted-foreground">
              Gamma <span className="text-foreground/90">/events</span> — active events with volume.
            </p>
          </div>
        </div>
        <div className="terminal-panel">
          <div className="terminal-panel-header">Wallet</div>
          <div className="flex gap-2 p-2">
            <Wallet className="size-5 shrink-0 text-terminal-up" aria-hidden />
            <p className="font-data text-[11px] leading-snug text-muted-foreground">
              View-only. Positions via <span className="text-foreground/90">data-api.polymarket.com</span>.
            </p>
          </div>
        </div>
        <div className="terminal-panel">
          <div className="terminal-panel-header">Engines</div>
          <div className="flex gap-2 p-2">
            <BookOpen className="size-5 shrink-0 text-terminal-warn" aria-hidden />
            <p className="font-data text-[11px] leading-snug text-muted-foreground">
              Full arb / wash / UMA logic remains in the Python CLI; web UI = navigation + live APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
