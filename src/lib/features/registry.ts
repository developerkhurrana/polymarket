import type { FeatureDef, FeatureTemplate } from "./types";

/** Mirrors PolyTerm CLI (`lazy_group.py` + README). Web UI templates map to live APIs where possible. */
const CORE: FeatureDef[] = [
  { slug: "dashboard", title: "Dashboard", description: "Overview of market activity.", group: "Core", template: "dashboard", cli: "dashboard" },
  { slug: "monitor", title: "Monitor", description: "Real-time market tracking with live updates.", group: "Core", template: "events", cli: "monitor" },
  { slug: "hot", title: "Hot markets", description: "Markets moving right now (by volume / activity).", group: "Core", template: "events", cli: "hot" },
  { slug: "watch", title: "Watch", description: "Track specific markets with alerts.", group: "Core", template: "generic", cli: "watch" },
  { slug: "live-monitor", title: "Live monitor", description: "Dedicated focused monitoring (terminal opens separate window in CLI).", group: "Core", template: "events", cli: "live-monitor" },
  { slug: "whales", title: "Whales", description: "Volume-based whale detection.", group: "Core", template: "events", cli: "whales" },
  { slug: "replay", title: "Replay", description: "Replay market history.", group: "Core", template: "generic", cli: "replay" },
  { slug: "export", title: "Export", description: "Export market data to JSON/CSV.", group: "Core", template: "export", cli: "export" },
];

const TRADING: FeatureDef[] = [
  { slug: "crypto15m", title: "15m crypto", description: "BTC, ETH, SOL, XRP 15-minute markets.", group: "Trading", template: "events", cli: "crypto15m" },
  { slug: "mywallet", title: "My wallet", description: "View-only wallet: positions, history, P&L (via Data API).", group: "Trading", template: "mywallet", cli: "mywallet" },
  { slug: "quicktrade", title: "Quick trade", description: "Trade prep, sizing, fee-aware breakeven, Polymarket links.", group: "Trading", template: "calculators", cli: "quicktrade" },
  { slug: "trade", title: "Trade calculator", description: "Analyze before you trade.", group: "Trading", template: "calculators", cli: "trade" },
];

const ANALYTICS: FeatureDef[] = [
  { slug: "arbitrage", title: "Arbitrage", description: "Intra-market, correlated, optional Kalshi cross-platform.", group: "Analytics", template: "arbitrage", cli: "arbitrage" },
  { slug: "negrisk", title: "NegRisk", description: "Multi-outcome / negative-risk arbitrage scan.", group: "Analytics", template: "arbitrage", cli: "negrisk" },
  { slug: "predict", title: "Predict", description: "Signal-based predictions (momentum, volume, whales, RSI, etc.).", group: "Analytics", template: "predict", cli: "predict" },
  { slug: "orderbook", title: "Order book", description: "Depth, spread, slippage (CLOB REST).", group: "Analytics", template: "orderbook", cli: "orderbook" },
  { slug: "depth", title: "Depth", description: "Depth analysis and slippage.", group: "Analytics", template: "orderbook", cli: "depth" },
  { slug: "spread", title: "Spread", description: "Bid/ask spread and execution costs.", group: "Analytics", template: "orderbook", cli: "spread" },
  { slug: "ladder", title: "Ladder", description: "Visual price ladder.", group: "Analytics", template: "generic", cli: "ladder" },
  { slug: "wallets", title: "Wallets", description: "Whale & smart-money wallet analysis.", group: "Analytics", template: "wallets", cli: "wallets" },
  { slug: "clusters", title: "Clusters", description: "Detect same-entity wallet groups.", group: "Analytics", template: "wallets", cli: "clusters" },
  { slug: "follow", title: "Follow / copy", description: "Follow wallets for copy-trading signals.", group: "Analytics", template: "wallets", cli: "follow" },
  { slug: "alerts", title: "Alerts", description: "Alert history and management.", group: "Analytics", template: "alerts", cli: "alerts" },
  { slug: "center", title: "Alert center", description: "Unified alert center.", group: "Analytics", template: "alerts", cli: "center" },
  { slug: "risk", title: "Risk", description: "Market risk scoring (A–F).", group: "Analytics", template: "risk", cli: "risk" },
  { slug: "rewards", title: "Rewards", description: "Holding & liquidity reward estimates.", group: "Analytics", template: "generic", cli: "rewards" },
  { slug: "news", title: "News", description: "Market-relevant headlines.", group: "Analytics", template: "news", cli: "news" },
  { slug: "sentiment", title: "Sentiment", description: "Aggregated sentiment signals.", group: "Analytics", template: "predict", cli: "sentiment" },
  { slug: "signals", title: "Signals", description: "Entry/exit style signals.", group: "Analytics", template: "predict", cli: "signals" },
];

