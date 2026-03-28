import { useQuery } from '@tanstack/react-query'
import type { UseQueryResult } from '@tanstack/react-query'
import {
  hasFinnhubKey, MOCK_PRICES,
  TRACKED_STOCKS, TRACKED_ETFS, TRACKED_CRYPTO, TRACKED_FOREX, TRACKED_COMMODITIES,
  fetchStockQuotes, fetchETFQuotes, fetchCryptoQuotes, fetchForexQuotes, fetchCommodityQuotes,
} from '@/api/stockService'
import type { Instrument, LiveInstrument } from '@/types'

function mockFor(instruments: Instrument[]): LiveInstrument[] {
  return instruments.map(inst => ({
    ...inst,
    logo: inst.logo ?? '',
    ...(MOCK_PRICES[inst.symbol as keyof typeof MOCK_PRICES] ?? {
      price: 0, change: 0, changeAmount: 0, high: 0, low: 0, open: 0, previousClose: 0,
    }),
    isMock: true,
  }))
}

function makeHook(
  queryKey: string,
  instruments: Instrument[],
  fetcher: () => Promise<LiveInstrument[]>,
): () => UseQueryResult<LiveInstrument[]> {
  return function useAssetData() {
    return useQuery<LiveInstrument[]>({
      queryKey: [queryKey],
      queryFn: async () => {
        if (!hasFinnhubKey()) return mockFor(instruments)
        try { return await fetcher() }
        catch { return mockFor(instruments) }
      },
      refetchInterval:        2 * 60 * 1000,
      staleTime:              60 * 1000,
      retry:                  1,
      refetchOnWindowFocus:   false,
    })
  }
}

export const useStockData     = makeHook('stocks',      TRACKED_STOCKS,      fetchStockQuotes)
export const useETFData       = makeHook('etfs',        TRACKED_ETFS,        fetchETFQuotes)
export const useCryptoData    = makeHook('crypto',      TRACKED_CRYPTO,      fetchCryptoQuotes)
export const useForexData     = makeHook('forex',       TRACKED_FOREX,       fetchForexQuotes)
export const useCommodityData = makeHook('commodities', TRACKED_COMMODITIES, fetchCommodityQuotes)
