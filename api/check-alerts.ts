/**
 * Vercel Cron Job — runs every 5 minutes via GET /api/check-alerts
 * Fetches all untriggered price alerts, checks them against live Finnhub prices,
 * marks triggered ones in Supabase, and sends email notifications via Resend.
 *
 * Required env vars (server-side only):
 *   FINNHUB_KEY            — Finnhub API key
 *   SUPABASE_SERVICE_KEY   — Supabase service-role key (bypasses RLS)
 *   SUPABASE_URL           — Supabase project URL
 *   RESEND_API_KEY         — Resend API key for email
 *   RESEND_FROM_EMAIL      — Verified sender address (e.g. alerts@yourdomain.com)
 */

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// ── Supabase (service role — bypasses RLS to read all users' alerts) ──────────
function getSupabase() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) throw new Error('SUPABASE_URL or SUPABASE_SERVICE_KEY not set')
  return createClient(url, key)
}

// ── Fetch a live quote via our existing Finnhub proxy logic ───────────────────
async function fetchLivePrice(symbol: string): Promise<number | null> {
  const key = process.env.FINNHUB_KEY
  if (!key) return null
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${key}`
    )
    if (!res.ok) return null
    const q = await res.json() as { c?: number }
    return q.c && q.c > 0 ? q.c : null
  } catch {
    return null
  }
}

interface Alert {
  id: string
  user_id: string
  symbol: string
  name: string
  target_price: number
  direction: 'above' | 'below'
  triggered: boolean
}

interface Profile {
  id: string
  email?: string
}

export default async function handler(
  req: { method: string; headers: Record<string, string | string[] | undefined> },
  res: { status: (code: number) => { json: (body: unknown) => void } }
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let supabase: ReturnType<typeof getSupabase>
  try {
    supabase = getSupabase()
  } catch (err) {
    return res.status(500).json({ error: (err as Error).message })
  }

  // ── 1. Fetch all untriggered alerts ──────────────────────────────────────────
  const { data: alerts, error: alertsErr } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('triggered', false)

  if (alertsErr) return res.status(500).json({ error: alertsErr.message })
  if (!alerts || alerts.length === 0) return res.status(200).json({ triggered: 0 })

  // ── 2. Fetch unique symbols' live prices in parallel ─────────────────────────
  const symbols = [...new Set((alerts as Alert[]).map(a => a.symbol))]
  const priceMap: Record<string, number> = {}

  await Promise.all(
    symbols.map(async (sym) => {
      const price = await fetchLivePrice(sym)
      if (price !== null) priceMap[sym] = price
    })
  )

  // ── 3. Evaluate each alert ───────────────────────────────────────────────────
  const triggered: Alert[] = []
  for (const alert of alerts as Alert[]) {
    const live = priceMap[alert.symbol]
    if (live === undefined) continue
    const hit =
      (alert.direction === 'above' && live >= alert.target_price) ||
      (alert.direction === 'below' && live <= alert.target_price)
    if (hit) triggered.push({ ...alert, _currentPrice: live } as Alert & { _currentPrice: number })
  }

  if (triggered.length === 0) return res.status(200).json({ triggered: 0 })

  // ── 4. Mark triggered in DB ──────────────────────────────────────────────────
  const ids = triggered.map(a => a.id)
  await supabase.from('price_alerts').update({ triggered: true }).in('id', ids)

  // ── 5. Send email notifications via Resend ───────────────────────────────────
  const resendKey  = process.env.RESEND_API_KEY
  const fromEmail  = process.env.RESEND_FROM_EMAIL ?? 'alerts@stocksim.academy'

  if (resendKey) {
    const resend = new Resend(resendKey)

    // Group alerts by user
    const byUser: Record<string, (Alert & { _currentPrice: number })[]> = {}
    for (const a of triggered as (Alert & { _currentPrice: number })[]) {
      if (!byUser[a.user_id]) byUser[a.user_id] = []
      byUser[a.user_id].push(a)
    }

    // Look up user emails from auth.users via service-role
    const userIds = Object.keys(byUser)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .in('id', userIds) as { data: Profile[] | null }

    // Supabase auth admin to get emails
    for (const userId of userIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      const email = userData?.user?.email
      if (!email) continue

      const userAlerts = byUser[userId]
      const lines = userAlerts
        .map(a =>
          `• ${a.name} (${a.symbol}): target ${a.direction} $${a.target_price.toFixed(2)} — now $${(a as Alert & { _currentPrice: number })._currentPrice.toFixed(2)}`
        )
        .join('\n')

      await resend.emails.send({
        from:    fromEmail,
        to:      email,
        subject: `StockSim Alert: ${userAlerts.length} price alert${userAlerts.length > 1 ? 's' : ''} triggered`,
        text:    `Your price alerts have been triggered:\n\n${lines}\n\nLog in to StockSim Academy to review your portfolio.`,
        html: `
          <h2>Price Alert Triggered</h2>
          <p>The following alerts have been triggered:</p>
          <ul>
            ${userAlerts.map(a =>
              `<li><strong>${a.name} (${a.symbol})</strong>: target ${a.direction} $${a.target_price.toFixed(2)} — now $${(a as Alert & { _currentPrice: number })._currentPrice.toFixed(2)}</li>`
            ).join('')}
          </ul>
          <p><a href="https://stocksim-academy.vercel.app">Log in to StockSim Academy</a></p>
        `,
      })
    }
  }

  return res.status(200).json({ triggered: triggered.length, ids })
}
