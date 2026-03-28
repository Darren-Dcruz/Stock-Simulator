// ─── Core domain types for StockSim Academy ──────────────────────────────────

/** A tradeable instrument (stock, ETF, crypto, forex, or commodity) */
export interface Instrument {
  symbol: string;
  ticker: string;
  name: string;
  icon: string;
  logo?: string;
  sector: string;
  assetType: 'stock' | 'etf' | 'crypto' | 'forex' | 'commodity';
}

/** Live price data returned from Finnhub */
export interface Quote {
  price: number;
  change: number;        // % change
  changeAmount: number;  // $ change
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

/** An instrument enriched with live price data */
export type LiveInstrument = Instrument & Quote & { isMock?: boolean };

/** A single OHLCV candle for charts */
export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/** A trade record stored in Supabase */
export interface Trade {
  id: string;
  user_id: string;
  symbol: string;
  ticker: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  total: number;
  created_at: string;
}

/** A current holding position in the user's portfolio */
export interface Holding {
  id: string;
  user_id: string;
  symbol: string;
  ticker: string;
  name: string;
  quantity: number;
  avg_buy_price: number;
}

/** A user profile with virtual balance */
export interface Profile {
  id: string;
  email: string;
  username?: string | null;
  virtual_balance: number;
  created_at: string;
}

/** A user-defined price alert */
export interface PriceAlert {
  id: string;
  user_id: string;
  symbol: string;
  ticker: string;
  name: string;
  target_price: number;
  direction: 'above' | 'below';
  triggered: boolean;
  created_at: string;
}

/** A news article returned from Finnhub */
export interface NewsArticle {
  id?: number;
  headline: string;
  summary?: string;
  url: string;
  source: string;
  datetime: number;
  image?: string;
  category?: string;
}

/** A row in the user's watchlist */
export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  added_at: string;
}

/** A row from the leaderboard view */
export interface LeaderboardRow {
  id: string;
  username: string | null;
  cash_balance: number;
  holdings_value: number;
  total_value: number;
}

/** Company profile data from Finnhub */
export interface FinnhubProfile {
  name?: string;
  finnhubIndustry?: string;
  exchange?: string;
  ipo?: string;
  marketCapitalization?: number;
  weburl?: string;
  logo?: string;
  country?: string;
  currency?: string;
}

/** Result of SMA trend analysis */
export interface TrendResult {
  trend: 'Uptrend' | 'Downtrend' | 'Neutral';
  sma20: number | null;
  sma50: number | null;
}

/** A message in the AI chat panel */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
