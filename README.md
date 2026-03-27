# StockSim Academy

> A stock market simulation and financial education platform — practice trading with real NSE data in a risk-free environment.

**Live App:** [https://stocksim-academy.vercel.app](https://stocksim-academy.vercel.app)

---

## About

StockSim Academy is an interactive stock trading simulator built for learners who want to understand the Indian stock market without risking real money. Every new user starts with a virtual portfolio of ₹10,00,000 and can buy/sell real NSE-listed stocks, track P&L, and compete on the leaderboard — all powered by live market data from Finnhub.

**Key highlights:**
- Live NSE stock prices via Finnhub API (updates every 2 minutes)
- Full trade lifecycle: Buy → Hold → Sell with weighted average cost tracking
- Portfolio analytics with P&L, allocation charts, and trade history
- Stock detail pages with interactive price charts and technical trend analysis (SMA20 / SMA50)
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
| Market Data | Finnhub API |
| Deployment | Vercel |

---

## Features

- **Dashboard** — portfolio summary, live most-active stocks, quick-action buttons
- **Market** — searchable table of 10 NSE stocks with live prices, high/low, and % change
- **Stock Detail** — interactive area chart (1W / 1M / 3M / 6M / 1Y), trend analysis, company profile
- **Trade** — buy and sell stocks; balance and holdings update in real time
- **Portfolio** — holdings with live P&L, allocation pie chart
- **History** — complete trade log with buy/sell filter
- **Watchlist** — save and monitor stocks with live price updates
- **Leaderboard** — ranked list of all users by portfolio value

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

---

## Database Schema

All tables are in `supabase/schema.sql`. Run it once in the Supabase SQL editor to create:

- `profiles` — user accounts with virtual balance (starts at ₹10,00,000)
- `holdings` — current stock positions per user
- `trades` — full trade history
- `watchlists` — saved stocks per user

Row Level Security (RLS) is enabled on all tables — users can only access their own data.

---

## Deployment

The app is deployed on Vercel. To deploy your own instance:

```bash
npm install -g vercel
vercel --build-env VITE_SUPABASE_URL=... --build-env VITE_SUPABASE_ANON_KEY=... --build-env VITE_FINNHUB_KEY=...
```

---

## License

MIT
