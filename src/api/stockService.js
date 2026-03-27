const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? '';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export const TRACKED_STOCKS = [
  { symbol: 'NSE:RELIANCE',  ticker: 'RELIANCE',  name: 'Reliance Industries Ltd.', icon: '⚡', sector: 'Energy'    },
  { symbol: 'NSE:SBIN',      ticker: 'SBIN',       name: 'State Bank of India',       icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:KOTAKBANK', ticker: 'KOTAKBANK',  name: 'Kotak Mahindra Bank',       icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:AXISBANK',  ticker: 'AXISBANK',   name: 'Axis Bank Ltd.',            icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:POWERGRID', ticker: 'POWERGRID',  name: 'Power Grid Corp.',          icon: '🔌', sector: 'Energy'    },
  { symbol: 'NSE:TATASTEEL', ticker: 'TATASTEEL',  name: 'Tata Steel Ltd.',           icon: '🏭', sector: 'Materials' },
  { symbol: 'NSE:TCS',       ticker: 'TCS',        name: 'Tata Consultancy Services', icon: '💻', sector: 'IT'        },
  { symbol: 'NSE:HDFCBANK',  ticker: 'HDFCBANK',   name: 'HDFC Bank Ltd.',            icon: '🏦', sector: 'Banking'   },
  { symbol: 'NSE:INFY',      ticker: 'INFY',       name: 'Infosys Ltd.',              icon: '💻', sector: 'IT'        },
  { symbol: 'NSE:WIPRO',     ticker: 'WIPRO',      name: 'Wipro Ltd.',                icon: '💻', sector: 'IT'        },
];

export function hasFinnhubKey() { return FINNHUB_KEY.length > 0; }

async function get(path) {
  const res = await fetch(`${FINNHUB_BASE}${path}&token=${FINNHUB_KEY}`);
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json();
}

/** Single stock quote */
export async function fetchQuote(finnhubSymbol) {
  const q = await get(`/quote?symbol=${finnhubSymbol}`);
  if (!q.c || q.c === 0) throw new Error(`No data for ${finnhubSymbol}`);
  return {
    price:         q.c,
    change:        q.dp ?? 0,
    changeAmount:  q.d  ?? 0,
    high:          q.h  ?? 0,
    low:           q.l  ?? 0,
    open:          q.o  ?? 0,
    previousClose: q.pc ?? 0,
  };
}

/** Historical candles for chart — returns array of { date, open, high, low, close, volume } */
export async function fetchCandles(finnhubSymbol, days = 30) {
  const to   = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;
  const data = await get(`/stock/candle?symbol=${finnhubSymbol}&resolution=D&from=${from}&to=${to}`);
  if (data.s !== 'ok' || !data.t) return [];
  return data.t.map((ts, i) => ({
    date:   new Date(ts * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    open:   data.o[i],
    high:   data.h[i],
    low:    data.l[i],
    close:  data.c[i],
    volume: data.v[i],
  }));
}

/** Company profile — name, industry, market cap, IPO date, website */
export async function fetchProfile(finnhubSymbol) {
  return get(`/stock/profile2?symbol=${finnhubSymbol}`);
}

/** Fetch all tracked stocks in parallel */
async function fetchOne(stock) {
  const q = await fetchQuote(stock.symbol);
  return { ...stock, ...q };
}

export async function fetchStockQuotes() {
  return Promise.all(TRACKED_STOCKS.map(fetchOne));
}
