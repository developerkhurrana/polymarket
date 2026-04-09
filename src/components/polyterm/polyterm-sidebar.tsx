"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { groupFeatures, NAV_GROUPS } from "@/lib/features/registry";

export function PolytermSidebar() {
  const pathname = usePathname();
  const grouped = groupFeatures();

  return (
    <Sidebar collapsible="offcanvas" variant="inset" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-1.5 py-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-1.5 font-semibold tracking-wide text-primary"
        >
          <Activity className="size-4 shrink-0" aria-hidden />
          <span className="truncate font-data text-[12px] uppercase">PolyTerm</span>
        </Link>
        <p className="px-1.5 font-data text-[10px] leading-tight text-muted-foreground group-data-[collapsible=icon]:hidden">
          CLI parity · terminal UI
        </p>
      </SidebarHeader>
      <SidebarContent className="gap-0 overflow-x-hidden overflow-y-auto px-0">
        {NAV_GROUPS.map((group) => {
          const items = grouped[group] ?? [];
          if (items.length === 0) return null;
          return (
            <SidebarGroup key={group} className="py-1">
              <SidebarGroupLabel className="mb-0.5 px-2.5 font-data text-[10px] font-semibold uppercase tracking-[0.12em] text-primary/90">
                {group}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-px">
                  {items.map((f) => {
                    const href = `/f/${f.slug}`;
                    const active = pathname === href;
                    return (
                      <SidebarMenuItem key={f.slug}>
                        <Link
                          href={href}
                          title={f.title}
                          className={cn(
                            "flex w-full items-center border-l-2 border-transparent py-1 pl-2 pr-1.5 text-left font-data text-[11px] leading-tight outline-none transition-colors",
                            "hover:border-primary/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                            "focus-visible:ring-1 focus-visible:ring-ring",
                            active &&
                              "border-primary bg-sidebar-accent font-medium text-primary"
                          )}
                        >
                          <span className="truncate">{f.title}</span>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
