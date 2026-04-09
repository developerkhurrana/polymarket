import type { FeatureDef } from "@/lib/features/types";
import { EventsTemplate } from "@/components/features/templates/events-template";
import { OrderbookTemplate } from "@/components/features/templates/orderbook-template";
import { MywalletTemplate } from "@/components/features/templates/mywallet-template";
import { CalendarTemplate } from "@/components/features/templates/calendar-template";
import { DashboardTemplate } from "@/components/features/templates/dashboard-template";
import { GenericTemplate } from "@/components/features/templates/generic-template";
import {
  ConfigTemplate,
  ExportTemplate,
  GlossaryTemplate,
  TutorialTemplate,
} from "@/components/features/templates/static-templates";

export function FeatureBody({ feature }: { feature: FeatureDef }) {
  switch (feature.template) {
    case "dashboard":
      return <DashboardTemplate />;
    case "events":
      return <EventsTemplate feature={feature} />;
    case "orderbook":
      return <OrderbookTemplate feature={feature} />;
    case "mywallet":
      return <MywalletTemplate feature={feature} />;
    case "calendar":
      return <CalendarTemplate feature={feature} />;
    case "arbitrage":
    case "predict":
    case "risk":
    case "news":
    case "wallets":
    case "calculators":
    case "alerts":
      return <GenericTemplate feature={feature} />;
    case "export":
      return <ExportTemplate feature={feature} />;
    case "tutorial":
      return <TutorialTemplate feature={feature} />;
    case "glossary":
      return <GlossaryTemplate feature={feature} />;
    case "config":
      return <ConfigTemplate feature={feature} />;
    case "bookmarks":
      return <GenericTemplate feature={feature} />;
    default:
      return <GenericTemplate feature={feature} />;
  }
}