const TOOLS: FeatureDef[] = [
  { slug: "simulate", title: "Simulate P&L", description: "Interactive P&L scenarios.", group: "Tools", template: "calculators", cli: "simulate" },
  { slug: "parlay", title: "Parlay", description: "Combined multi-leg odds.", group: "Tools", template: "calculators", cli: "parlay" },
  { slug: "size", title: "Position size", description: "Kelly / sizing helpers.", group: "Tools", template: "calculators", cli: "size" },
  { slug: "fees", title: "Fees", description: "Fees and slippage calculator (~2% winner fee context).", group: "Tools", template: "calculators", cli: "fees" },
  { slug: "pricealert", title: "Price alerts", description: "Target price notifications (local/config in CLI).", group: "Tools", template: "alerts", cli: "pricealert" },
  { slug: "ev", title: "Expected value", description: "EV and optimal size hints.", group: "Tools", template: "calculators", cli: "ev" },
  { slug: "odds", title: "Odds", description: "Convert between odds formats.", group: "Tools", template: "calculators", cli: "odds" },
  { slug: "notify", title: "Notify", description: "Telegram, Discord, email, desktop notifications.", group: "Tools", template: "config", cli: "notify" },
  { slug: "config", title: "Config", description: "Runtime settings (PolyTerm uses ~/.polyterm/config.toml).", group: "Tools", template: "config", cli: "config" },
];

const RESEARCH: FeatureDef[] = [
  { slug: "search", title: "Search", description: "Filter and find markets (Gamma-backed).", group: "Research", template: "events", cli: "search" },
  { slug: "screener", title: "Screener", description: "Multi-criteria market screen.", group: "Research", template: "events", cli: "screener" },
  { slug: "stats", title: "Stats", description: "Volatility, RSI, trends.", group: "Research", template: "generic", cli: "stats" },
  { slug: "chart", title: "Chart", description: "Price history visualization.", group: "Research", template: "generic", cli: "chart" },
  { slug: "compare", title: "Compare", description: "Side-by-side markets.", group: "Research", template: "generic", cli: "compare" },
  { slug: "calendar", title: "Calendar", description: "Upcoming resolutions.", group: "Research", template: "calendar", cli: "calendar" },
  { slug: "timeline", title: "Timeline", description: "Resolution timeline view.", group: "Research", template: "calendar", cli: "timeline" },
  { slug: "bookmarks", title: "Bookmarks", description: "Saved markets (CLI uses local DB).", group: "Research", template: "bookmarks", cli: "bookmarks" },
  { slug: "recent", title: "Recent", description: "Recently viewed markets.", group: "Research", template: "bookmarks", cli: "recent" },
  { slug: "lookup", title: "Lookup", description: "Fast market lookup.", group: "Research", template: "events", cli: "lookup" },
  { slug: "summary", title: "Summary", description: "One-line market summary.", group: "Research", template: "generic", cli: "summary" },
  { slug: "correlate", title: "Correlate", description: "Correlated / related markets.", group: "Research", template: "generic", cli: "correlate" },
  { slug: "similar", title: "Similar", description: "Similar markets to a given market.", group: "Research", template: "generic", cli: "similar" },
  { slug: "liquidity", title: "Liquidity", description: "Liquidity comparison.", group: "Research", template: "generic", cli: "liquidity" },
  { slug: "volume", title: "Volume", description: "Volume distribution across price levels.", group: "Research", template: "generic", cli: "volume" },
  { slug: "history", title: "History", description: "Historical prices and volume.", group: "Research", template: "generic", cli: "history" },
  { slug: "presets", title: "Presets", description: "Saved screener presets.", group: "Research", template: "generic", cli: "presets" },
  { slug: "pin", title: "Pin", description: "Pin markets for quick access.", group: "Research", template: "bookmarks", cli: "pin" },
  { slug: "groups", title: "Groups", description: "Named watchlist groups.", group: "Research", template: "bookmarks", cli: "groups" },
];

