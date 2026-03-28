<div align="center">

# 📈 StockSim Academy

### Practice trading with real market data — zero risk, maximum learning.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stocksim--academy.vercel.app-orange?style=for-the-badge&logo=vercel)](https://stocksim-academy.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://stocksim-academy.vercel.app)

*A full-stack stock market simulator with live prices, AI analysis, portfolio benchmarking, fractional shares, price alert emails, and a real-time leaderboard.*

</div>

---

## ✨ Features

### 🏦 Trading & Portfolio
| Feature | Description |
|---|---|
| **Virtual Trading** | Start with $1,000,000 virtual balance — buy & sell with no real risk |
| **5 Asset Classes** | Stocks · ETFs · Crypto · Forex · Commodities — all in one place |
| **Fractional Shares** | Buy by units (decimals allowed) or toggle to "Buy by Dollar Amount" — e.g. $50 of AAPL |
| **Live Prices** | Real market data from Finnhub API via secure server-side proxy, refreshing every 2 minutes |
| **Trade Safety** | Atomic trade execution with automatic rollback on failure |
| **Portfolio Analytics** | Live P&L per holding, allocation pie chart, weighted avg cost |
| **Portfolio Benchmarking** | 30-day line chart comparing your return vs S&P 500 (SPY) with a "+X% vs SPY" badge |
| **Trade History** | Full order log with buy/sell filter |

### 📊 Market Intelligence
| Feature | Description |
|---|---|
| **Stock Screener** | Filter by gainers/losers, sort by price or % change, search by name or ticker |
| **Stock Detail Pages** | Interactive area chart (1W / 1M / 3M / 6M / 1Y) with SMA20 / SMA50 trend analysis |
| **Company Profiles** | Industry, exchange, market cap, IPO year, website |
| **US Market Indices** | Live S&P 500, NASDAQ, Dow Jones bar |
| **Market Status** | Real-time open/closed indicator for US markets |
| **Financial News** | Live news with 4 tabs: Top News · Forex · Crypto · M&A |

### 🔔 Alerts & Watchlist
| Feature | Description |
|---|---|
| **Price Alerts** | Set above/below target alerts on any instrument |
| **Email Notifications** | Triggered alerts send email via Resend (Vercel Cron, runs daily) |
| **Watchlist** | Save any asset and monitor live prices in one place |
| **Auto Alert Checking** | Alerts evaluated on every live price refresh (every 2 min) |

### 🤖 AI Market Analyst
| Feature | Description |
|---|---|
| **AI Chat Panel** | Floating chat powered by **Llama 3.3 70B** (via Groq — completely free) |
| **Market Context** | AI is pre-loaded with all instruments available in the simulator |
| **Educational Focus** | Ask about strategies, valuation, technical analysis, risk management |

### 🏆 Social & Competition
| Feature | Description |
|---|---|
| **Leaderboard** | Ranked by **total portfolio value** (cash + holdings) — not just cash balance |
| **Multi-user** | Full auth via Supabase — each user has their own isolated portfolio |

### 🎨 UI & UX
| Feature | Description |
|---|---|
| **Onboarding Modal** | 3-step welcome tour for first-time users — dismissible, restartable from sidebar |
| **Dark / Light Mode** | System-aware theme toggle |
| **Real Company Logos** | Actual logos for all stocks, ETFs, and crypto assets |
| **Loading Skeletons** | Smooth loading states across charts and price displays |
| **Mobile Friendly** | Responsive sidebar with scroll-to-top on navigation |
| **PWA — Installable** | Install as a native-like app on desktop or mobile — works offline for cached assets |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite + **TypeScript (strict)** |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router v6 |
| **Data Fetching** | TanStack React Query (shared cache, deduped API calls) |
| **Charts** | Recharts |
| **Auth & Database** | Supabase (PostgreSQL + Row Level Security) |
| **Market Data** | Finnhub API — proxied via Vercel serverless function (key never exposed to client) |
| **AI** | Groq API — Llama 3.3 70B (free tier) |
| **Email** | Resend (transactional alert emails) |
| **Logo CDN** | Financial Modeling Prep · CoinGecko |
| **Testing** | Vitest + @testing-library/react (18 tests) |
| **PWA** | vite-plugin-pwa + Workbox (cache-first static, network-first API) |
| **Deployment** | Vercel (SPA + Serverless Functions + Cron Jobs) |

---

## 🗂 Asset Classes

