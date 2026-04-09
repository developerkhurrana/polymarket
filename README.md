# PolyTerm Web

Next.js + shadcn/ui dashboard that mirrors **PolyTerm** CLI feature areas (see parent repo `README.md` and `polyterm/cli/lazy_group.py`).

## What works with live APIs

- **Gamma** — `/api/gamma/events`, `/api/gamma/markets/[id]` (same hosts as PolyTerm: `gamma-api.polymarket.com`)
- **CLOB** — `/api/clob/book?token_id=` (`clob.polymarket.com/book`)
- **Data API** — `/api/data/positions`, `/api/data/activity` (`data-api.polymarket.com`)

Pages under `/f/[slug]` map to the same commands as the CLI (monitor, orderbook, mywallet, calendar, export, …). Heavy analytics (full arb engine, wash detection, SQLite journal, etc.) remain in the Python app; those routes show an honest placeholder until you add a backend or port the logic.

## Setup

```bash
cd polyterm-web
npm install
cp .env.example .env.local   # optional: NEXT_PUBLIC_POLYMARKET_WALLET_ADDRESS
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```
