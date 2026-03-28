import { useQuery } from '@tanstack/react-query';
import { fetchMarketNews, hasFinnhubKey } from '@/api/stockService';

export function useMarketNews(category = 'general') {
  return useQuery({
    queryKey: ['news', category],
    queryFn: async () => {
      if (!hasFinnhubKey()) return [];
      return fetchMarketNews(category);
    },
    refetchInterval:      15 * 60 * 1000, // 15 min
    staleTime:            10 * 60 * 1000,
    retry:                1,
    refetchOnWindowFocus: false,
  });
}
