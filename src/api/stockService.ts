// No API key here — all Finnhub calls go through /api/finnhub (server-side proxy)

// ─── Stocks ─────────────────────────────────────────────────────────────────
export const TRACKED_STOCKS = [
  { symbol: 'AAPL',  ticker: 'AAPL',  name: 'Apple Inc.',            icon: '🍎', logo: 'https://financialmodelingprep.com/image-stock/AAPL.png',  sector: 'Technology', assetType: 'stock' },
  { symbol: 'MSFT',  ticker: 'MSFT',  name: 'Microsoft Corp.',       icon: '💻', logo: 'https://financialmodelingprep.com/image-stock/MSFT.png',  sector: 'Technology', assetType: 'stock' },
  { symbol: 'GOOGL', ticker: 'GOOGL', name: 'Alphabet Inc.',         icon: '🔍', logo: 'https://financialmodelingprep.com/image-stock/GOOGL.png', sector: 'Technology', assetType: 'stock' },
  { symbol: 'AMZN',  ticker: 'AMZN',  name: 'Amazon.com Inc.',       icon: '📦', logo: 'https://financialmodelingprep.com/image-stock/AMZN.png',  sector: 'Consumer',   assetType: 'stock' },
  { symbol: 'TSLA',  ticker: 'TSLA',  name: 'Tesla Inc.',            icon: '🚗', logo: 'https://financialmodelingprep.com/image-stock/TSLA.png',  sector: 'Automotive', assetType: 'stock' },
  { symbol: 'META',  ticker: 'META',  name: 'Meta Platforms Inc.',   icon: '👤', logo: 'https://financialmodelingprep.com/image-stock/META.png',  sector: 'Technology', assetType: 'stock' },
  { symbol: 'NVDA',  ticker: 'NVDA',  name: 'NVIDIA Corp.',          icon: '🎮', logo: 'https://financialmodelingprep.com/image-stock/NVDA.png',  sector: 'Technology', assetType: 'stock' },
  { symbol: 'JPM',   ticker: 'JPM',   name: 'JPMorgan Chase & Co.', icon: '🏦', logo: 'https://financialmodelingprep.com/image-stock/JPM.png',   sector: 'Finance',    assetType: 'stock' },
  { symbol: 'JNJ',   ticker: 'JNJ',   name: 'Johnson & Johnson',     icon: '💊', logo: 'https://financialmodelingprep.com/image-stock/JNJ.png',   sector: 'Healthcare', assetType: 'stock' },
  { symbol: 'V',     ticker: 'V',     name: 'Visa Inc.',             icon: '💳', logo: 'https://financialmodelingprep.com/image-stock/V.png',     sector: 'Finance',    assetType: 'stock' },
];

