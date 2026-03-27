import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { TRACKED_STOCKS } from '@/api/stockService'
import { useStockData } from '@/hooks/useStockData'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Trade() {
  const { symbol: paramSymbol } = useParams()
  const { data: stocks } = useStockData()
  const { user, profile, refreshProfile } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [selectedTicker, setSelectedTicker] = useState(paramSymbol ?? '')
  const [type, setType]   = useState('BUY')
  const [qty, setQty]     = useState('')
  const [loading, setLoading] = useState(false)
  const [holding, setHolding] = useState(null)

  const stock = stocks?.find(s => s.ticker === selectedTicker)
  const price = stock?.price ?? 0
  const total = (parseFloat(qty) || 0) * price
  const balance = profile?.virtual_balance ?? 0

  useEffect(() => {
    if (paramSymbol) setSelectedTicker(paramSymbol)
  }, [paramSymbol])

  useEffect(() => {
    if (!selectedTicker || !user) return
    supabase.from('holdings')
      .select('*').eq('user_id', user.id).eq('symbol', selectedTicker).single()
      .then(({ data }) => setHolding(data))
  }, [selectedTicker, user])

  async function execute() {
    if (!stock || !qty || parseFloat(qty) <= 0) {
      toast({ title: 'Enter a valid quantity', variant: 'destructive' }); return
    }
    if (type === 'BUY' && total > balance) {
      toast({ title: 'Insufficient balance', variant: 'destructive' }); return
    }
    if (type === 'SELL') {
      if (!holding || holding.quantity < parseFloat(qty)) {
        toast({ title: 'Not enough shares to sell', variant: 'destructive' }); return
      }
    }
    setLoading(true)
    try {
      const quantity = parseFloat(qty)
      // 1. Record trade
      await supabase.from('trades').insert({
        user_id: user.id, symbol: selectedTicker, name: stock.name,
        type, quantity, price, total
      })
      // 2. Update holdings
      if (type === 'BUY') {
        if (holding) {
          const newQty = holding.quantity + quantity
          const newAvg = (holding.quantity * holding.avg_buy_price + quantity * price) / newQty
          await supabase.from('holdings').update({ quantity: newQty, avg_buy_price: newAvg, updated_at: new Date() }).eq('id', holding.id)
        } else {
          await supabase.from('holdings').insert({ user_id: user.id, symbol: selectedTicker, name: stock.name, quantity, avg_buy_price: price })
        }
        await supabase.from('profiles').update({ virtual_balance: balance - total }).eq('id', user.id)
      } else {
        const newQty = holding.quantity - quantity
        if (newQty <= 0) {
          await supabase.from('holdings').delete().eq('id', holding.id)
        } else {
          await supabase.from('holdings').update({ quantity: newQty, updated_at: new Date() }).eq('id', holding.id)
        }
        await supabase.from('profiles').update({ virtual_balance: balance + total }).eq('id', user.id)
      }
      await refreshProfile()
      toast({ title: `${type} order executed!`, description: `${quantity} × ${selectedTicker} @ $${fmt(price)}` })
      setQty('')
      // Refresh holding
      const { data } = await supabase.from('holdings').select('*').eq('user_id', user.id).eq('symbol', selectedTicker).single()
      setHolding(data ?? null)
    } catch (err) {
      toast({ title: 'Trade failed', description: err.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Trade</h1>
        <p className="text-sm text-muted-foreground">Buy or sell US stocks with virtual money</p>
      </div>

      {/* Stock selector */}
      <Card>
        <CardHeader><CardTitle className="text-base">Select Stock</CardTitle></CardHeader>
        <CardContent>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={selectedTicker}
            onChange={e => { setSelectedTicker(e.target.value); setQty('') }}
          >
            <option value="">-- Choose a stock --</option>
            {TRACKED_STOCKS.map(s => (
              <option key={s.symbol} value={s.ticker}>{s.ticker} — {s.name}</option>
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
                  <span className="text-3xl">{stock.icon}</span>
                  <div>
                    <p className="font-bold text-lg">{stock.ticker}</p>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${fmt(price)}</p>
                  <span className={`inline-flex items-center gap-1 text-sm font-semibold ${stock.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{Number(stock.change).toFixed(2)}%
                  </span>
                </div>
              </div>
              {holding && (
                <div className="mt-4 pt-4 border-t text-sm text-muted-foreground flex gap-6">
                  <span>You own: <strong className="text-foreground">{holding.quantity} shares</strong></span>
                  <span>Avg. cost: <strong className="text-foreground">${fmt(holding.avg_buy_price)}</strong></span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order form */}
          <Card>
            <CardHeader><CardTitle className="text-base">Place Order</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {/* BUY / SELL toggle */}
              <div className="flex rounded-lg border p-1 w-fit">
                {['BUY','SELL'].map(t => (
                  <button key={t} onClick={() => setType(t)}
                    className={`px-8 py-2 rounded-md text-sm font-semibold transition-colors ${
                      type === t
                        ? t === 'BUY' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >{t}</button>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label>Quantity (shares)</Label>
                <Input type="number" min="0" step="1" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} />
              </div>

              {/* Order summary */}
              <div className="rounded-lg bg-muted/50 p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Price per share</span><span>${fmt(price)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span>{qty || 0}</span></div>
                <div className="flex justify-between font-semibold border-t pt-2 mt-2">
                  <span>{type === 'BUY' ? 'Total Cost' : 'You Receive'}</span>
                  <span className={type === 'BUY' ? 'text-red-500' : 'text-green-500'}>${fmt(total)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Available balance</span>
                  <span className={type === 'BUY' && total > balance ? 'text-red-500' : ''}>${fmt(balance)}</span>
                </div>
              </div>

              <Button
                className="w-full gap-2 text-white"
                style={{ backgroundColor: type === 'BUY' ? '#22c55e' : '#ef4444' }}
                onClick={execute}
                disabled={loading || !qty || parseFloat(qty) <= 0}
              >
                {loading ? 'Processing…' : `${type} ${qty || 0} share${parseFloat(qty) !== 1 ? 's' : ''}`}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTicker && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-3">Select a stock above to start trading</p>
          <Button variant="outline" onClick={() => navigate('/market')}>Browse Market →</Button>
        </div>
      )}
    </div>
  )
}
