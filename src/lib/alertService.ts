import { supabase } from '@/lib/supabase'
import type { PriceAlert, LiveInstrument } from '@/types'

interface CreateAlertParams {
  userId: string
  symbol: string
  name: string
  targetPrice: number
  direction: 'above' | 'below'
}

export async function createAlert({ userId, symbol, name, targetPrice, direction }: CreateAlertParams): Promise<PriceAlert> {
  const { data, error } = await supabase.from('price_alerts').insert({
    user_id:      userId,
    symbol,
    name,
    target_price: targetPrice,
    direction,
    triggered:    false,
  }).select().single()
  if (error) throw new Error(error.message)
  return data as PriceAlert
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('price_alerts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getUserAlerts(userId: string): Promise<PriceAlert[]> {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('triggered', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as PriceAlert[]
}

/**
 * Check all active alerts against current live prices.
 * Returns the list of newly-triggered alerts (already marked triggered in DB).
 */
export async function checkAlerts(
  userId: string,
  allLive: LiveInstrument[],
): Promise<Array<PriceAlert & { currentPrice: number }>> {
  const alerts = await getUserAlerts(userId)
  if (!alerts.length) return []

  const triggered: Array<PriceAlert & { currentPrice: number }> = []
  for (const alert of alerts) {
    const live = allLive.find(s => s.ticker === alert.symbol)
    if (!live || !live.price) continue
    const hit =
      (alert.direction === 'above' && live.price >= alert.target_price) ||
      (alert.direction === 'below' && live.price <= alert.target_price)
    if (hit) triggered.push({ ...alert, currentPrice: live.price })
  }

  if (triggered.length) {
    const ids = triggered.map(a => a.id)
    await supabase.from('price_alerts').update({ triggered: true }).in('id', ids)
  }

  return triggered
}
