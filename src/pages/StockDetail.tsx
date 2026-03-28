import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { fetchQuote, fetchCandles, fetchProfile, ALL_INSTRUMENTS, MOCK_PRICES, generateMockCandles } from '@/api/stockService'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, TrendingUp, TrendingDown, BookmarkPlus, ArrowLeftRight, Globe, Building2, Bell, Trash2 } from 'lucide-react'
import AssetLogo from '@/components/AssetLogo'
import { useToast } from '@/components/ui/use-toast'
import { createAlert, deleteAlert, getUserAlerts } from '@/lib/alertService'

const RANGES = [
  { label: '1W', days: 7   },
  { label: '1M', days: 30  },
  { label: '3M', days: 90  },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
]

function calcTrend(candles) {
  if (!candles || candles.length < 20) return null
  const closes = candles.map(c => c.close)
  const sma20   = closes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const sma50   = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null
  const current = closes.at(-1)
  if (sma50) {
    if (current > sma20 && sma20 > sma50) return { label: 'Strong Uptrend',   color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Price is above both the 20-day and 50-day moving averages — bullish momentum.' }
    if (current < sma20 && sma20 < sma50) return { label: 'Strong Downtrend', color: 'text-red-500',   bg: 'bg-red-500/10',   desc: 'Price is below both the 20-day and 50-day moving averages — bearish momentum.' }
  }
  if (current > sma20) return { label: 'Uptrend',   color: 'text-green-500', bg: 'bg-green-500/10', desc: 'Price is trading above the 20-day moving average.' }
  return               { label: 'Downtrend', color: 'text-red-500',   bg: 'bg-red-500/10',   desc: 'Price is trading below the 20-day moving average.' }
}

function fmt(n, decimals = 2) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function StatCard({ label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="font-semibold text-sm">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  )
}

export default function StockDetail() {
  const { symbol }   = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()
  const { toast }    = useToast()

  const [range, setRange]           = useState(RANGES[1])
  const [quote, setQuote]           = useState(null)
  const [candles, setCandles]       = useState([])
  const [profile, setProfile]       = useState(null)
  const [loading, setLoading]       = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [alerts, setAlerts]         = useState([])
  const [alertPrice, setAlertPrice] = useState('')
  const [alertDir, setAlertDir]     = useState('above')
  const [alertSaving, setAlertSaving] = useState(false)

  const meta          = ALL_INSTRUMENTS.find(s => s.ticker === symbol)
  const finnhubSymbol = meta?.symbol ?? symbol
  const isUp          = (quote?.change ?? 0) >= 0
  const chartColor    = isUp ? '#22c55e' : '#ef4444'
  const minVal        = candles.length ? Math.min(...candles.map(c => c.close)) * 0.997 : 0
  const maxVal        = candles.length ? Math.max(...candles.map(c => c.close)) * 1.003 : 0

  // Initial load: quote + profile + chart
  useEffect(() => {
    if (!symbol) return
    setLoading(true)
    Promise.allSettled([
      fetchQuote(finnhubSymbol),
      fetchProfile(finnhubSymbol),
      fetchCandles(finnhubSymbol, range.days),
    ]).then(([q, p, c]) => {
      const mockQ = MOCK_PRICES[finnhubSymbol]
      setQuote(q.status === 'fulfilled' ? q.value : mockQ ?? null)
      if (p.status === 'fulfilled') setProfile(p.value)
      const liveCandles = c.status === 'fulfilled' ? c.value : []
      setCandles(liveCandles.length > 0 ? liveCandles : generateMockCandles(finnhubSymbol, range.days))
      setLoading(false)
    })
  }, [symbol])

  // Range change: reload chart only
  useEffect(() => {
    if (!symbol || loading) return
    setChartLoading(true)
    fetchCandles(finnhubSymbol, range.days)
      .then(c => setCandles(c.length > 0 ? c : generateMockCandles(finnhubSymbol, range.days)))
      .catch(() => setCandles(generateMockCandles(finnhubSymbol, range.days)))
      .finally(() => setChartLoading(false))
  }, [range])

  useEffect(() => {
    if (!user) return
    getUserAlerts(user.id).then(data => setAlerts(data.filter(a => a.symbol === symbol)))
  }, [user, symbol])

  async function saveAlert() {
    if (!alertPrice || !user) return
    setAlertSaving(true)
    try {
      const a = await createAlert({
        userId: user.id, symbol, name: meta?.name ?? symbol,
        targetPrice: parseFloat(alertPrice), direction: alertDir,
      })
      setAlerts(prev => [a, ...prev])
      setAlertPrice('')
      toast({ title: 'Alert set', description: `Alert when ${symbol} goes ${alertDir} $${alertPrice}` })
    } catch (err) {
      toast({ title: 'Failed to create alert', description: err.message, variant: 'destructive' })
    }
    setAlertSaving(false)
  }

  async function removeAlert(id) {
    await deleteAlert(id)
    setAlerts(prev => prev.filter(a => a.id !== id))
    toast({ title: 'Alert removed' })
  }

  async function addToWatchlist() {
    if (!user) return
    const { error } = await supabase.from('watchlists').upsert(
      { user_id: user.id, symbol, name: meta?.name ?? symbol },
      { onConflict: 'user_id,symbol' }
    )
    if (error) toast({ title: 'Already in watchlist', variant: 'destructive' })
    else toast({ title: `${symbol} added to watchlist ✓` })
  }

  const trend = calcTrend(candles)

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <AssetLogo logo={meta?.logo} icon={meta?.icon ?? '📈'} name={meta?.name ?? symbol} className="w-14 h-14 text-3xl" />
          <div>
            <h1 className="text-2xl font-bold">{symbol}</h1>
            <p className="text-muted-foreground text-sm">{meta?.name ?? profile?.name ?? symbol}</p>
            {meta?.sector && <span className="text-xs bg-muted px-2 py-0.5 rounded-full mt-1 inline-block">{meta.sector}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={addToWatchlist}>
            <BookmarkPlus className="h-4 w-4" /> Watchlist
          </Button>
          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5" onClick={() => navigate(`/trade/${symbol}`)}>
            <ArrowLeftRight className="h-4 w-4" /> Trade
          </Button>
        </div>
      </div>

      {/* Live price */}
      {loading ? (
        <div className="space-y-2"><Skeleton className="h-12 w-52" /><Skeleton className="h-6 w-40" /></div>
      ) : quote ? (
        <div>
          <p className="text-5xl font-bold tracking-tight">${fmt(quote.price)}</p>
          <span className={`inline-flex items-center gap-1.5 text-base font-semibold mt-2 px-3 py-1 rounded-full ${isUp ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {isUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isUp ? '+' : ''}${fmt(Math.abs(quote.changeAmount))}  ({isUp ? '+' : ''}{Number(quote.change).toFixed(2)}%)  today
          </span>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Price data unavailable — check your Finnhub API key</p>
      )}

      {/* Price chart */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">Price History</p>
            <div className="flex gap-1">
              {RANGES.map(r => (
                <button key={r.label} onClick={() => setRange(r)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    range.label === r.label
                      ? 'bg-orange-500 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >{r.label}</button>
              ))}
            </div>
          </div>

          {chartLoading || loading ? (
            <Skeleton className="h-64 w-full rounded-lg" />
          ) : candles.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={candles} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={chartColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis
                  domain={[minVal, maxVal]}
                  tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                  width={72}
                />
                <Tooltip
                  formatter={v => [`$${fmt(v)}`, 'Close']}
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="close" stroke={chartColor} strokeWidth={2.5} fill="url(#grad)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <p className="text-sm">Chart data not available for this stock on free tier</p>
              <p className="text-xs">Current price and stats are still live below</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {quote && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Open"        value={`$${fmt(quote.open)}`} />
          <StatCard label="Day's High"  value={`$${fmt(quote.high)}`} />
          <StatCard label="Day's Low"   value={`$${fmt(quote.low)}`} />
          <StatCard label="Prev Close"  value={`$${fmt(quote.previousClose)}`} />
        </div>
      )}

      {/* Price Alerts */}
      {user && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> Price Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <div className="flex rounded-md border overflow-hidden text-sm">
                {['above','below'].map(d => (
                  <button key={d} onClick={() => setAlertDir(d)}
                    className={`px-3 py-2 font-medium capitalize transition-colors ${alertDir === d ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:bg-muted'}`}
                  >{d}</button>
                ))}
              </div>
              <Input
                type="number" min="0" step="any" placeholder="Target price"
                value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                className="w-36"
              />
              <Button
                onClick={saveAlert}
                disabled={alertSaving || !alertPrice}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                {alertSaving ? 'Saving…' : 'Set Alert'}
              </Button>
            </div>
            {alerts.length > 0 && (
              <div className="space-y-2">
                {alerts.map(a => (
                  <div key={a.id} className="flex items-center justify-between text-sm rounded-lg border px-3 py-2">
                    <span>
                      Notify when <strong>{a.symbol}</strong> goes{' '}
                      <span className={a.direction === 'above' ? 'text-green-500' : 'text-red-500'}>{a.direction}</span>{' '}
                      <strong>${Number(a.target_price).toFixed(2)}</strong>
                    </span>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-red-500" onClick={() => removeAlert(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Trend analysis */}
      {trend && (
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Trend Analysis</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-bold ${trend.bg} ${trend.color}`}>
              {trend.label.includes('Up')
                ? <TrendingUp className="h-5 w-5" />
                : <TrendingDown className="h-5 w-5" />}
              {trend.label}
            </div>
            <p className="text-sm text-muted-foreground">{trend.desc}</p>
            <div className="grid grid-cols-2 gap-3 pt-1">
              {candles.length >= 20 && (() => {
                const closes = candles.map(c => c.close)
                const sma20  = closes.slice(-20).reduce((a, b) => a + b, 0) / 20
                const sma50  = closes.length >= 50 ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50 : null
                return <>
                  <StatCard label="20-Day SMA" value={`$${fmt(sma20)}`} />
                  {sma50 && <StatCard label="50-Day SMA" value={`$${fmt(sma50)}`} />}
                </>
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* About */}
      {profile?.name && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" /> About {profile.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: 'Industry',   value: profile.finnhubIndustry },
                { label: 'Exchange',   value: profile.exchange },
                { label: 'Country',    value: profile.country },
                { label: 'Currency',   value: profile.currency },
                { label: 'IPO Year',   value: profile.ipo ? new Date(profile.ipo).getFullYear() : null },
                { label: 'Market Cap', value: profile.marketCapitalization ? `$${(profile.marketCapitalization / 1000).toFixed(2)}B` : null },
              ].filter(r => r.value).map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="font-semibold mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {profile.weburl && (
              <a href={profile.weburl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-orange-500 hover:underline">
                <Globe className="h-3.5 w-3.5" /> {profile.weburl}
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
