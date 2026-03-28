import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMarketData } from '@/lib/MarketDataContext'
import { fetchCandles } from '@/api/stockService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, Wallet, PieChart, BarChart2 } from 'lucide-react'
import {
  PieChart as RePie, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const COLORS = ['#f97316','#3b82f6','#22c55e','#a855f7','#ef4444','#eab308','#06b6d4','#ec4899']
const STARTING_BALANCE = 1_000_000

function fmt(n: number) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Trade {
  id: string
  symbol: string
  type: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  created_at: string
}

interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avg_buy_price: number
}

interface BenchmarkPoint {
  date: string
  Portfolio: number
  'S&P 500': number
}

export default function Portfolio() {
  const { user, profile } = useAuth()
  const { allLive: stocks, isLoading: mktLoading } = useMarketData()
  const [holdings, setHoldings]     = useState<Holding[]>([])
  const [trades, setTrades]         = useState<Trade[]>([])
  const [spyCandles, setSpyCandles] = useState<{ date: string; close: number }[]>([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.from('holdings').select('*').eq('user_id', user.id),
      supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      fetchCandles('SPY', 30).catch(() => []),
    ]).then(([{ data: h }, { data: t }, candles]) => {
      setHoldings(h ?? [])
      setTrades(t ?? [])
      setSpyCandles((candles as { date: string; close: number }[]).length
        ? candles as { date: string; close: number }[]
        : [])
      setLoading(false)
    })
  }, [user])

  // Enrich holdings with current prices from Finnhub data
  const enriched = holdings.map(h => {
    const live         = stocks?.find(s => s.ticker === h.symbol)
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

  const pieData = enriched.map(h => ({ name: h.symbol, value: h.currentValue }))

  // ── Benchmark chart data ──────────────────────────────────────────────────
  const { benchmarkData, vsSpyPct } = useMemo<{
    benchmarkData: BenchmarkPoint[]
    vsSpyPct: number | null
  }>(() => {
    if (!spyCandles.length) return { benchmarkData: [], vsSpyPct: null }

    const spyBase  = spyCandles[0].close
    const spyFinal = spyCandles[spyCandles.length - 1].close
    const spyReturn = ((spyFinal - spyBase) / spyBase) * 100

    // Replay trades: walk through candle dates, compute cash + holdings value
    const points: BenchmarkPoint[] = spyCandles.map(({ date, close }) => {
      const candleTs = new Date(date).getTime()
      let cash = STARTING_BALANCE
      const position: Record<string, { qty: number; lastPrice: number }> = {}

      for (const t of trades) {
        if (new Date(t.created_at).getTime() > candleTs) break
        if (t.type === 'BUY') {
          cash -= t.total
          if (!position[t.symbol]) position[t.symbol] = { qty: 0, lastPrice: t.price }
          position[t.symbol].qty += t.quantity
          position[t.symbol].lastPrice = t.price
        } else {
          cash += t.total
          if (position[t.symbol]) {
            position[t.symbol].qty = Math.max(0, position[t.symbol].qty - t.quantity)
          }
        }
      }

      // Approximate holding values using current prices (not historical) as proxy
      const holdVal = Object.entries(position).reduce((sum, [sym, { qty, lastPrice }]) => {
        const live = stocks?.find(s => s.ticker === sym)
        return sum + qty * (live?.price ?? lastPrice)
      }, 0)

      const portValue = cash + holdVal
      const portNorm  = ((portValue - STARTING_BALANCE) / STARTING_BALANCE) * 100
      const spyNorm   = ((close - spyBase) / spyBase) * 100

      return { date, Portfolio: +portNorm.toFixed(2), 'S&P 500': +spyNorm.toFixed(2) }
    })

    const portFinal = points[points.length - 1]?.Portfolio ?? 0
    return { benchmarkData: points, vsSpyPct: +(portFinal - spyReturn).toFixed(2) }
  }, [spyCandles, trades, stocks, profile])

  const portfolioReturn = ((totalValue - STARTING_BALANCE) / STARTING_BALANCE) * 100

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <p className="text-sm text-muted-foreground">Your virtual investment portfolio</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Value',    value: `$${fmt(totalValue)}`,                       icon: Wallet,      color: 'text-orange-500' },
          { label: 'Cash Balance',   value: `$${fmt(profile?.virtual_balance ?? 0)}`,     icon: Wallet,      color: 'text-blue-500'   },
          { label: 'Holdings Value', value: `$${fmt(holdingsValue)}`,                    icon: PieChart,    color: 'text-purple-500' },
          {
            label: 'Total P&L',
            value: `${totalPnl >= 0 ? '+' : ''}$${fmt(Math.abs(totalPnl))}`,
            sub: `${totalPnlPct >= 0 ? '+' : ''}${totalPnlPct.toFixed(2)}%`,
            icon: totalPnl >= 0 ? TrendingUp : TrendingDown,
            color: totalPnl >= 0 ? 'text-green-500' : 'text-red-500',
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

      {/* ── Benchmark chart ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
              Portfolio vs S&P 500 (30 days)
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-semibold ${portfolioReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                You: {portfolioReturn >= 0 ? '+' : ''}{portfolioReturn.toFixed(2)}%
              </span>
              {vsSpyPct !== null && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  vsSpyPct >= 0
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                }`}>
                  {vsSpyPct >= 0 ? '+' : ''}{vsSpyPct.toFixed(2)}% vs SPY
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : benchmarkData.length < 2 ? (
            <p className="text-sm text-muted-foreground text-center py-10">
              Make your first trade to see portfolio vs S&P 500 comparison
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={benchmarkData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval={Math.floor(benchmarkData.length / 5)}
                />
                <YAxis
                  tickFormatter={v => `${v > 0 ? '+' : ''}${v}%`}
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={52}
                />
                <Tooltip
                  formatter={(v: number, name: string) => [`${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, name]}
                  labelStyle={{ fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="Portfolio"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="S&P 500"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  strokeDasharray="4 2"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

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
                      <Tooltip formatter={(v: number) => `$${fmt(v)}`} />
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
