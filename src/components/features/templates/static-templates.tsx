"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeatureDef } from "@/lib/features/types";

export function TutorialTemplate({ feature }: { feature: FeatureDef }) {
  return (
    <div className="terminal-panel" data-feature={feature.slug}>
      <div className="terminal-panel-header">{feature.title}</div>
      <ul className="list-inside list-disc space-y-1.5 p-2 font-data text-[11px] leading-relaxed text-muted-foreground">
        <li>Prices $0–$1 ≈ implied probability.</li>
        <li>YES + NO ≈ $1 before fees.</li>
        <li>Monitor = flow; Order book = execution.</li>
        <li>No private keys — view-only P&amp;L.</li>
      </ul>
    </div>
  );
}

export function GlossaryTemplate({ feature }: { feature: FeatureDef }) {
  const terms = [
    { term: "Token / asset id", def: "CLOB outcome token; price = belief." },
    { term: "Market", def: "Single outcome (YES/NO, condition, clob ids)." },
    { term: "Event", def: "Group of related markets." },
    { term: "NegRisk", def: "Only one YES in the group." },
    { term: "CLOB", def: "Off-chain book; settlement on-chain." },
  ];
  return (
    <div className="terminal-panel" data-feature={feature.slug}>
      <div className="terminal-panel-header">{feature.title}</div>
      <div className="divide-y divide-border">
        {terms.map((t) => (
          <div key={t.term} className="p-2">
            <p className="font-data text-[11px] font-medium text-primary">{t.term}</p>
            <p className="mt-0.5 font-data text-[11px] text-muted-foreground">{t.def}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ConfigTemplate({ feature }: { feature: FeatureDef }) {
  return (
    <div className="terminal-panel" data-feature={feature.slug}>
      <div className="terminal-panel-header">{feature.title}</div>
      <div className="space-y-2 p-2 font-data text-[11px] text-muted-foreground">
        <p>
          CLI: <code className="text-foreground/90">%USERPROFILE%\.polyterm\config.toml</code> or{" "}
          <code className="text-foreground/90">~/.polyterm/config.toml</code>
        </p>
        <p>
          Web: <code className="text-foreground/90">.env.local</code> from{" "}
          <code className="text-foreground/90">.env.example</code>
        </p>
        <a
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 border-primary/40 text-[11px] text-primary")}
          href="https://docs.polymarket.com"
          target="_blank"
          rel="noreferrer"
        >
          docs.polymarket.com
        </a>
      </div>
    </div>
  );
}

export function ExportTemplate({ feature }: { feature: FeatureDef }) {
  return (
    <div className="terminal-panel" data-feature={feature.slug}>
      <div className="terminal-panel-header">{feature.title}</div>
      <div className="p-2">
        <button
          type="button"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "h-7 border-primary/40 font-data text-[11px] text-primary hover:bg-primary/10"
          )}
          onClick={async () => {
            const res = await fetch("/api/gamma/events?limit=200");
            const data = await res.json();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "polyterm-events-export.json";
            a.click();
            URL.revokeObjectURL(a.href);
          }}
        >
          EXPORT JSON (GAMMA)
        </button>
      </div>
    </div>
  );
}
