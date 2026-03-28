import { supabase } from '@/lib/supabase'

export async function createAlert({ userId, symbol, name, targetPrice, direction }) {
  const { data, error } = await supabase.from('price_alerts').insert({
    user_id:      userId,
    symbol,
    name,
    target_price: targetPrice,
    direction,
    triggered:    false,
  }).select().single()
  if (error) throw new Error(error.message)
  return data
}

export async function deleteAlert(id) {
  const { error } = await supabase.from('price_alerts').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getUserAlerts(userId) {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('triggered', false)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

/**
 * Check all active alerts against current live prices.
 * Returns the list of newly-triggered alerts (already marked triggered in DB).
 */
export async function checkAlerts(userId, allLive) {
  const alerts = await getUserAlerts(userId)
  if (!alerts.length) return []

  const triggered = []
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