| Class | Exchange | Instruments |
|---|---|---|
| **Stocks** | NYSE / NASDAQ | AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, V, JNJ + more |
| **ETFs** | NYSE | SPY, QQQ, TLT, VTI, IVV, AGG |
| **Crypto** | Binance | BTC, ETH, BNB, SOL, XRP, ADA |
| **Forex** | OANDA | EUR/USD, GBP/USD, USD/JPY, USD/INR, AUD/USD, USD/CAD |
| **Commodities** | ETF-based | GLD (Gold), SLV (Silver), USO (Oil), UNG (Gas), WEAT, CORN |

---

## 🗃 Database Schema

All tables defined in [`supabase/schema.sql`](supabase/schema.sql). Run once in the Supabase SQL editor.

| Table | Purpose |
|---|---|
| `profiles` | User accounts with virtual balance (default: $1,000,000) |
| `holdings` | Current positions per user with quantity (supports fractional) & average buy price |
| `trades` | Complete trade history (BUY / SELL) |
| `watchlists` | Saved assets per user |
| `price_alerts` | User-defined price alert targets with above/below direction |
| `leaderboard_view` | SQL view ranking users by total portfolio value |

> Row Level Security (RLS) is enabled on all tables — users can only read and write their own data.

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier)
- A [Finnhub](https://finnhub.io) API key (free — 60 req/min)
- A [Groq](https://console.groq.com) API key (free — no credit card)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Darren-Dcruz/Stock-Simulator.git
cd Stock-Simulator

# 2. Install dependencies
npm install

# 3. Create environment file
touch .env.local
```

Add the following to `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side only (never exposed to browser)
FINNHUB_KEY=your_finnhub_api_key
GROQ_API_KEY=your_groq_api_key

# Optional — required for email alerts
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

```bash
# 4. Set up the database
# Paste the contents of supabase/schema.sql into the Supabase SQL Editor and run it

# 5. Start the dev server (AI chat + Finnhub proxy work locally — no vercel dev needed)
npm run dev

# 6. Run tests
npm test
```

Open [http://localhost:5173](http://localhost:5173)

---

## ☁️ Deployment (Vercel)

```bash
# Install Vercel CLI (one-time)
npm install -g vercel

# Deploy to production
vercel --prod
```

Set these environment variables in **Vercel → Settings → Environment Variables**:

| Variable | Where to get it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (Publishable key) |
| `FINNHUB_KEY` | [finnhub.io](https://finnhub.io) → Free tier — **server-side only** |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → Free tier |
| `SUPABASE_SERVICE_KEY` | Supabase → Project Settings → API (Secret key) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `RESEND_FROM_EMAIL` | Verified sender address (or `onboarding@resend.dev` for testing) |

> **Note:** `FINNHUB_KEY` has no `VITE_` prefix — it is never bundled into the client. All Finnhub requests go through the `/api/finnhub` serverless proxy.

> **Cron:** Price alert emails run once daily at 09:00 UTC (Vercel Hobby plan limit). Upgrade to Pro for `*/5 * * * *` (every 5 min).

---

## 📁 Project Structure

```
src/
├── api/
│   └── stockService.ts     # Finnhub data fetching via /api/finnhub proxy
├── components/
│   ├── AiChatPanel.tsx     # Floating AI chat panel
│   ├── OnboardingModal.tsx # 3-step first-time user tour
│   ├── PwaInstallButton.tsx# PWA install prompt button
│   ├── AssetLogo.tsx       # Company logo with fallback
│   └── ui/                 # shadcn/ui primitives
├── hooks/                  # React Query data hooks
├── lib/
│   ├── alertService.ts     # Price alert CRUD + checking
│   ├── tradeService.ts     # Atomic trade execution with rollback
│   ├── MarketDataContext.tsx# Unified live price provider
│   └── supabase.ts         # Supabase client
├── pages/                  # Route-level page components
├── types/
│   └── index.ts            # Core TypeScript types (Instrument, Quote, Trade…)
└── Layout.tsx              # App shell with sidebar navigation
api/
├── chat.js                 # Vercel serverless function → Groq AI
├── finnhub.js              # Vercel serverless function → Finnhub proxy (rate-limited)
└── check-alerts.ts         # Vercel Cron → check price alerts + send emails via Resend
supabase/
└── schema.sql              # Full database schema + RLS policies
```

---

## 🧪 Testing

```bash
npm test
```

- **18 tests** across 3 test files
- `tradeService.test.ts` — input validation, balance checks, rollback logic
- `alertService.test.ts` — direction logic (above/below), DB-connected path
- `Portfolio.test.tsx` — integration test: render, balance display, empty state

---

## 📄 License

MIT — free to use, fork, and learn from.

---

<div align="center">

Built with ❤️ for learning finance · Powered by real market data

[Live App](https://stocksim-academy.vercel.app) · [Report a Bug](https://github.com/Darren-Dcruz/Stock-Simulator/issues)

</div>
