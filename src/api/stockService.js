const FINNHUB_KEY = import.meta.env.VITE_FINNHUB_KEY ?? '';
const FINNHUB_BASE = 'https://finnhub.io/api/v1';

export const TRACKED_STOCKS = [
  { symbol: 'AAPL',  ticker: 'AAPL',  name: 'Apple Inc.',            icon: '🍎', sector: 'Technology' },
  { symbol: 'MSFT',  ticker: 'MSFT',  name: 'Microsoft Corp.',       icon: '💻', sector: 'Technology' },
  { symbol: 'GOOGL', ticker: 'GOOGL', name: 'Alphabet Inc.',         icon: '🔍', sector: 'Technology' },
  { symbol: 'AMZN',  ticker: 'AMZN',  name: 'Amazon.com Inc.',       icon: '📦', sector: 'Consumer'   },
  { symbol: 'TSLA',  ticker: 'TSLA',  name: 'Tesla Inc.',            icon: '🚗', sector: 'Automotive' },
  { symbol: 'META',  ticker: 'META',  name: 'Meta Platforms Inc.',   icon: '👤', sector: 'Technology' },
  { symbol: 'NVDA',  ticker: 'NVDA',  name: 'NVIDIA Corp.',          icon: '🎮', sector: 'Technology' },
  { symbol: 'JPM',   ticker: 'JPM',   name: 'JPMorgan Chase & Co.', icon: '🏦', sector: 'Finance'    },
  { symbol: 'JNJ',   ticker: 'JNJ',   name: 'Johnson & Johnson',     icon: '💊', sector: 'Healthcare' },
  { symbol: 'V',     ticker: 'V',     name: 'Visa Inc.',             icon: '💳', sector: 'Finance'    },
];

export const US_INDICES = [
  { symbol: '^GSPC', label: 'S&P 500',   mockPrice: 5234.18, mockChange:  0.42 },
  { symbol: '^IXIC', label: 'NASDAQ',    mockPrice: 16384.47, mockChange:  0.65 },
  { symbol: '^DJI',  label: 'Dow Jones', mockPrice: 39127.14, mockChange: -0.18 },
];

// Realistic fallback prices for demo mode (USD)
export const MOCK_PRICES = {
  AAPL:  { price: 196.89, change:  0.72, changeAmount:  1.41, high: 198.23, low: 195.30, open: 195.80, previousClose: 195.48 },
  MSFT:  { price: 415.32, change:  0.48, changeAmount:  1.98, high: 417.10, low: 413.60, open: 414.00, previousClose: 413.34 },
  GOOGL: { price: 174.65, change: -0.31, changeAmount: -0.54, high: 176.20, low: 173.80, open: 175.50, previousClose: 175.19 },
  AMZN:  { price: 195.40, change:  1.12, changeAmount:  2.17, high: 196.80, low: 193.50, open: 193.80, previousClose: 193.23 },
  TSLA:  { price: 177.90, change: -1.45, changeAmount: -2.62, high: 181.30, low: 176.40, open: 180.60, previousClose: 180.52 },
  META:  { price: 582.10, change:  0.89, changeAmount:  5.14, high: 585.00, low: 578.30, open: 578.50, previousClose: 576.96 },
  NVDA:  { price: 903.56, change:  2.31, changeAmount: 20.40, high: 912.00, low: 895.20, open: 896.00, previousClose: 883.16 },
  JPM:   { price: 212.45, change:  0.37, changeAmount:  0.78, high: 213.80, low: 211.20, open: 211.80, previousClose: 211.67 },
  JNJ:   { price: 152.30, change: -0.52, changeAmount: -0.80, high: 153.90, low: 151.70, open: 153.40, previousClose: 153.10 },
  V:     { price: 281.75, change:  0.61, changeAmount:  1.71, high: 283.00, low: 280.10, open: 280.50, previousClose: 280.04 },
};

/** Generate a simulated price history for demo mode using a seeded random walk */
export function generateMockCandles(symbol, days) {
  const base = MOCK_PRICES[symbol]?.price ?? 100;
  let seed = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) - 0.5;
  }

  const candles = [];
  let price = base * (1 - 0.05 * (days / 365));
  const now = Date.now();

  for (let i = days; i >= 0; i--) {
    const dayMs = now - i * 86400000;
    const date  = new Date(dayMs).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const change = price * (rand() * 0.025);
    const open   = price;
    price = Math.max(price + change, base * 0.5);
    const high = Math.max(open, price) * (1 + Math.abs(rand()) * 0.005);
    const low  = Math.min(open, price) * (1 - Math.abs(rand()) * 0.005);
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
    date:   new Date(ts * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
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
