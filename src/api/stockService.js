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

// Realistic baseline prices for demo/fallback mode
export const MOCK_PRICES = {
  'NSE:RELIANCE':  { price: 1390.45, change:  0.38, changeAmount:  5.28, high: 1402.10, low: 1381.20, open: 1384.00, previousClose: 1385.17 },
  'NSE:SBIN':      { price:  500.80, change:  0.07, changeAmount:  0.35, high:  505.60, low:  497.30, open:  500.45, previousClose:  500.45 },
  'NSE:KOTAKBANK': { price: 2221.30, change:  1.42, changeAmount: 31.05, high: 2238.00, low: 2195.40, open: 2200.00, previousClose: 2190.25 },
  'NSE:AXISBANK':  { price: 1280.80, change:  1.10, changeAmount: 13.95, high: 1290.00, low: 1265.50, open: 1270.00, previousClose: 1266.85 },
  'NSE:POWERGRID': { price:  286.25, change: -0.15, changeAmount: -0.43, high:  289.90, low:  284.10, open:  287.00, previousClose:  286.68 },
  'NSE:TATASTEEL': { price:  169.90, change: -0.70, changeAmount: -1.20, high:  172.50, low:  168.80, open:  171.30, previousClose:  171.10 },
  'NSE:TCS':       { price: 3580.00, change:  0.55, changeAmount: 19.50, high: 3598.00, low: 3558.00, open: 3562.00, previousClose: 3560.50 },
  'NSE:HDFCBANK':  { price: 1724.60, change:  0.29, changeAmount:  4.95, high: 1732.00, low: 1715.30, open: 1720.00, previousClose: 1719.65 },
  'NSE:INFY':      { price: 1543.20, change: -0.18, changeAmount: -2.80, high: 1552.00, low: 1538.40, open: 1548.00, previousClose: 1546.00 },
  'NSE:WIPRO':     { price:  462.75, change:  0.62, changeAmount:  2.85, high:  467.00, low:  459.20, open:  460.50, previousClose:  459.90 },
};

/** Generate a simulated price history for demo mode using a seeded random walk */
export function generateMockCandles(symbol, days) {
  const base = MOCK_PRICES[symbol]?.price ?? 500;
  // Simple seeded pseudo-random using symbol string
  let seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) - 0.5;
  }

  const candles = [];
  let price = base * (1 - 0.05 * (days / 365)); // start slightly lower
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const dayMs = now - i * 86400000;
    const date = new Date(dayMs).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const change = price * (rand() * 0.025); // ±1.25% daily swing
    const open  = price;
    price = Math.max(price + change, base * 0.5);
    const high  = Math.max(open, price) * (1 + Math.abs(rand()) * 0.005);
    const low   = Math.min(open, price) * (1 - Math.abs(rand()) * 0.005);
    candles.push({ date, open: +open.toFixed(2), high: +high.toFixed(2), low: +low.toFixed(2), close: +price.toFixed(2), volume: 0 });
  }
  return candles;
}

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
