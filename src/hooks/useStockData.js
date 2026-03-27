import { useQuery } from '@tanstack/react-query';
import { fetchStockQuotes, hasFinnhubKey, TRACKED_STOCKS } from '@/api/stockService';

// Realistic fallback prices shown when no Finnhub API key is configured
const MOCK_PRICES = {
  'NSE:RELIANCE':  { price: 1390.45, change:  0.38 },
  'NSE:SBIN':      { price:  500.80, change:  0.07 },
  'NSE:KOTAKBANK': { price: 2221.30, change:  1.42 },
  'NSE:AXISBANK':  { price: 1280.80, change:  1.10 },
  'NSE:POWERGRID': { price:  286.25, change: -0.15 },
  'NSE:TATASTEEL': { price:  169.90, change: -0.70 },
  'NSE:TCS':       { price: 3580.00, change:  0.55 },
  'NSE:HDFCBANK':  { price: 1724.60, change:  0.29 },
  'NSE:INFY':      { price: 1543.20, change: -0.18 },
  'NSE:WIPRO':     { price:  462.75, change:  0.62 },
};

function getMockData() {
  return TRACKED_STOCKS.map(stock => ({
    ...stock,
    ...(MOCK_PRICES[stock.symbol] ?? { price: 500, change: 0 }),
    changeAmount:  0,
    volume:        0,
    high:          0,
    low:           0,
    open:          0,
    previousClose: 0,
    isMock:        true,
  }));
}

/**
 * React Query hook for stock data.
 * - Fetches live data from Finnhub when VITE_FINNHUB_KEY is set
 * - Falls back to static demo prices otherwise
 * - Auto-refreshes every 2 minutes
 */
export function useStockData() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      if (!hasFinnhubKey()) return getMockData();
      try {
        return await fetchStockQuotes();
      } catch {
        return getMockData();
      }
    },
    refetchInterval: 2 * 60 * 1000,   // 2 minutes
    staleTime:       60 * 1000,        // consider fresh for 1 minute
    retry:           1,
  });
}
