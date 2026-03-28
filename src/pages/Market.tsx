// @ts-nocheck
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, BookmarkPlus, ArrowRight } from 'lucide-react'
import AssetLogo from '@/components/AssetLogo'
import { useToast } from '@/components/ui/use-toast'
import { US_INDICES, getMarketStatus } from '@/api/stockService'
import { useMarketData } from '@/lib/MarketDataContext'

const TABS = [
  { id: 'stocks',      label: 'Stocks',       emoji: '📈' },
  { id: 'etfs',        label: 'ETFs',         emoji: '📊' },
  { id: 'crypto',      label: 'Crypto',       emoji: '₿'  },
  { id: 'forex',       label: 'Forex',        emoji: '💱' },
  { id: 'commodities', label: 'Commodities',  emoji: '🛢' },
]

function fmtPrice(price, assetType) {
  if (assetType === 'forex') {
    return Number(price).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }
  if (assetType === 'crypto' && price < 1) {
    return Number(price).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }
  return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function MarketStatusBadge() {
  const status = getMarketStatus()
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
      status.open ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-muted-foreground'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status.open ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
      {status.label}
    </span>
  )
}

function IndicesBar() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {US_INDICES.map(idx => {
        const up = idx.mockChange >= 0
        return (
          <div key={idx.symbol} className="flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border bg-card">
            <div>
              <p className="text-xs text-muted-foreground">{idx.label}</p>
              <p className="font-bold text-sm">{Number(idx.mockPrice).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? 'text-green-500' : 'text-red-500'}`}>
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {up ? '+' : ''}{idx.mockChange.toFixed(2)}%
            </span>
          </div>
        )
      })}
    </div>
  )
}

function AssetTable({ assets, isLoading, assetType, onWatch, onTrade, onDetails, showDetails = true }) {
  const isCrypto = assetType === 'crypto'
  const isForex  = assetType === 'forex'

  return (
    <div className="rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-left">Asset</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">{isForex ? 'Rate' : isCrypto ? 'Price (USD)' : 'Price ($)'}</th>
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right">Change</th>
            {!isForex && <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right hidden md:table-cell">High</th>}
            {!isForex && <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right hidden md:table-cell">Low</th>}
            <th className="px-4 py-3 text-xs font-medium text-muted-foreground text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                  ))}
                </tr>
              ))
            : (assets ?? []).map(asset => {
                const up = (asset.change ?? 0) >= 0
                return (
                  <tr key={asset.symbol} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <AssetLogo logo={asset.logo} icon={asset.icon} name={asset.name} className="w-8 h-8 text-sm" />
                        <div>
                          <p className="font-semibold">{asset.ticker}</p>
                          <p className="text-xs text-muted-foreground">{asset.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{isForex ? '' : '$'}{fmtPrice(asset.price, assetType)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
                        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {up ? '+' : ''}{Number(asset.change).toFixed(2)}%
                      </span>
                    </td>
                    {!isForex && <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{asset.high > 0 ? `$${fmtPrice(asset.high, assetType)}` : '—'}</td>}
                    {!isForex && <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">{asset.low > 0 ? `$${fmtPrice(asset.low, assetType)}` : '—'}</td>}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onWatch(asset)} title="Add to watchlist">
                          <BookmarkPlus className="h-4 w-4" />
                        </Button>
                        {showDetails && (
                          <Button size="sm" variant="outline" className="h-7" onClick={() => onDetails(asset)}>Details</Button>
                        )}
                        <Button size="sm" className="h-7 bg-orange-500 hover:bg-orange-600 text-white gap-1" onClick={() => onTrade(asset)}>
                          Trade <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
          }
        </tbody>
      </table>
    </div>
  )
}

export default function Market() {
  const [tab, setTab]       = useState('stocks')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')   // 'all' | 'gainers' | 'losers'
  const [sort, setSort]     = useState('default') // 'default' | 'name' | 'price_asc' | 'price_desc' | 'change_asc' | 'change_desc'
  const { user } = useAuth()
  const navigate  = useNavigate()
  const { toast } = useToast()

  const { stocks, etfs, crypto, forex, commodities, isLoading: mktLoading } = useMarketData()
  const loadStocks = mktLoading, loadETFs = mktLoading, loadCrypto = mktLoading
  const loadForex  = mktLoading, loadCommod = mktLoading

  async function addWatch(asset) {
    const { error } = await supabase.from('watchlists').upsert(
      { user_id: user.id, symbol: asset.ticker, name: asset.name },
      { onConflict: 'user_id,symbol' }
    )
    if (error) toast({ title: 'Already in watchlist', variant: 'destructive' })
    else toast({ title: `${asset.ticker} added to watchlist` })
  }

  const tabData = {
    stocks:      { assets: stocks,      loading: loadStocks,  type: 'stock'     },
    etfs:        { assets: etfs,        loading: loadETFs,    type: 'etf'       },
    crypto:      { assets: crypto,      loading: loadCrypto,  type: 'crypto'    },
    forex:       { assets: forex,       loading: loadForex,   type: 'forex'     },
    commodities: { assets: commodities, loading: loadCommod,  type: 'commodity' },
  }
  const current = tabData[tab]

  const filteredAssets = useMemo(() => {
    let list = current.assets ?? []
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(a => a.ticker.toLowerCase().includes(q) || a.name.toLowerCase().includes(q))
    }
    if (filter === 'gainers') list = list.filter(a => (a.change ?? 0) >= 0)
    if (filter === 'losers')  list = list.filter(a => (a.change ?? 0) < 0)
    if (sort === 'name')         list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'price_asc')    list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price_desc')   list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'change_asc')   list = [...list].sort((a, b) => a.change - b.change)
    if (sort === 'change_desc')  list = [...list].sort((a, b) => b.change - a.change)
    return list
  }, [current.assets, search, filter, sort])

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
          <p className="text-sm text-muted-foreground">NYSE / NASDAQ · Binance · OANDA · updates every 2 min</p>
        </div>
        <MarketStatusBadge />
      </div>

      {/* US Indices */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">US Market Indices</p>
        <IndicesBar />
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-orange-500 text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {/* Screener controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder="Search by ticker or name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-[180px] rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex rounded-md border overflow-hidden text-sm">
          {[['all','All'],['gainers','Gainers'],['losers','Losers']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-2 font-medium transition-colors ${filter === v ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >{l}</button>
          ))}
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <option value="default">Sort: Default</option>
          <option value="name">Name A–Z</option>
          <option value="price_desc">Price: High → Low</option>
          <option value="price_asc">Price: Low → High</option>
          <option value="change_desc">Change: Best first</option>
          <option value="change_asc">Change: Worst first</option>
        </select>
      </div>

      {/* Table */}
      <AssetTable
        assets={filteredAssets}
        isLoading={current.loading}
        assetType={current.type}
        onWatch={addWatch}
        onDetails={asset => navigate(`/stock/${asset.ticker}`)}
        onTrade={asset => navigate(`/trade/${asset.ticker}`)}
        showDetails={tab !== 'forex'}
      />
    </div>
  )
}