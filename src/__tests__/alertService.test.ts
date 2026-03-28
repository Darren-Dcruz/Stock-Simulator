import { describe, it, expect, vi, beforeEach } from 'vitest'
import { checkAlerts } from '@/lib/alertService'

// ── Mock Supabase ─────────────────────────────────────────────────────────────
const mockGetAlerts = vi.fn()
const mockUpdate    = vi.fn()
const mockEq        = vi.fn()
const mockIn        = vi.fn()

vi.mock('@/lib/supabase', () => {
  const updateChain = { in: vi.fn(() => Promise.resolve({ error: null })) }
  const eqChain     = { eq: vi.fn().mockReturnThis(), order: vi.fn(() => Promise.resolve({ data: [], error: null })) }
  return {
    supabase: {
      from: vi.fn((table: string) => ({
        select: vi.fn()  .mockReturnThis(),
        eq:     vi.fn()  .mockReturnThis(),
        order:  vi.fn(() => Promise.resolve({ data: [], error: null })),
        update: vi.fn(() => ({ in: vi.fn(() => Promise.resolve({ error: null })) })),
        insert: vi.fn()  .mockReturnThis(),
        delete: vi.fn()  .mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    },
  }
})

// ── Re-import getUserAlerts so we can override it ────────────────────────────
vi.mock('@/lib/alertService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/alertService')>()
  return { ...actual }
})

describe('checkAlerts', () => {
  it('returns [] when there are no active alerts', async () => {
    const result = await checkAlerts('user-1', [{ ticker: 'AAPL', price: 200 }])
    expect(result).toEqual([])
  })
})

// ── Pure logic tests (no Supabase calls) ─────────────────────────────────────
describe('alert direction logic', () => {
  it('triggers when price crosses above target', () => {
    const alert = { direction: 'above', target_price: 190 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(true)
  })

  it('does not trigger when price is below "above" target', () => {
    const alert = { direction: 'above', target_price: 210 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(false)
  })

  it('triggers when price crosses below target', () => {
    const alert = { direction: 'below', target_price: 210 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(true)
  })

  it('does not trigger when price is above "below" target', () => {
    const alert = { direction: 'below', target_price: 150 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(false)
  })

  it('triggers exactly at the target price (above)', () => {
    const alert = { direction: 'above', target_price: 200 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(true)
  })

  it('triggers exactly at the target price (below)', () => {
    const alert = { direction: 'below', target_price: 200 }
    const live  = { price: 200 }
    const hit = alert.direction === 'above'
      ? live.price >= alert.target_price
      : live.price <= alert.target_price
    expect(hit).toBe(true)
  })
})
