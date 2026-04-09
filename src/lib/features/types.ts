export type FeatureTemplate =
  | "dashboard"
  | "events"
  | "orderbook"
  | "mywallet"
  | "calendar"
  | "arbitrage"
  | "predict"
  | "risk"
  | "news"
  | "wallets"
  | "calculators"
  | "export"
  | "tutorial"
  | "glossary"
  | "config"
  | "alerts"
  | "bookmarks"
  | "generic";

export interface FeatureDef {
  slug: string;
  title: string;
  description: string;
  group: string;
  template: FeatureTemplate;
  /** PolyTerm CLI command name */
  cli: string;
}
