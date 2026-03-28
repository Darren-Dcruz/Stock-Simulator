import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Holding } from '@/types'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { executeTrade } from '@/lib/tradeService'
import { ALL_INSTRUMENTS, TRACKED_STOCKS, TRACKED_ETFS, TRACKED_CRYPTO, TRACKED_FOREX, TRACKED_COMMODITIES } from '@/api/stockService'
import { useMarketData } from '@/lib/MarketDataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ArrowRight, Loader2, DollarSign } from 'lucide-react'
import AssetLogo from '@/components/AssetLogo'
import { useToast } from '@/components/ui/use-toast'

function fmtPrice(price: number, assetType: string | undefined) {
  if (assetType === 'forex' || (assetType === 'crypto' && price < 1)) {
    return Number(price).toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 })
  }
  return Number(price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const GROUPS = [
  { label: 'Stocks',      instruments: TRACKED_STOCKS      },
  { label: 'ETFs',        instruments: TRACKED_ETFS        },
  { label: 'Crypto',      instruments: TRACKED_CRYPTO      },
  { label: 'Forex',       instruments: TRACKED_FOREX       },
  { label: 'Commodities', instruments: TRACKED_COMMODITIES },
]

export default function Trade() {
  const { symbol: paramSymbol } = useParams<{ symbol: string }>()
  const { user, profile, refreshProfile } = useAuth()
  const { toast }    = useToast()
  const navigate     = useNavigate()

  const { allLive } = useMarketData()

  const [selectedTicker, setSelectedTicker] = useState(paramSymbol ?? '')
  const [type,      setType]      = useState<'BUY' | 'SELL'>('BUY')
  const [qty,       setQty]       = useState('')
  const [byDollar,  setByDollar]  = useState(false)
  const [dollarAmt, setDollarAmt] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [holding,   setHolding]   = useState<Holding | null>(null)

  useEffect(() => { if (paramSymbol) setSelectedTicker(paramSymbol) }, [paramSymbol])

  useEffect(() => {
    if (!selectedTicker || !user) return
    supabase.from('holdings')
      .select('*').eq('user_id', user.id).eq('symbol', selectedTicker).single()
      .then(({ data }) => setHolding((data as Holding) ?? null))
  }, [selectedTicker, user])

  const meta    = ALL_INSTRUMENTS.find(s => s.ticker === selectedTicker)
  const stock   = allLive.find(s => s.ticker === selectedTicker)
  const price   = stock?.price ?? 0

  const computedQty = byDollar && price > 0
    ? parseFloat((parseFloat(dollarAmt) / price).toFixed(6)) || 0
    : parseFloat(qty) || 0
  const total   = computedQty * price
  const balance = profile?.virtual_balance ?? 0

  async function execute() {
    setLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { holding: updated } = await (executeTrade as any)({
        user, profile, stock, meta, type, quantity: computedQty, price, holding,
      }) as { holding: Holding }
      await refreshProfile()
      toast({
        title: `${type} order executed!`,
        description: `${computedQty.toFixed(computedQty % 1 === 0 ? 0 : 4)} × ${selectedTicker} @ $${fmtPrice(price, meta?.assetType)}`,
      })
      setQty('')
      setDollarAmt('')
      setHolding(updated)
    } catch (err: unknown) {
      toast({ title: 'Trade failed', description: (err as Error).message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade</h1>
        <p className="text-sm text-muted-foreground">Buy or sell stocks, ETFs, crypto, forex and commodities</p>
      </div>

      {/* Instrument selector */}
      <Card>
        <CardHeader><CardTitle className="text-base">Select Instrument</CardTitle></CardHeader>
        <CardContent>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedTicker}
            onChange={e => { setSelectedTicker(e.target.value); setQty('') }}
          >
            <option value="">-- Choose an instrument --</option>
            {GROUPS.map(g => (
              <optgroup key={g.label} label={g.label}>
                {g.instruments.map(s => (
                  <option key={s.symbol} value={s.ticker}>{s.ticker} — {s.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </CardContent>
      </Card>

      {stock && (
        <>
          {/* Price card */}
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AssetLogo logo={stock.logo} icon={stock.icon} name={stock.name} className="w-12 h-12 text-2xl" />
                  <div>
                    <p className="font-bold text-lg">{stock.ticker}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                    {meta?.assetType && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded capitalize">{meta.assetType}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold flex items-center justify-end gap-2">
                    {price === 0
                      ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      : `$${fmtPrice(price, meta?.assetType)}`
                    }
                  </p>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{Number(stock.change).toFixed(2)}%
                  </span>
                </div>
              </div>
              {holding && (
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex gap-6">
                  <span>You own: <strong className="text-foreground">{holding.quantity % 1 === 0 ? holding.quantity : Number(holding.quantity).toFixed(4)} units</strong></span>
                  <span>Avg cost: <strong className="text-foreground">${fmtPrice(holding.avg_buy_price, meta?.assetType)}</strong></span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order form */}
          <Card>
            <CardHeader><CardTitle className="text-base">Place Order</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex rounded-lg border p-1 w-fit">
                {(['BUY','SELL'] as const).map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-8 py-2 rounded-md text-sm font-semibold transition-colors ${
                      type === t
                        ? t === 'BUY' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >{t}</button>
                ))}
              </div>

              {/* Dollar / Units toggle */}
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  {byDollar ? 'Buy by Dollar Amount' : 'Buy by Units (fractional ok)'}
                </Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Units</span>
                  <Switch checked={byDollar} onCheckedChange={v => { setByDollar(v); setQty(''); setDollarAmt('') }} />
                  <DollarSign className="h-3.5 w-3.5" />
                </div>
              </div>

              {byDollar ? (
                <div className="space-y-1.5">
                  <Label>Dollar Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input
                      type="number" min="0" step="any" placeholder="100.00"
                      value={dollarAmt}
                      onChange={e => setDollarAmt(e.target.value)}
                      className="pl-7"
                    />
                  </div>
                  {price > 0 && parseFloat(dollarAmt) > 0 && (
                    <p className="text-xs text-muted-foreground">
                      ≈ {computedQty.toFixed(6)} shares of {selectedTicker}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label>Quantity (supports fractional shares)</Label>
                  <Input type="number" min="0" step="any" placeholder="0.5" value={qty} onChange={e => setQty(e.target.value)} />
                </div>
              )}

              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Price per unit</span><span>${fmtPrice(price, meta?.assetType)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{computedQty > 0 ? computedQty.toFixed(computedQty % 1 === 0 ? 0 : 6) : 0}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>{type === 'BUY' ? 'Total Cost' : 'You Receive'}</span>
                  <span className={type === 'BUY' ? 'text-red-500' : 'text-green-500'}>${fmtPrice(total, meta?.assetType)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Available balance</span>
                  <span className={type === 'BUY' && total > balance ? 'text-red-500' : ''}>${Number(balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2 text-white"
                style={{ backgroundColor: type === 'BUY' ? '#22c55e' : '#ef4444' }}
                onClick={execute}
                disabled={loading || computedQty <= 0 || price === 0}
              >
                {loading ? 'Processing…' : `${type} ${computedQty > 0 ? computedQty.toFixed(computedQty % 1 === 0 ? 0 : 4) : 0} ${computedQty === 1 ? 'unit' : 'units'}`}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTicker && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Select an instrument above to start trading</p>
          <Button variant="outline" onClick={() => navigate('/market')}>Browse Market →</Button>
        </div>
      )}
    </div>
  )
}
