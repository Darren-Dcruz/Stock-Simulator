// @ts-nocheck
import { useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GraduationCap, TrendingUp, Trophy, ArrowRight, ChevronLeft } from 'lucide-react'

const STEPS = [
  {
    icon: GraduationCap,
    color: 'text-orange-500',
    bg:    'bg-orange-100 dark:bg-orange-900/30',
    title: 'Welcome to StockSim Academy!',
    body:  [
      "You've just been given $1,000,000 in virtual money to practice investing — completely risk-free.",
      "Explore real market data, build a portfolio, and learn how the stock market works before risking real money.",
    ],
  },
  {
    icon: TrendingUp,
    color: 'text-blue-500',
    bg:    'bg-blue-100 dark:bg-blue-900/30',
    title: 'How to trade',
    body:  [
      "Go to Market to browse stocks, ETFs, crypto, forex, and commodities with live prices from Finnhub.",
      "Click any asset to open the Trade page. Buy or sell by units or dollar amount — fractional shares supported.",
      "Set price alerts to get notified when an asset hits your target price.",
    ],
  },
  {
    icon: Trophy,
    color: 'text-green-500',
    bg:    'bg-green-100 dark:bg-green-900/30',
    title: 'Compete & Learn',
    body:  [
      "Your Portfolio page tracks your P&L and benchmarks you against the S&P 500.",
      "Check the Leaderboard to see how your total portfolio value compares to other traders.",
      "Use the AI Market Analyst (bottom-right chat) for strategy advice, stock analysis, and learning.",
    ],
  },
]

const STORAGE_KEY = 'stocksim_onboarding_done'

export function useOnboarding() {
  const [show, setShow] = useState(() => localStorage.getItem(STORAGE_KEY) !== 'true')

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  function restart() {
    localStorage.removeItem(STORAGE_KEY)
    setShow(true)
  }

  return { show, dismiss, restart }
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function OnboardingModal({ open, onClose }: Props) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const Icon    = current.icon
  const isLast  = step === STEPS.length - 1

  function handleClose() {
    setStep(0)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose() }}>
      <DialogContent className="max-w-md p-0 overflow-hidden" aria-describedby="onboarding-desc">
        {/* Progress bar */}
        <div className="flex gap-1 p-4 pb-0">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-orange-500' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        <div className="p-6 space-y-5">
          {/* Icon */}
          <div className={`w-14 h-14 rounded-2xl ${current.bg} flex items-center justify-center`}>
            <Icon className={`h-7 w-7 ${current.color}`} />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold">{current.title}</h2>
            <div id="onboarding-desc" className="space-y-2">
              {current.body.map((line, i) => (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
              ))}
            </div>
          </div>

          {/* Step indicator */}
          <p className="text-xs text-muted-foreground">Step {step + 1} of {STEPS.length}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between gap-3 pt-1">
            {step > 0 ? (
              <Button variant="ghost" size="sm" className="gap-1" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={handleClose}>
                Skip
              </Button>
            )}

            <Button
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={() => isLast ? handleClose() : setStep(s => s + 1)}
            >
              {isLast ? 'Start Trading!' : 'Next'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}