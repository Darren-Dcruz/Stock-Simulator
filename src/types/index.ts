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
  side: 'BUY' | 'SELL';
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
  balance: number;
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
