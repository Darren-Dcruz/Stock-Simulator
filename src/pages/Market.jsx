import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStockData } from '@/hooks/useStockData'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Search, BookmarkPlus, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { US_INDICES } from '@/api/stockService'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtIndex(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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
              <p className="font-bold text-sm">{fmtIndex(idx.mockPrice)}</p>
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

export default function Market() {
  const { data: stocks, isLoading, isFetching, refetch } = useStockData()
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const filtered = useMemo(() =>
    stocks?.filter(s =>
      s.ticker.toLowerCase().includes(search.toLowerCase()) ||
      s.name.toLowerCase().includes(search.toLowerCase())
    ) ?? []
  , [stocks, search])

  async function addWatch(stock) {
    const { error } = await supabase.from('watchlists').upsert(
      { user_id: user.id, symbol: stock.ticker, name: stock.name },
      { onConflict: 'user_id,symbol' }
    )
    if (error) toast({ title: 'Already in watchlist', variant: 'destructive' })
    else toast({ title: `${stock.ticker} added to watchlist` })
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Market</h1>
          <p className="text-sm text-muted-foreground">NYSE / NASDAQ live prices · updates every 2 min</p>
        </div>
        <button onClick={() => refetch()} disabled={isFetching} className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
          {isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* US Market Indices */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">US Market Indices</p>
        <IndicesBar />
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search ticker or company…" className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {['Stock', 'Price ($)', 'Change', 'High', 'Low', ''].map(h => (
                <th key={h} className={`px-4 py-3 text-xs font-medium text-muted-foreground ${h === 'Stock' ? 'text-left' : 'text-right'} ${['High','Low'].includes(h) ? 'hidden md:table-cell' : ''}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
              : filtered.map(stock => {
                  const up = stock.change >= 0
                  return (
                    <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{stock.icon}</span>
                          <div>
                            <p className="font-semibold">{stock.ticker}</p>
                            <p className="text-xs text-muted-foreground">{stock.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">${fmt(stock.price)}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex items-center gap-1 font-semibold ${up ? 'text-green-500' : 'text-red-500'}`}>
                          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {up ? '+' : ''}{Number(stock.change).toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">${fmt(stock.high)}</td>
                      <td className="px-4 py-3 text-right text-muted-foreground hidden md:table-cell">${fmt(stock.low)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => addWatch(stock)} title="Add to watchlist">
                            <BookmarkPlus className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" className="h-7" onClick={() => navigate(`/stock/${stock.ticker}`)}>
                            Details
                          </Button>
                          <Button size="sm" className="h-7 bg-orange-500 hover:bg-orange-600 text-white gap-1" onClick={() => navigate(`/trade/${stock.ticker}`)}>
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
        {!isLoading && filtered.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">No stocks match "{search}"</p>
        )}
      </div>
    </div>
  )
}