const PORTFOLIO: FeatureDef[] = [
  { slug: "portfolio", title: "Portfolio", description: "Positions overview (Data API + local in CLI).", group: "Portfolio", template: "mywallet", cli: "portfolio" },
  { slug: "position", title: "Position tracker", description: "Manual position tracking / journal-style P&L.", group: "Portfolio", template: "mywallet", cli: "position" },
  { slug: "pnl", title: "P&L", description: "Profit and loss over time.", group: "Portfolio", template: "mywallet", cli: "pnl" },
  { slug: "journal", title: "Journal", description: "Trade journal.", group: "Portfolio", template: "generic", cli: "journal" },
  { slug: "notes", title: "Notes", description: "Notes on markets.", group: "Portfolio", template: "generic", cli: "notes" },
  { slug: "health", title: "Health", description: "Portfolio health check.", group: "Portfolio", template: "generic", cli: "health" },
  { slug: "attribution", title: "Attribution", description: "Performance attribution.", group: "Portfolio", template: "generic", cli: "attribution" },
  { slug: "benchmark", title: "Benchmark", description: "Compare vs benchmarks.", group: "Portfolio", template: "generic", cli: "benchmark" },
  { slug: "leaderboard", title: "Leaderboard", description: "Trader leaderboard.", group: "Portfolio", template: "generic", cli: "leaderboard" },
  { slug: "streak", title: "Streak", description: "Win/loss streaks.", group: "Portfolio", template: "generic", cli: "streak" },
  { slug: "calibrate", title: "Calibrate", description: "Probability calibration tracking.", group: "Portfolio", template: "generic", cli: "calibrate" },
  { slug: "report", title: "Report", description: "Comprehensive reports.", group: "Portfolio", template: "generic", cli: "report" },
  { slug: "digest", title: "Digest", description: "Activity digest.", group: "Portfolio", template: "generic", cli: "digest" },
  { slug: "analyze", title: "Analyze", description: "Portfolio exposure and risk analysis.", group: "Portfolio", template: "generic", cli: "analyze" },
  { slug: "scenario", title: "Scenario", description: "What-if scenarios.", group: "Portfolio", template: "calculators", cli: "scenario" },
];

const ADVANCED: FeatureDef[] = [
  { slug: "backtest", title: "Backtest", description: "Strategy backtests on history.", group: "Advanced", template: "generic", cli: "backtest" },
  { slug: "watchdog", title: "Watchdog", description: "Continuous monitoring with custom rules.", group: "Advanced", template: "alerts", cli: "watchdog" },
  { slug: "snapshot", title: "Snapshot", description: "Save/compare market snapshots.", group: "Advanced", template: "generic", cli: "snapshot" },
  { slug: "timing", title: "Timing", description: "Optimal timing analysis.", group: "Advanced", template: "generic", cli: "timing" },
  { slug: "exit", title: "Exit plan", description: "Profit targets and stops.", group: "Advanced", template: "calculators", cli: "exit" },
  { slug: "quick", title: "Quick actions", description: "Shortcuts for common tasks.", group: "Advanced", template: "generic", cli: "quick" },
];

const LEARNING: FeatureDef[] = [
  { slug: "tutorial", title: "Tutorial", description: "Onboarding for prediction markets.", group: "Learning", template: "tutorial", cli: "tutorial" },
  { slug: "glossary", title: "Glossary", description: "Terminology (market, token, negrisk, CLOB, etc.).", group: "Learning", template: "glossary", cli: "glossary" },
];

const GENERIC_EXTRA: FeatureDef[] = [
  { slug: "update", title: "Update", description: "Check for PyPI updates (CLI only).", group: "Tools", template: "config", cli: "update" },
];

export const FEATURES: FeatureDef[] = [
  ...CORE,
  ...TRADING,
  ...ANALYTICS,
  ...TOOLS,
  ...RESEARCH,
  ...PORTFOLIO,
  ...ADVANCED,
  ...LEARNING,
  ...GENERIC_EXTRA,
].sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));

export const FEATURE_BY_SLUG: Map<string, FeatureDef> = new Map(FEATURES.map((f) => [f.slug, f]));

export function getFeature(slug: string): FeatureDef | undefined {
  return FEATURE_BY_SLUG.get(slug);
}

export const NAV_GROUPS = ["Core", "Trading", "Analytics", "Tools", "Research", "Portfolio", "Advanced", "Learning"] as const;

export function groupFeatures(): Record<string, FeatureDef[]> {
  const out: Record<string, FeatureDef[]> = {};
  for (const g of NAV_GROUPS) out[g] = [];
  for (const f of FEATURES) {
    if (!out[f.group]) out[f.group] = [];
    out[f.group].push(f);
  }
  return out;
}
