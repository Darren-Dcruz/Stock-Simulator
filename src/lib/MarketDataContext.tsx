import { createContext, useContext, useEffect, type ReactNode } from 'react'
import { useStockData, useETFData, useCryptoData, useForexData, useCommodityData } from '@/hooks/useStockData'
import { useAuth } from '@/lib/AuthContext'
import { useToast } from '@/components/ui/use-toast'
import { checkAlerts } from '@/lib/alertService'
import type { LiveInstrument } from '@/types'

interface MarketDataContextValue {
  allLive: LiveInstrument[]
  stocks:      LiveInstrument[] | undefined
  etfs:        LiveInstrument[] | undefined
  crypto:      LiveInstrument[] | undefined
  forex:       LiveInstrument[] | undefined
  commodities: LiveInstrument[] | undefined
  isLoading: boolean
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null)

/**
 * Single provider that fetches all 5 asset classes once at the app level.
 * All pages share the same React Query cache — no duplicate Finnhub calls.
 * Also checks price alerts each time live data refreshes.
 */
export function MarketDataProvider({ children }: { children: ReactNode }) {
  const { data: stocks,      isLoading: loadStocks }  = useStockData()
  const { data: etfs,        isLoading: loadETFs }    = useETFData()
  const { data: crypto,      isLoading: loadCrypto }  = useCryptoData()
  const { data: forex,       isLoading: loadForex }   = useForexData()
  const { data: commodities, isLoading: loadCommod }  = useCommodityData()
  const { user } = useAuth()
  const { toast } = useToast()

  const allLive: LiveInstrument[] = [
    ...(stocks      ?? []),
    ...(etfs        ?? []),
    ...(crypto      ?? []),
    ...(forex       ?? []),
    ...(commodities ?? []),
  ]

  const isLoading = loadStocks || loadETFs || loadCrypto || loadForex || loadCommod

  useEffect(() => {
    if (!user || isLoading || !allLive.length) return
    checkAlerts(user.id, allLive).then(triggered => {
      triggered.forEach(alert => {
        toast({
          title: `Price Alert: ${alert.symbol}`,
          description: `${alert.symbol} is now $${Number(alert.currentPrice).toFixed(2)} — ${alert.direction} your target of $${Number(alert.target_price).toFixed(2)}`,
        })
      })
    }).catch(() => {})
  }, [allLive.length, isLoading])

  return (
    <MarketDataContext.Provider value={{ allLive, stocks, etfs, crypto, forex, commodities, isLoading }}>
      {children}
    </MarketDataContext.Provider>
  )
}

export function useMarketData(): MarketDataContextValue {
  const ctx = useContext(MarketDataContext)
  if (!ctx) throw new Error('useMarketData must be used inside <MarketDataProvider>')
  return ctx
}
