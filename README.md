<div align="center">

# 📈 StockSim Academy

### Practice trading with real market data — zero risk, maximum learning.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-stocksim--academy.vercel.app-orange?style=for-the-badge&logo=vercel)](https://stocksim-academy.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)

*A full-stack stock market simulator with live prices, AI analysis, portfolio tracking, and a real-time leaderboard.*

</div>

---

## 📸 Screenshots

> **Dashboard — Portfolio overview with live market data**

![Dashboard](screenshots/dashboard.png)

> **Market — 5 asset classes with live prices and screener**

![Market](screenshots/market.png)

> **Stock Detail — Interactive charts, trend analysis & price alerts**

![Stock Detail](screenshots/stock-detail.png)

> **Portfolio — Holdings with live P&L and allocation chart**

![Portfolio](screenshots/portfolio.png)

> **AI Market Analyst — Powered by Llama 3.3 (Groq)**

![AI Chat](screenshots/ai-chat.png)

> **Leaderboard — Ranked by total portfolio value**

![Leaderboard](screenshots/leaderboard.png)

---

## ✨ Features

### 🏦 Trading & Portfolio
| Feature | Description |
|---|---|
| **Virtual Trading** | Start with $1,000,000 virtual balance — buy & sell with no real risk |
| **5 Asset Classes** | Stocks · ETFs · Crypto · Forex · Commodities — all in one place |
| **Live Prices** | Real market data from Finnhub API, refreshing every 2 minutes |
| **Trade Safety** | Atomic trade execution with automatic rollback on failure |
| **Portfolio Analytics** | Live P&L per holding, allocation pie chart, weighted avg cost |
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
| **Price Alerts** | Set above/below target alerts on any instrument — get notified when triggered |
| **Watchlist** | Save any asset and monitor live prices in one place |
| **Auto Alert Checking** | Alerts are evaluated every time live prices refresh (every 2 min) |

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
| **Dark / Light Mode** | System-aware theme toggle |
| **Real Company Logos** | Actual logos for all stocks, ETFs, and crypto assets |
| **Loading Skeletons** | Smooth loading states across charts and price displays |
| **Mobile Friendly** | Responsive sidebar with scroll-to-top on navigation |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Routing** | React Router v6 |
| **Data Fetching** | TanStack React Query (shared cache, deduped API calls) |
| **Charts** | Recharts |
| **Auth & Database** | Supabase (PostgreSQL + Row Level Security) |
| **Market Data** | Finnhub API — stocks, ETFs, crypto, forex, news |
| **AI** | Groq API — Llama 3.3 70B (free tier) |
| **Logo CDN** | Financial Modeling Prep · CoinGecko |
| **Deployment** | Vercel (SPA + Serverless Functions) |

---

## 🗂 Asset Classes

| Class | Exchange | Instruments |
|---|---|---|
| **Stocks** | NYSE / NASDAQ | AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX, JPM, V, JNJ, WMT + more |
| **ETFs** | NYSE | SPY, QQQ, DIA, IWM, VTI, GLD, XLF, XLK |
| **Crypto** | Binance | BTC, ETH, SOL, DOGE, ADA, XRP, BNB |
| **Forex** | OANDA | EUR/USD, GBP/USD, USD/JPY, USD/CHF, AUD/USD |
| **Commodities** | ETF-based | GLD (Gold), SLV (Silver), USO (Oil), UNG (Gas) |

---

## 🗃 Database Schema

All tables defined in [`supabase/schema.sql`](supabase/schema.sql). Run once in the Supabase SQL editor.

| Table | Purpose |
|---|---|
| `profiles` | User accounts with virtual balance (default: $1,000,000) |
| `holdings` | Current positions per user with quantity & average buy price |
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
VITE_FINNHUB_KEY=your_finnhub_api_key
GROQ_API_KEY=your_groq_api_key
```

```bash
# 4. Set up the database
# Paste the contents of supabase/schema.sql into the Supabase SQL Editor and run it

# 5. Start the dev server (AI chat works too — no vercel dev needed)
npm run dev
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
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `VITE_FINNHUB_KEY` | [finnhub.io](https://finnhub.io) → Free tier |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) → Free tier |

---

## 📁 Project Structure

```
src/
├── api/              # Finnhub data fetching (stockService.js)
├── components/       # Reusable UI components
│   ├── AiChatPanel   # Floating AI chat panel
│   ├── AssetTable    # Market data table
│   └── ui/           # shadcn/ui primitives
├── hooks/            # React Query data hooks
├── lib/
│   ├── alertService  # Price alert CRUD + checking
│   ├── tradeService  # Atomic trade execution with rollback
│   ├── MarketDataContext  # Unified live price provider
│   └── supabase      # Supabase client
├── pages/            # Route-level page components
└── Layout.jsx        # App shell with sidebar navigation
api/
└── chat.js           # Vercel serverless function → Groq AI
supabase/
└── schema.sql        # Full database schema + RLS policies
```

---

## 📄 License

MIT — free to use, fork, and learn from.

---

<div align="center">

Built with ❤️ for learning finance · Powered by real market data

[Live App](https://stocksim-academy.vercel.app) · [Report a Bug](https://github.com/Darren-Dcruz/Stock-Simulator/issues)

</div>
