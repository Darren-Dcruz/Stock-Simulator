import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { useMarketData } from '@/lib/MarketDataContext'
import MostActiveToday from '@/components/MostActiveToday'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TrendingUp, Wallet, ArrowLeftRight, BarChart2, Activity } from 'lucide-react'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function Dashboard() {
  const { profile, user, refreshProfile } = useAuth()
  const { stocks, allLive } = useMarketData()
  const navigate            = useNavigate()
  const [holdings, setHoldings] = useState([])
  const [recentTrades, setRecentTrades] = useState([])
  const [usernameInput, setUsernameInput] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)

  useEffect(() => {
    if (!user) return
    supabase.from('holdings').select('*').eq('user_id', user.id).then(({ data }) => setHoldings(data ?? []))
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentTrades(data ?? []))
  }, [user])

  async function saveUsername() {
    if (!usernameInput.trim() || !user) return
    setSavingUsername(true)
    await supabase.from('profiles').update({ username: usernameInput.trim() }).eq('id', user.id)
    await refreshProfile()
    setSavingUsername(false)
  }

  const holdingsValue = holdings.reduce((sum, h) => {
    const live = allLive.find(s => s.ticker === h.symbol)
    return sum + ((live?.price ?? h.avg_buy_price) * h.quantity)
  }, 0)

  const totalValue   = holdingsValue + (profile?.virtual_balance ?? 0)
  const gainers      = stocks?.filter(s => s.change >= 0).length ?? 0
  const losers       = stocks?.filter(s => s.change < 0).length ?? 0
  const avgChange    = stocks?.length ? (stocks.reduce((s, x) => s + x.change, 0) / stocks.length).toFixed(2) : '0.00'
  const startBal     = 1_000_000
  const overallPnl   = totalValue - startBal

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile?.username ?? 'Trader'} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your market overview</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white gap-2" onClick={() => navigate('/trade')}>
          <ArrowLeftRight className="h-4 w-4" /> Trade Now
        </Button>
      </div>

      {/* Username prompt */}
      {profile && !profile.username && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3">
          <p className="text-sm text-orange-600 dark:text-orange-400 flex-1">
            Set a display name so you appear on the leaderboard.
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Input
              placeholder="Choose a username"
              value={usernameInput}
              onChange={e => setUsernameInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveUsername()}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={saveUsername} disabled={savingUsername || !usernameInput.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white shrink-0">
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Portfolio', value: `$${fmt(totalValue)}`,
            sub: `${overallPnl >= 0 ? '+' : ''}$${fmt(Math.abs(overallPnl))} overall`,
            icon: Wallet, color: 'bg-orange-500/10 text-orange-500' },
          { label: 'Cash Available', value: `$${fmt(profile?.virtual_balance ?? 0)}`,
            sub: 'Ready to invest', icon: Wallet, color: 'bg-blue-500/10 text-blue-500' },
          { label: 'Gainers Today', value: gainers,
            sub: `${stocks?.length ?? 0} stocks tracked`, icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
          { label: 'Market Avg', value: `${Number(avgChange) >= 0 ? '+' : ''}${avgChange}%`,
            sub: `${losers} losers today`, icon: Activity, color: 'bg-purple-500/10 text-purple-500' },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{label}</span>
                <div className={`p-1.5 rounded-md ${color}`}><Icon className="h-3.5 w-3.5" /></div>
              </div>
              <p className="text-xl font-bold leading-tight">{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Most active today */}
      <MostActiveToday />

      {/* Recent trades + quick actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4 flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Recent Trades</h3>
            {recentTrades.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <p>No trades yet</p>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => navigate('/market')}>Start Trading</Button>
              </div>
            ) : (
              <div className="space-y-2">
                {recentTrades.map(t => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${t.type==='BUY'?'bg-green-500/15 text-green-600':'bg-red-500/15 text-red-500'}`}>{t.type}</span>
                      <span className="text-sm font-medium">{t.symbol}</span>
                      <span className="text-xs text-muted-foreground">× {t.quantity}</span>
                    </div>
                    <span className="text-sm font-semibold">${fmt(t.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Browse Market', icon: TrendingUp, path: '/market', color: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-500' },
                { label: 'Trade Stocks',  icon: ArrowLeftRight, path: '/trade', color: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-500' },
                { label: 'My Portfolio', icon: BarChart2, path: '/portfolio', color: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-500' },
                { label: 'Leaderboard',  icon: Activity, path: '/leaderboard', color: 'bg-green-500/10 hover:bg-green-500/20 text-green-500' },
              ].map(({ label, icon: Icon, path, color }) => (
                <button key={path} onClick={() => navigate(path)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-colors ${color}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
