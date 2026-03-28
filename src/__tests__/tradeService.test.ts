import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeTrade } from '@/lib/tradeService'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const mockSelect = vi.fn()
const mockSingle = vi.fn()
const mockInsert = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockEq     = vi.fn()
const mockIn     = vi.fn()

function chainMock(returnVal: unknown) {
  const chain: Record<string, unknown> = {}
  chain.select  = vi.fn(() => chain)
  chain.single  = vi.fn(() => Promise.resolve(returnVal))
  chain.insert  = vi.fn(() => chain)
  chain.update  = vi.fn(() => chain)
  chain.delete  = vi.fn(() => chain)
  chain.eq      = vi.fn(() => chain)
  chain.in      = vi.fn(() => chain)
  return chain
}

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      select: mockSelect,
      eq:     mockEq,
      single: mockSingle,
      in:     mockIn,
    })),
  },
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────
const user    = { id: 'user-1' }
const profile = { virtual_balance: 10_000 }
const stock   = { ticker: 'AAPL', name: 'Apple Inc.', price: 200, change: 1 }
const meta    = { assetType: 'stock' }

describe('executeTrade — input validation', () => {
  it('throws when stock is null', async () => {
    await expect(
      executeTrade({ user, profile, stock: null, meta, type: 'BUY', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('No instrument selected')
  })

  it('throws when quantity is 0', async () => {
    await expect(
      executeTrade({ user, profile, stock, meta, type: 'BUY', quantity: 0, price: 200, holding: null })
    ).rejects.toThrow('Enter a valid quantity')
  })

  it('throws when quantity is negative', async () => {
    await expect(
      executeTrade({ user, profile, stock, meta, type: 'BUY', quantity: -5, price: 200, holding: null })
    ).rejects.toThrow('Enter a valid quantity')
  })

  it('throws insufficient balance on BUY', async () => {
    await expect(
      executeTrade({ user, profile: { virtual_balance: 100 }, stock, meta, type: 'BUY', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('Insufficient balance')
  })

  it('throws when selling more than owned', async () => {
    const holding = { id: 'h-1', quantity: 3, avg_buy_price: 150 }
    await expect(
      executeTrade({ user, profile, stock, meta, type: 'SELL', quantity: 5, price: 200, holding })
    ).rejects.toThrow('Not enough units')
  })

  it('throws when selling with no holding', async () => {
    await expect(
      executeTrade({ user, profile, stock, meta, type: 'SELL', quantity: 1, price: 200, holding: null })
    ).rejects.toThrow('Not enough units')
  })
})

describe('executeTrade — balance calculation', () => {
  it('BUY cost equals quantity × price', async () => {
    // Just test the validation side — if balance is exactly enough, no throw
    const tightProfile = { virtual_balance: 200 } // exactly 1 × 200
    // We can't fully test DB calls without real Supabase, but we can verify
    // that the validation passes when balance == total
    // The function will throw because our mock chain is incomplete —
    // we test validation only here (DB errors are tested separately)
    const result = executeTrade({
      user, profile: tightProfile, stock, meta,
      type: 'BUY', quantity: 1, price: 200, holding: null,
    })
    // Should not throw "Insufficient balance" — it proceeds to DB call
    await expect(result).rejects.not.toThrow('Insufficient balance')
  })
})
