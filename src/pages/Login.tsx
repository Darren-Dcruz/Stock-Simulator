import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/lib/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GraduationCap, TrendingUp } from 'lucide-react'

export default function Login() {
  const [tab, setTab]           = useState('signin')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const { signIn, signUp }      = useAuth()
  const navigate                = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        if (!username.trim()) { setError('Username is required'); setLoading(false); return }
        const { error } = await signUp(email, password, username.trim())
        if (error) throw error
        setError('Check your email to confirm your account, then sign in.')
        setTab('signin')
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-600 to-orange-400 flex-col justify-center px-16 text-white">
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap className="h-10 w-10" />
          <span className="text-3xl font-bold">StockSim Academy</span>
        </div>
        <h2 className="text-4xl font-bold mb-4 leading-tight">
          Learn to trade.<br />Risk free.
        </h2>
        <p className="text-orange-100 text-lg mb-8">
          Practice trading with $1,000,000 virtual money. Real US market prices, zero real risk.
        </p>
        <div className="flex flex-col gap-3">
          {['Live prices for stocks, ETFs, crypto & forex', 'Virtual $1M portfolio to practice with', 'Track trades, P&L and portfolio growth', 'Market news · leaderboard · watchlist'].map(f => (
            <div key={f} className="flex items-center gap-2 text-orange-100">
              <TrendingUp className="h-4 w-4 flex-shrink-0" />
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <GraduationCap className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-bold">StockSim Academy</span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border p-1 mb-6">
            {['signin', 'signup'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError('') }}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                  tab === t ? 'bg-orange-500 text-white' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div className="space-y-1.5">
                <Label>Username</Label>
                <Input placeholder="tradername" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {error && (
              <p className={`text-sm px-3 py-2 rounded-md ${error.includes('Check your email') ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                {error}
              </p>
            )}

            <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={loading}>
              {loading ? 'Please wait…' : tab === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
