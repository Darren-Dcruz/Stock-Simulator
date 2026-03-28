import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMarketData } from '@/lib/MarketDataContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react'
import { PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#ef4444','#eab308','#06b6d4','#ec4899']

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Portfolio() {
  const { user, profile } = useAuth()
  const { allLive: stocks, isLoading: mktLoading } = useMarketData()
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading]   = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    supabase.from('holdings').select('*').eq('user_id', user.id)
      .then(({ data }) => { setHoldings(data ?? []); setLoading(false) })
  }, [user])

  // Enrich holdings with current prices from Finnhub data
  const enriched = holdings.map(h => {
    const live = stocks?.find(s => s.ticker === h.symbol)
    const currentPrice = live?.price ?? h.avg_buy_price
    const currentValue = currentPrice * h.quantity
    const costBasis    = h.avg_buy_price * h.quantity
    const pnl          = currentValue - costBasis
    const pnlPct       = costBasis > 0 ? (pnl / costBasis) * 100 : 0
    return { ...h, currentPrice, currentValue, costBasis, pnl, pnlPct }
  })

  const holdingsValue = enriched.reduce((s, h) => s + h.currentValue, 0)
  const totalCost     = enriched.reduce((s, h) => s + h.costBasis, 0)
  const totalPnl      = holdingsValue - totalCost
  const totalPnlPct   = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0
  const totalValue    = holdingsValue + (profile?.virtual_balance ?? 0)
  const startingBal   = 1_000_000

  const pieData = enriched.map(h => ({ name: h.symbol, value: h.currentValue }))

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Your virtual investment portfolio</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Value',     value: `$${fmt(totalValue)}`,                      icon: Wallet,      color: 'text-orange-500' },
          { label: 'Cash Balance',    value: `$${fmt(profile?.virtual_balance ?? 0)}`,    icon: Wallet,      color: 'text-blue-500'   },
          { label: 'Holdings Value',  value: `$${fmt(holdingsValue)}`,                   icon: PieChart,    color: 'text-purple-500' },
          { label: 'Total P&L',
            value: `${totalPnl >= 0 ? '+' : ''}$${fmt(Math.abs(totalPnl))}`,
            sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
            icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
            color: totalPnl >= 0 ? 'text-green-500' : 'text-red-500'
          },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <p className="text-lg font-bold leading-tight">{value}</p>
              {sub && <p className={`text-xs mt-0.5 font-medium ${color}`}>{sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Holdings table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Holdings</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">{Array.from({length:4}).map((_,i)=><Skeleton key={i} className="h-10 w-full"/>)}</div>
              ) : enriched.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="mb-3">No holdings yet</p>
                  <Button variant="outline" onClick={() => navigate('/market')}>Go to Market →</Button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40">
                      {['Stock','Qty','Avg Cost','Current','P&L'].map(h=>(
                        <th key={h} className={`px-4 py-2.5 text-xs font-medium text-muted-foreground ${h==='Stock'?'text-left':'text-right'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {enriched.map(h=>(
                      <tr key={h.id} className="hover:bg-muted/30 cursor-pointer" onClick={()=>navigate(`/trade/${h.symbol}`)}>
                        <td className="px-4 py-3 font-semibold">{h.symbol}</td>
                        <td className="px-4 py-3 text-right">{h.quantity}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">${fmt(h.avg_buy_price)}</td>
                        <td className="px-4 py-3 text-right">${fmt(h.currentPrice)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={h.pnl>=0?'text-green-500':'text-red-500'}>
                            {h.pnl>=0?'+':''}{h.pnlPct.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pie chart */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Allocation</CardTitle></CardHeader>
            <CardContent>
              {(loading || mktLoading) ? (
                <div className="flex flex-col items-center gap-3 py-4">
                  <Skeleton className="w-[160px] h-[160px] rounded-full" />
                  <div className="w-full space-y-2">
                    {Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
                  </div>
                </div>
              ) : enriched.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No holdings</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <RePie>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `$${fmt(v)}`} />
                    </RePie>
                  </ResponsiveContainer>
                  <div className="space-y-1.5 mt-2">
                    {enriched.map((h, i) => (
                      <div key={h.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: COLORS[i%COLORS.length]}} />
                          <span>{h.symbol}</span>
                        </div>
                        <span className="text-muted-foreground">{holdingsValue > 0 ? ((h.currentValue/holdingsValue)*100).toFixed(1) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
