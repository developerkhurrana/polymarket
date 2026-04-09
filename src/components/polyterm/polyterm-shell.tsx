"use client";

import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { PolytermSidebar } from "@/components/polyterm/polyterm-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TerminalClock } from "@/components/polyterm/terminal-chrome";

const TICKER_ITEMS = [
  "POLYTERM",
  "GAMMA API",
  "CLOB",
  "DATA API",
  "VIEW-ONLY",
  "NO CUSTODY",
];

export function PolytermShell({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen>
        <PolytermSidebar />
        <SidebarInset className="relative flex min-h-svh flex-col bg-background md:peer-data-[variant=inset]:m-0 md:peer-data-[variant=inset]:rounded-none md:peer-data-[variant=inset]:shadow-none">
          {/* Bloomberg-style ticker strip */}
          <div className="terminal-ticker font-data border-border">
            {TICKER_ITEMS.map((label) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="text-primary">▪</span>
                <span className="text-foreground/80">{label}</span>
              </span>
            ))}
            <span className="ml-auto flex items-center gap-2">
              <TerminalClock />
            </span>
          </div>

          <header className="flex h-9 shrink-0 items-center gap-2 border-b border-border bg-[oklch(0.09_0.012_260)] px-2 md:px-3">
            <SidebarTrigger
              title="Toggle sidebar — full width when hidden (Ctrl+B)"
              className="-ml-0.5 size-7 text-primary hover:bg-accent hover:text-accent-foreground"
            />
            <Separator orientation="vertical" className="h-3.5 bg-border" />
            <span className="font-data text-[11px] tracking-wide text-muted-foreground">
              <span className="text-foreground/90">POLYTERM</span>
              <span className="mx-2 text-border">|</span>
              Polymarket · read-only analytics
            </span>
          </header>

          <div className="terminal-grid-bg flex flex-1 flex-col">
            <div className="flex flex-1 flex-col p-2 md:p-3">{children}</div>
            <footer className="terminal-statusline">
              <span>
                <span className="text-primary">READY</span>
                <span className="mx-2 text-border">|</span>
                Ctrl+B toggles sidebar (off-canvas when closed)
              </span>
              <span className="text-terminal-up">LIVE</span>
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
