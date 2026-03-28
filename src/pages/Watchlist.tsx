// @ts-nocheck
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMarketData } from '@/lib/MarketDataContext'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Trash2, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Watchlist() {
  const { user } = useAuth()
  const { allLive: stocks } = useMarketData()
  const [items, setItems]     = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  async function load() {
    const { data } = await supabase.from('watchlists').select('*').eq('user_id', user.id).order('added_at', { ascending: false })
    setItems(data ?? [])
    setLoading(false)
  }

  useEffect(() => { if (user) load() }, [user])

  async function remove(id, symbol) {
    await supabase.from('watchlists').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
    toast({ title: `${symbol} removed from watchlist` })
  }

  const enriched = items.map(item => ({
    ...item,
    stock: stocks?.find(s => s.ticker === item.symbol)
  }))

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <p className="text-sm text-muted-foreground">Stocks you're watching · add from Market page</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-16 w-full rounded-xl"/>)}</div>
      ) : enriched.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Your watchlist is empty</p>
          <Button variant="outline" onClick={() => navigate('/market')}>Browse Market →</Button>
        </div>
      ) : (
        <div className="space-y-2">
          {enriched.map(({ id, symbol, name, stock }) => {
            const up = (stock?.change ?? 0) >= 0
            return (
              <div key={id} className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{stock?.icon ?? '📈'}</span>
                  <div>
                    <p className="font-semibold">{symbol}</p>
                    <p className="text-xs text-muted-foreground">{name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {stock ? (
                    <div className="text-right">
                      <p className="font-medium text-sm">${fmt(stock.price)}</p>
                      <span className={`text-xs font-semibold flex items-center gap-0.5 justify-end ${up?'text-green-500':'text-red-500'}`}>
                        {up?<TrendingUp className="h-3 w-3"/>:<TrendingDown className="h-3 w-3"/>}
                        {up?'+':''}{Number(stock.change).toFixed(2)}%
                      </span>
                    </div>
                  ) : (
                    <Skeleton className="h-8 w-20" />
                  )}
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-red-500" onClick={() => remove(id, symbol)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="sm" className="h-8 bg-orange-500 hover:bg-orange-600 text-white gap-1" onClick={() => navigate(`/trade/${symbol}`)}>
                      Trade <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}