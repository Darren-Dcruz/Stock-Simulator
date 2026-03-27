import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import Layout from '@/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Market from '@/pages/Market'
import Portfolio from '@/pages/Portfolio'
import Trade from '@/pages/Trade'
import History from '@/pages/History'
import Watchlist from '@/pages/Watchlist'
import Leaderboard from '@/pages/Leaderboard'

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-muted border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="market" element={<Market />} />
        <Route path="portfolio" element={<Portfolio />} />
        <Route path="trade" element={<Trade />} />
        <Route path="trade/:symbol" element={<Trade />} />
        <Route path="history" element={<History />} />
        <Route path="watchlist" element={<Watchlist />} />
        <Route path="leaderboard" element={<Leaderboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