// ─── ETFs ────────────────────────────────────────────────────────────────────
export const TRACKED_ETFS = [
  { symbol: 'SPY',  ticker: 'SPY',  name: 'SPDR S&P 500 ETF Trust',           icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/SPY.png',  sector: 'Broad Market', assetType: 'etf' },
  { symbol: 'QQQ',  ticker: 'QQQ',  name: 'Invesco QQQ Trust (NASDAQ-100)',   icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/QQQ.png',  sector: 'Technology',   assetType: 'etf' },
  { symbol: 'TLT',  ticker: 'TLT',  name: 'iShares 20+ Year Treasury ETF',   icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/TLT.png',  sector: 'Bonds',        assetType: 'etf' },
  { symbol: 'VTI',  ticker: 'VTI',  name: 'Vanguard Total Stock Market ETF',  icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/VTI.png',  sector: 'Broad Market', assetType: 'etf' },
  { symbol: 'IVV',  ticker: 'IVV',  name: 'iShares Core S&P 500 ETF',        icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/IVV.png',  sector: 'Broad Market', assetType: 'etf' },
  { symbol: 'AGG',  ticker: 'AGG',  name: 'iShares Core US Aggregate Bond ETF',icon: '📊', logo: 'https://financialmodelingprep.com/image-stock/AGG.png', sector: 'Bonds',        assetType: 'etf' },
];

// ─── Crypto ──────────────────────────────────────────────────────────────────
export const TRACKED_CRYPTO = [
  { symbol: 'BINANCE:BTCUSDT', ticker: 'BTC', name: 'Bitcoin',   icon: '₿',  logo: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',         sector: 'Crypto', assetType: 'crypto' },
  { symbol: 'BINANCE:ETHUSDT', ticker: 'ETH', name: 'Ethereum',  icon: '⟠',  logo: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',       sector: 'Crypto', assetType: 'crypto' },
  { symbol: 'BINANCE:BNBUSDT', ticker: 'BNB', name: 'BNB',       icon: '🔶', logo: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',   sector: 'Crypto', assetType: 'crypto' },
  { symbol: 'BINANCE:SOLUSDT', ticker: 'SOL', name: 'Solana',    icon: '◎',  logo: 'https://assets.coingecko.com/coins/images/4128/small/solana.png',         sector: 'Crypto', assetType: 'crypto' },
  { symbol: 'BINANCE:XRPUSDT', ticker: 'XRP', name: 'Ripple',    icon: '💧', logo: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', sector: 'Crypto', assetType: 'crypto' },
  { symbol: 'BINANCE:ADAUSDT', ticker: 'ADA', name: 'Cardano',   icon: '🔷', logo: 'https://assets.coingecko.com/coins/images/975/small/cardano.png',         sector: 'Crypto', assetType: 'crypto' },
];

// ─── Forex ───────────────────────────────────────────────────────────────────
export const TRACKED_FOREX = [
  { symbol: 'OANDA:EUR_USD', ticker: 'EUR/USD', name: 'Euro / US Dollar',              icon: '💱', sector: 'Forex', assetType: 'forex' },
  { symbol: 'OANDA:GBP_USD', ticker: 'GBP/USD', name: 'British Pound / US Dollar',    icon: '💱', sector: 'Forex', assetType: 'forex' },
  { symbol: 'OANDA:USD_JPY', ticker: 'USD/JPY', name: 'US Dollar / Japanese Yen',     icon: '💱', sector: 'Forex', assetType: 'forex' },
  { symbol: 'OANDA:USD_INR', ticker: 'USD/INR', name: 'US Dollar / Indian Rupee',     icon: '💱', sector: 'Forex', assetType: 'forex' },
  { symbol: 'OANDA:AUD_USD', ticker: 'AUD/USD', name: 'Australian Dollar / US Dollar',icon: '💱', sector: 'Forex', assetType: 'forex' },
  { symbol: 'OANDA:USD_CAD', ticker: 'USD/CAD', name: 'US Dollar / Canadian Dollar',  icon: '💱', sector: 'Forex', assetType: 'forex' },
];

// ─── Commodities (via ETFs) ───────────────────────────────────────────────────
export const TRACKED_COMMODITIES = [
  { symbol: 'GLD',  ticker: 'GLD',  name: 'Gold (SPDR Gold Shares ETF)',         icon: '🥇', sector: 'Metals',    assetType: 'commodity' },
  { symbol: 'SLV',  ticker: 'SLV',  name: 'Silver (iShares Silver Trust)',        icon: '🥈', sector: 'Metals',    assetType: 'commodity' },
  { symbol: 'USO',  ticker: 'USO',  name: 'Crude Oil (US Oil Fund ETF)',          icon: '🛢', sector: 'Energy',    assetType: 'commodity' },
  { symbol: 'UNG',  ticker: 'UNG',  name: 'Natural Gas (US Natural Gas ETF)',     icon: '🔥', sector: 'Energy',    assetType: 'commodity' },
  { symbol: 'WEAT', ticker: 'WEAT', name: 'Wheat (Teucrium Wheat Fund)',          icon: '🌾', sector: 'Agricult.', assetType: 'commodity' },
  { symbol: 'CORN', ticker: 'CORN', name: 'Corn (Teucrium Corn Fund)',            icon: '🌽', sector: 'Agricult.', assetType: 'commodity' },
];

// ─── All instruments combined (for Trade & StockDetail lookup) ─────────────
export const ALL_INSTRUMENTS = [
  ...TRACKED_STOCKS,
  ...TRACKED_ETFS,
  ...TRACKED_CRYPTO,
  ...TRACKED_FOREX,
  ...TRACKED_COMMODITIES,
];

// ─── US Market Indices ────────────────────────────────────────────────────────
export const US_INDICES = [
  { symbol: '^GSPC', label: 'S&P 500',   mockPrice: 5234.18,  mockChange:  0.42 },
  { symbol: '^IXIC', label: 'NASDAQ',    mockPrice: 16384.47, mockChange:  0.65 },
  { symbol: '^DJI',  label: 'Dow Jones', mockPrice: 39127.14, mockChange: -0.18 },
];

// ─── Mock / fallback prices ───────────────────────────────────────────────────
export const MOCK_PRICES = {
  // Stocks
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
  // ETFs
  SPY:   { price: 524.50, change:  0.48, changeAmount:  2.51, high: 526.30, low: 522.80, open: 523.10, previousClose: 522.00 },
  QQQ:   { price: 448.20, change:  0.72, changeAmount:  3.20, high: 450.10, low: 446.30, open: 446.80, previousClose: 444.98 },
  TLT:   { price:  95.30, change: -0.22, changeAmount: -0.21, high:  96.10, low:  95.00, open:  95.80, previousClose:  95.51 },
  VTI:   { price: 249.80, change:  0.51, changeAmount:  1.27, high: 251.20, low: 248.50, open: 248.90, previousClose: 248.54 },
  IVV:   { price: 526.00, change:  0.47, changeAmount:  2.46, high: 527.80, low: 524.20, open: 524.60, previousClose: 523.53 },
  AGG:   { price:  95.80, change:  0.12, changeAmount:  0.11, high:  96.20, low:  95.60, open:  95.70, previousClose:  95.69 },
  // Crypto (USD)
  'BINANCE:BTCUSDT': { price: 67450.00, change:  2.15, changeAmount: 1420.00, high: 68200.00, low: 66100.00, open: 66030.00, previousClose: 66030.00 },
  'BINANCE:ETHUSDT': { price:  3520.00, change:  1.87, changeAmount:   64.80, high:  3580.00, low:  3450.00, open:  3455.20, previousClose:  3455.20 },
  'BINANCE:BNBUSDT': { price:   580.00, change:  0.95, changeAmount:    5.46, high:   588.00, low:   572.00, open:   574.54, previousClose:   574.54 },
  'BINANCE:SOLUSDT': { price:   172.00, change:  3.21, changeAmount:    5.35, high:   175.00, low:   165.00, open:   166.65, previousClose:   166.65 },
  'BINANCE:XRPUSDT': { price:     0.55, change: -0.45, changeAmount:   -0.002,high:     0.57, low:     0.54, open:     0.552,previousClose:     0.552 },
  'BINANCE:ADAUSDT': { price:     0.47, change:  1.12, changeAmount:    0.005, high:     0.48, low:     0.46, open:     0.465,previousClose:     0.465 },
  // Forex
  'OANDA:EUR_USD':   { price: 1.0862, change: -0.12, changeAmount: -0.0013, high: 1.0890, low: 1.0845, open: 1.0875, previousClose: 1.0875 },
  'OANDA:GBP_USD':   { price: 1.2704, change:  0.08, changeAmount:  0.0010, high: 1.2730, low: 1.2685, open: 1.2694, previousClose: 1.2694 },
  'OANDA:USD_JPY':   { price: 155.42, change:  0.15, changeAmount:  0.2300, high: 155.80, low: 155.10, open: 155.19, previousClose: 155.19 },
  'OANDA:USD_INR':   { price:  83.45, change:  0.05, changeAmount:  0.0420, high:  83.56, low:  83.38, open:  83.41, previousClose:  83.41 },
  'OANDA:AUD_USD':   { price: 0.6645, change: -0.18, changeAmount: -0.0012, high: 0.6672, low: 0.6638, open: 0.6657, previousClose: 0.6657 },
  'OANDA:USD_CAD':   { price: 1.3598, change: -0.07, changeAmount: -0.0010, high: 1.3618, low: 1.3581, open: 1.3608, previousClose: 1.3608 },
  // Commodities
  GLD:   { price: 231.40, change:  0.35, changeAmount:  0.81, high: 232.50, low: 230.20, open: 230.55, previousClose: 230.59 },
  SLV:   { price:  26.85, change:  0.62, changeAmount:  0.17, high:  27.10, low:  26.60, open:  26.68, previousClose:  26.68 },
  USO:   { price:  74.20, change: -0.45, changeAmount: -0.34, high:  75.10, low:  73.90, open:  74.58, previousClose:  74.54 },
  UNG:   { price:  12.40, change: -1.35, changeAmount: -0.17, high:  12.70, low:  12.25, open:  12.57, previousClose:  12.57 },
  WEAT:  { price:   5.48, change: -1.20, changeAmount: -0.07, high:   5.60, low:   5.42, open:   5.55, previousClose:   5.55 },
  CORN:  { price:  21.90, change:  0.33, changeAmount:  0.07, high:  22.10, low:  21.75, open:  21.83, previousClose:  21.83 },
};

/** Determine whether the US stock market is currently open (Mon–Fri 9:30–16:00 ET) */
export function getMarketStatus() {
  const now = new Date();
  // Approximate ET offset: UTC-4 in summer (EDT), UTC-5 in winter (EST)
  const month = now.getUTCMonth() + 1;
  const etOffset = (month >= 3 && month <= 11) ? -4 : -5;
  const etTime = new Date(now.getTime() + etOffset * 3600000);
  const day = etTime.getUTCDay();
  const mins = etTime.getUTCHours() * 60 + etTime.getUTCMinutes();
  if (day === 0 || day === 6) return { open: false, label: 'Closed — Weekend' };
  if (mins < 9 * 60 + 30) return { open: false, label: 'Pre-Market' };
  if (mins >= 16 * 60) return { open: false, label: 'After-Hours' };
  return { open: true, label: 'Market Open' };
}

/** Generate a simulated price history for demo mode */
export function generateMockCandles(symbol, days) {
  const base = MOCK_PRICES[symbol]?.price ?? 100;
  let seed = String(symbol).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  function rand() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff) - 0.5;
  }
  const candles = [];
  let price = base * (1 - 0.05 * (days / 365));
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 86400000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    const change = price * (rand() * 0.025);
    const open   = price;
    price = Math.max(price + change, base * 0.5);
    const high = Math.max(open, price) * (1 + Math.abs(rand()) * 0.005);
    const low  = Math.min(open, price) * (1 - Math.abs(rand()) * 0.005);
    candles.push({ date, open: +open.toFixed(4), high: +high.toFixed(4), low: +low.toFixed(4), close: +price.toFixed(4), volume: 0 });
  }
  return candles;
}

export function hasFinnhubKey() { return true; }

async function get(path) {
  // Split "/quote?symbol=AAPL" into endpoint "/quote" and params "symbol=AAPL"
  const qIdx = path.indexOf('?');
  const endpoint = qIdx === -1 ? path : path.slice(0, qIdx);
  const params   = qIdx === -1 ? '' : path.slice(qIdx + 1);
  const url = `/api/finnhub?path=${encodeURIComponent(endpoint)}${params ? '&' + params : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${res.status}`);
  return res.json();
}

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

export async function fetchCandles(finnhubSymbol, days = 30) {
  const to   = Math.floor(Date.now() / 1000);
  const from = to - days * 86400;
  const data = await get(`/stock/candle?symbol=${finnhubSymbol}&resolution=D&from=${from}&to=${to}`);
  if (data.s !== 'ok' || !data.t) return [];
  return data.t.map((ts, i) => ({
    date:   new Date(ts * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
    open:   data.o[i], high: data.h[i], low: data.l[i], close: data.c[i], volume: data.v[i],
  }));
}

export async function fetchProfile(finnhubSymbol) {
  return get(`/stock/profile2?symbol=${finnhubSymbol}`);
}

/** Fetch market news (general, forex, crypto, merger) */
export async function fetchMarketNews(category = 'general') {
  const articles = await get(`/news?category=${category}`);
  if (!Array.isArray(articles)) return [];
  return articles
    .filter(a => a.headline && a.url)
    .slice(0, 24);
}

async function fetchOne(inst) {
  try {
    const q = await fetchQuote(inst.symbol);
    return { ...inst, ...q };
  } catch {
    return { ...inst, ...(MOCK_PRICES[inst.symbol] ?? { price: 0, change: 0, changeAmount: 0, high: 0, low: 0, open: 0, previousClose: 0 }), isMock: true };
  }
}

export async function fetchStockQuotes()     { return Promise.all(TRACKED_STOCKS.map(fetchOne)); }
export async function fetchETFQuotes()       { return Promise.all(TRACKED_ETFS.map(fetchOne)); }
export async function fetchCryptoQuotes()    { return Promise.all(TRACKED_CRYPTO.map(fetchOne)); }
export async function fetchForexQuotes()     { return Promise.all(TRACKED_FOREX.map(fetchOne)); }
export async function fetchCommodityQuotes() { return Promise.all(TRACKED_COMMODITIES.map(fetchOne)); }
