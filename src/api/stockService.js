/**
 * Stock data via Finnhub (https://finnhub.io) — official, CORS-friendly, free tier.
 *
 * Setup (one-time):
 *   1. Sign up free at https://finnhub.io
 *   2. Copy your API key
 *   3. Add to .env.local:  VITE_FINNHUB_KEY=your_key_here
 *
 * Free tier: 60 API calls / minute — enough for all 10 stocks every 2 minutes.
 */

const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? '';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export const TRACKED_STOCKS = [
  { symbol: 'NSE:RELIANCE',  ticker: 'RELIANCE',  name: 'Reliance Industries Ltd.', icon: '⚡', sector: 'Energy'    },
  { symbol: 'NSE:SBIN',      ticker: 'SBIN',       name: 'State Bank of India',       icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:KOTAKBANK', ticker: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',        icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:AXISBANK',  ticker: 'AXISBANK',   name: 'Axis Bank Ltd.',             icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:POWERGRID', ticker: 'POWERGRID',  name: 'Power Grid Corp.',           icon: '🔌', sector: 'Energy'    },
  { symbol: 'NSE:TATASTEEL', ticker: 'TATASTEEL',  name: 'Tata Steel Ltd.',            icon: '🏭', sector: 'Materials' },
  { symbol: 'NSE:TCS',       ticker: 'TCS',        name: 'Tata Consultancy Services',  icon: '💻', sector: 'IT'        },
  { symbol: 'NSE:HDFCBANK',  ticker: 'HDFCBANK',   name: 'HDFC Bank Ltd.',             icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:INFY',      ticker: 'INFY',       name: 'Infosys Ltd.',               icon: '💻', sector: 'IT'        },
  { symbol: 'NSE:WIPRO',     ticker: 'WIPRO',      name: 'Wipro Ltd.',                 icon: '💻', sector: 'IT'        },
];

export function hasFinnhubKey() {
  return FINNHUB_KEY.length > 0;
}

/**
 * Fetch a single stock quote from Finnhub.
 * Finnhub response: { c: price, d: change, dp: changePercent, h: high, l: low, o: open, pc: prevClose }
 */
async function fetchOne(stock) {
  const url = `${FINNHUB_BASE}/quote?symbol=${stock.symbol}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${res.status} for ${stock.symbol}`);
  const q = await res.json();
  if (!q.c || q.c === 0) throw new Error(`No data for ${stock.symbol}`);
  return {
    ...stock,
    price:        q.c,
    change:       q.dp ?? 0,
    changeAmount: q.d  ?? 0,
    high:         q.h  ?? 0,
    low:          q.l  ?? 0,
    open:         q.o  ?? 0,
    previousClose: q.pc ?? 0,
  };
}

/** Fetch all tracked stocks in parallel. */
export async function fetchStockQuotes() {
  const results = await Promise.all(TRACKED_STOCKS.map(fetchOne));
  return results;
}
