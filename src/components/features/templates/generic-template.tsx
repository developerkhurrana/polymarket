import type { FeatureDef } from "@/lib/features/types";

export function GenericTemplate({ feature }: { feature: FeatureDef }) {
  return (
    <div className="terminal-panel">
      <div className="terminal-panel-header">{feature.title}</div>
      <div className="space-y-2 p-2 font-data text-[11px] leading-relaxed text-muted-foreground">
        <p>
          Maps to{" "}
          <code className="rounded border border-border bg-secondary/50 px-1 py-0.5 text-primary">
            polyterm {feature.cli}
          </code>
          . Heavy logic (SQLite, backtests, scoring) lives in the Python CLI; wire a backend or port engines to unlock
          full parity.
        </p>
        <p>
          Use live routes: Monitor, Order book, My wallet, Calendar, Export — or run the CLI locally.
        </p>
      </div>
    </div>
  );
}
