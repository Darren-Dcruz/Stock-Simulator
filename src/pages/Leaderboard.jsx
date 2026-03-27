import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Medal } from 'lucide-react'

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })
}

const MEDALS = { 0: '🥇', 1: '🥈', 2: '🥉' }

export default function Leaderboard() {
  const { user } = useAuth()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('id, username, virtual_balance')
      .order('virtual_balance', { ascending: false }).limit(50)
      .then(({ data }) => { setRows(data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Trophy className="h-7 w-7 text-orange-500" />
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground">Top traders by available balance</p>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-12">Rank</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Trader</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Balance</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">vs Start</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading
              ? Array.from({length:8}).map((_,i)=>(
                  <tr key={i}>{Array.from({length:4}).map((_,j)=><td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full"/></td>)}</tr>
                ))
              : rows.map((row, i) => {
                  const isMe = row.id === user?.id
                  const diff  = row.virtual_balance - 1_000_000
                  return (
                    <tr key={row.id} className={`${isMe ? 'bg-orange-500/10' : 'hover:bg-muted/30'} transition-colors`}>
                      <td className="px-4 py-3 font-bold text-center">
                        {MEDALS[i] ?? <span className="text-muted-foreground">{i + 1}</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium">{row.username ?? 'Anonymous'}</span>
                        {isMe && <span className="ml-2 text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded-full">you</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">₹{fmt(row.virtual_balance)}</td>
                      <td className={`px-4 py-3 text-right text-sm font-medium ${diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {diff >= 0 ? '+' : ''}₹{fmt(Math.abs(diff))}
                      </td>
                    </tr>
                  )
                })
            }
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="text-center py-12 text-muted-foreground">No traders yet — be the first!</p>
        )}
      </div>
    </div>
  )
}
