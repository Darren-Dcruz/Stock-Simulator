import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { Toaster } from '@/components/ui/toaster'
import { queryClientInstance } from '@/lib/query-client'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { MarketDataProvider } from '@/lib/MarketDataContext'
import ErrorBoundary from '@/components/ErrorBoundary'
import Layout from '@/Layout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import Market from '@/pages/Market'
import Portfolio from '@/pages/Portfolio'
import Trade from '@/pages/Trade'
import History from '@/pages/History'
import Watchlist from '@/pages/Watchlist'
import Leaderboard from '@/pages/Leaderboard'
import StockDetail from '@/pages/StockDetail'
import News from '@/pages/News'

function Spinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background">
      <div className="w-8 h-8 border-4 border-muted border-t-orange-500 rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
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
        <Route index element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
        <Route path="market"          element={<ErrorBoundary><Market /></ErrorBoundary>} />
        <Route path="portfolio"       element={<ErrorBoundary><Portfolio /></ErrorBoundary>} />
        <Route path="trade"           element={<ErrorBoundary><Trade /></ErrorBoundary>} />
        <Route path="trade/:symbol"   element={<ErrorBoundary><Trade /></ErrorBoundary>} />
        <Route path="history"         element={<ErrorBoundary><History /></ErrorBoundary>} />
        <Route path="watchlist"       element={<ErrorBoundary><Watchlist /></ErrorBoundary>} />
        <Route path="leaderboard"     element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
        <Route path="stock/:symbol"   element={<ErrorBoundary><StockDetail /></ErrorBoundary>} />
        <Route path="news"            element={<ErrorBoundary><News /></ErrorBoundary>} />
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
            <MarketDataProvider>
              <AppRoutes />
            </MarketDataProvider>
          </AuthProvider>
          <Toaster />
        </Router>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
