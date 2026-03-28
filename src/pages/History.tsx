// @ts-nocheck
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'

function fmt(n) {
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function History() {
  const { user } = useAuth()
  const [trades, setTrades]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('ALL')

  useEffect(() => {
    if (!user) return
    supabase.from('trades').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setTrades(data ?? []); setLoading(false) })
  }, [user])

  const filtered = filter === 'ALL' ? trades : trades.filter(t => t.type === filter)

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Trade History</h1>
        <p className="text-sm text-muted-foreground">All your executed orders</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['ALL','BUY','SELL'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              filter === f ? 'bg-orange-500 text-white border-orange-500' : 'text-muted-foreground hover:text-foreground border-transparent'
            }`}
          >{f}</button>
        ))}
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              {['Date','Stock','Type','Qty','Price','Total'].map(h => (
                <th key={h} className={`px-4 py-3 text-xs font-medium text-muted-foreground ${h==='Date'||h==='Stock'?'text-left':'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({length:6}).map((_,i)=>(
                  <tr key={i}>{Array.from({length:6}).map((_,j)=><td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td>)}</tr>
                ))
              : filtered.map(t => (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('en-US', { day:'2-digit', month:'short', year:'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-semibold">{t.symbol}</td>
                    <td className="px-4 py-3">
                      <Badge className={t.type==='BUY'?'bg-green-500/15 text-green-600 hover:bg-green-500/20':'bg-red-500/15 text-red-500 hover:bg-red-500/20'}>
                        {t.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">{t.quantity}</td>
                    <td className="px-4 py-3 text-right">${fmt(t.price)}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${t.type==='BUY'?'text-red-500':'text-green-500'}`}>
                      {t.type==='BUY'?'-':'+'}${fmt(t.total)}
                    </td>
                  </tr>
                ))
            }
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">No {filter !== 'ALL' ? filter.toLowerCase() : ''} trades yet</p>
        )}
      </div>
    </div>
  )
}