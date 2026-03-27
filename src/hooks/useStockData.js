import { useQuery } from '@tanstack/react-query';
import { fetchStockQuotes, TRACKED_STOCKS } from '@/api/stockService';

// Realistic fallback data used when API is unavailable
const MOCK_PRICES = {
  'RELIANCE.NS':  { price: 1390.45, change:  0.38 },
  'SBIN.NS':      { price:  500.80, change:  0.07 },
  'KOTAKBANK.NS': { price: 2221.30, change:  1.42 },
  'AXISBANK.NS':  { price: 1280.80, change:  1.10 },
  'POWERGRID.NS': { price:  286.25, change: -0.15 },
  'TATASTEEL.NS': { price:  169.90, change: -0.70 },
  'TCS.NS':       { price: 3580.00, change:  0.55 },
  'HDFCBANK.NS':  { price: 1724.60, change:  0.29 },
  'INFY.NS':      { price: 1543.20, change: -0.18 },
  'WIPRO.NS':     { price:  462.75, change:  0.62 },
};

function getMockData() {
  return TRACKED_STOCKS.map(stock => ({
    ...stock,
    ...(MOCK_PRICES[stock.symbol] ?? { price: 500, change: 0 }),
    changeAmount: 0,
    volume: Math.floor(Math.random() * 5_000_000 + 500_000),
    high: 0,
    low: 0,
    open: 0,
    isMock: true,
  }));
}

export function useStockData() {
  return useQuery({
    queryKey: ['stocks'],
    queryFn: async () => {
      try {
        const data = await fetchStockQuotes();
        return data.length > 0 ? data : getMockData();
      } catch {
        return getMockData();
      }
    },
    refetchInterval: 60_000,   // live refresh every 60 s
    staleTime: 30_000,
    retry: 1,
  });
}
