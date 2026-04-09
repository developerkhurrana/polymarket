import { PolytermShell } from "@/components/polyterm/polyterm-shell";

export default function PolytermLayout({ children }: { children: React.ReactNode }) {
  return <PolytermShell>{children}</PolytermShell>;
}
