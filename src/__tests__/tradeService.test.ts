import { describe, it, expect, vi } from 'vitest'
import { executeTrade } from '@/lib/tradeService'
import type { User } from '@supabase/supabase-js'
import type { Instrument, Holding, Profile } from '@/types'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({ select: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null, error: { message: 'mock' } })) })) })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      select: vi.fn(() => ({ eq: vi.fn(() => ({ single: vi.fn(() => Promise.resolve({ data: null })) })) })),
    })),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────
const user    = { id: 'user-1' } as unknown as User
const profile = { id: 'user-1', email: 'a@b.com', virtual_balance: 10_000, created_at: '' } satisfies Profile
const stock   = { ticker: 'AAPL', name: 'Apple Inc.' } satisfies Pick<Instrument, 'ticker' | 'name'>
const holding = { id: 'h-1', user_id: 'user-1', symbol: 'AAPL', ticker: 'AAPL', name: 'Apple Inc.', quantity: 3, avg_buy_price: 150 } satisfies Holding

describe('executeTrade — input validation', () => {
  it('throws when stock is null', async () => {
    await expect(
      executeTrade({ user, profile, stock: null as unknown as Pick<Instrument, 'ticker' | 'name'>, type: 'BUY', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('No instrument selected')
  })

  it('throws when quantity is 0', async () => {
    await expect(
      executeTrade({ user, profile, stock, type: 'BUY', quantity: 0, price: 200, holding: null })
    ).rejects.toThrow('Enter a valid quantity')
  })

  it('throws when quantity is negative', async () => {
    await expect(
      executeTrade({ user, profile, stock, type: 'BUY', quantity: -5, price: 200, holding: null })
    ).rejects.toThrow('Enter a valid quantity')
  })

  it('throws insufficient balance on BUY', async () => {
    const poorProfile: Profile = { ...profile, virtual_balance: 100 }
    await expect(
      executeTrade({ user, profile: poorProfile, stock, type: 'BUY', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('Insufficient balance')
  })

  it('throws when selling more than owned', async () => {
    await expect(
      executeTrade({ user, profile, stock, type: 'SELL', quantity: 5, price: 200, holding })
    ).rejects.toThrow('Not enough units')
  })

  it('throws when selling with no holding', async () => {
    await expect(
      executeTrade({ user, profile, stock, type: 'SELL', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('Not enough units')
  })
})

describe('executeTrade — balance calculation', () => {
  it('BUY cost equals quantity × price — passes validation when balance == total', async () => {
    const tightProfile: Profile = { ...profile, virtual_balance: 200 } // exactly 1 × 200
    const result = executeTrade({ user, profile: tightProfile, stock, type: 'BUY', quantity: 1, price: 200, holding: null })
    // Validation passes, then hits mock DB which returns an error — but not "Insufficient balance"
    await expect(result).rejects.not.toThrow('Insufficient balance')
  })
})
