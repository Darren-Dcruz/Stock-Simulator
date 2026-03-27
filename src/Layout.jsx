import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '@/lib/AuthContext'
import ThemeToggle from '@/components/ThemeToggle'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, TrendingUp, Briefcase, ArrowLeftRight,
  History, Bookmark, Trophy, GraduationCap, LogOut, Menu, X, IndianRupee
} from 'lucide-react'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/market',     icon: TrendingUp,       label: 'Market'    },
  { to: '/portfolio',  icon: Briefcase,        label: 'Portfolio' },
  { to: '/trade',      icon: ArrowLeftRight,   label: 'Trade'     },
  { to: '/history',    icon: History,          label: 'History'   },
  { to: '/watchlist',  icon: Bookmark,         label: 'Watchlist' },
  { to: '/leaderboard',icon: Trophy,           label: 'Leaderboard'},
]

function SidebarContent({ onNav }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-orange-500 text-white'
        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
    }`

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b">
        <GraduationCap className="h-7 w-7 text-orange-500" />
        <span className="font-bold text-base leading-tight">StockSim<br/>Academy</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={linkCls} onClick={onNav}>
            <Icon className="h-4 w-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-2">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted/50">
          <IndianRupee className="h-4 w-4 text-green-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate">{profile?.username ?? 'Trader'}</p>
            <p className="text-xs text-muted-foreground">
              ₹{Number(profile?.virtual_balance ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        <ThemeToggle />
        <Button
          variant="ghost" size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default function Layout() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-card flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="relative flex flex-col w-56 h-full bg-card border-r shadow-xl">
            <button className="absolute top-4 right-3 p-1" onClick={() => setOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNav={() => setOpen(false)} />
          </aside>
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b bg-card">
          <button onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-1.5">
            <GraduationCap className="h-5 w-5 text-orange-500" />
            <span className="font-bold text-sm">StockSim Academy</span>
          </div>
          <ThemeToggle />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
