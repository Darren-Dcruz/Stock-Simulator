import { useQuery } from '@tanstack/react-query';
import { fetchStockQuotes, hasFinnhubKey, TRACKED_STOCKS, MOCK_PRICES } from '@/api/stockService';

function getMockData() {
  return TRACKED_STOCKS.map(stock => ({
    ...stock,
    ...(MOCK_PRICES[stock.symbol] ?? { price: 100, change: 0 }),
    isMock: true,
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
    refetchInterval: 2 * 60 * 1000,
    staleTime:       60 * 1000,
    retry:           1,
  });
}
