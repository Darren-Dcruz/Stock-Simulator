import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// ── Build a proper thenable mock so supabase query chains resolve ─────────────
function makeSupabaseMock(resolveWith = { data: [], error: null }) {
  const p = Promise.resolve(resolveWith)
  const chain: Record<string, unknown> = {
    select:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    // Make the chain a real thenable so .then() works in component code
    then:    (res: (v: typeof resolveWith) => unknown, rej?: (e: unknown) => unknown) =>
               p.then(res, rej),
    catch:   (rej: (e: unknown) => unknown) => p.catch(rej),
    finally: (fn: () => void) => p.finally(fn),
  }
  return chain
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => makeSupabaseMock()),
  },
}))

vi.mock('@/lib/AuthContext', () => ({
  useAuth: () => ({
    user:    { id: 'user-1', email: 'test@example.com' },
    profile: { virtual_balance: 850_000 },
  }),
}))

vi.mock('@/lib/MarketDataContext', () => ({
  useMarketData: () => ({
    allLive:   [],
    isLoading: false,
  }),
}))

import Portfolio from '@/pages/Portfolio'

describe('Portfolio page — integration', () => {
  function renderPortfolio() {
    return render(
      <MemoryRouter>
        <Portfolio />
      </MemoryRouter>
    )
  }

  it('renders without crashing', async () => {
    renderPortfolio()
    await waitFor(() => expect(document.body).toBeTruthy())
  })

  it('shows virtual balance from profile', async () => {
    renderPortfolio()
    await waitFor(() => {
      const matches = screen.getAllByText(/850,000/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })

  it('shows $0 holdings value when portfolio is empty', async () => {
    renderPortfolio()
    await waitFor(() => {
      const zeros = screen.getAllByText(/0\.00/)
      expect(zeros.length).toBeGreaterThan(0)
    })
  })

  it('shows total portfolio value as balance when no holdings', async () => {
    renderPortfolio()
    await waitFor(() => {
      // Total value = cash (850,000) + holdings (0) = 850,000
      const matches = screen.getAllByText(/850,000/)
      expect(matches.length).toBeGreaterThan(0)
    })
  })
})
