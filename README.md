# StockSim Academy

> A stock market simulation and financial education platform — practice trading with real US market data in a risk-free environment.

**Live App:** [https://stocksim-academy.vercel.app](https://stocksim-academy.vercel.app)

---

## About

StockSim Academy is an interactive trading simulator built for learners who want to understand the US stock market without risking real money. Every new user starts with a virtual portfolio of $1,000,000 and can buy/sell real US stocks, ETFs, crypto, forex, and commodities — all powered by live market data from Finnhub.

**Key highlights:**
- Live US market prices via Finnhub API (updates every 2 minutes)
- Trade stocks, ETFs, crypto (Binance), forex (OANDA), and commodities
- Full trade lifecycle: Buy → Hold → Sell with weighted average cost tracking
- Portfolio analytics with P&L, allocation charts, and trade history
- Stock detail pages with interactive price charts and technical trend analysis (SMA20 / SMA50)
- Real company logos for all stocks, ETFs, and crypto assets
- Live market news from Finnhub (Top News, Forex, Crypto, M&A)
- US market open/closed status indicator
- US market indices (S&P 500, NASDAQ, Dow Jones)
- Watchlist, leaderboard, and dark/light theme support

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Routing | React Router v6 |
| State / Data | TanStack React Query |
| Charts | Recharts |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| Market Data | Finnhub API (stocks, ETFs, crypto, forex, news) |
| Logo CDN | Financial Modeling Prep (stocks/ETFs) · CoinGecko (crypto) |
| Deployment | Vercel |

---

## Features

- **Dashboard** — portfolio summary, live most-active stocks with company logos, quick-action buttons
- **Market** — 5 asset class tabs (Stocks · ETFs · Crypto · Forex · Commodities) with live prices, high/low, % change, and real logos
- **Stock Detail** — interactive area chart (1W / 1M / 3M / 6M / 1Y), trend analysis (SMA20/SMA50), company profile, and logo
- **Trade** — buy and sell any instrument; balance and holdings update in real time
- **Portfolio** — holdings with live P&L, allocation pie chart
- **History** — complete trade log with buy/sell filter
- **Watchlist** — save and monitor any asset with live price updates
- **Leaderboard** — ranked list of all users by portfolio value
- **News** — live financial news with 4 category tabs (Top News · Forex · Crypto · M&A), article thumbnails, and external links

---

## Asset Classes

| Class | Source | Instruments |
|---|---|---|
| Stocks | Finnhub (NYSE/NASDAQ) | AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, JPM, JNJ, V |
| ETFs | Finnhub | SPY, QQQ, TLT, VTI, IVV, AGG |
| Crypto | Finnhub via Binance | BTC, ETH, BNB, SOL, XRP, ADA |
| Forex | Finnhub via OANDA | EUR/USD, GBP/USD, USD/JPY, USD/INR, AUD/USD, USD/CAD |
| Commodities | Finnhub (ETF-based) | GLD, SLV, USO, UNG, WEAT, CORN |

---

## Getting Started Locally

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Finnhub](https://finnhub.io) API key (free tier — 60 req/min)

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/Darren-Dcruz/Stock-Simulator.git
cd Stock-Simulator

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env.local
# Fill in your Supabase and Finnhub credentials

# 4. Set up the database
# Run the SQL in supabase/schema.sql in your Supabase SQL editor

# 5. Start the development server
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FINNHUB_KEY=your_finnhub_api_key
```

> The app runs in demo mode with mock prices if `VITE_FINNHUB_KEY` is not set.

---

## Database Schema

All tables are in `supabase/schema.sql`. Run it once in the Supabase SQL editor to create:

- `profiles` — user accounts with virtual balance (starts at $1,000,000)
- `holdings` — current positions per user (stocks, ETFs, crypto, forex, commodities)
- `trades` — full trade history
- `watchlists` — saved assets per user

Row Level Security (RLS) is enabled on all tables — users can only access their own data.

---

## Deployment

The app is deployed on Vercel with environment variables stored in the project settings.

```bash
# Install Vercel CLI
npm install -g vercel

# Add environment variables to the project (one-time setup)
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_FINNHUB_KEY

# Deploy to production
vercel --prod
```

SPA routing is handled via `vercel.json` which rewrites all paths to `index.html`.

---

## License

MIT
