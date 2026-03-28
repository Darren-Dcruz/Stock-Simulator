import { supabase } from '@/lib/supabase'

/**
 * Executes a BUY or SELL trade with rollback on partial failure.
 *
 * @param {object} params
 * @param {object} params.user      – Supabase auth user
 * @param {object} params.profile   – user profile (virtual_balance)
 * @param {object} params.stock     – live instrument data (ticker, name, price, change)
 * @param {object} params.meta      – static instrument metadata (assetType, etc.)
 * @param {'BUY'|'SELL'} params.type
 * @param {number} params.quantity  – number of units
 * @param {number} params.price     – current price per unit
 * @param {object|null} params.holding – existing holding row (or null)
 * @returns {Promise<{ holding: object|null }>} updated holding after trade
 * @throws {Error} with a user-readable message on any failure
 */
export async function executeTrade({ user, profile, stock, meta, type, quantity, price, holding }) {
  // ── Input validation ──────────────────────────────────────────────────────
  if (!stock)              throw new Error('No instrument selected')
  if (!quantity || quantity <= 0) throw new Error('Enter a valid quantity')

  const total   = quantity * price
  const balance = profile?.virtual_balance ?? 0

  if (type === 'BUY' && total > balance) {
    throw new Error(`Insufficient balance — need $${total.toFixed(2)}, have $${balance.toFixed(2)}`)
  }
  if (type === 'SELL' && (!holding || holding.quantity < quantity)) {
    const owned = holding?.quantity ?? 0
    throw new Error(`Not enough units — you own ${owned}, trying to sell ${quantity}`)
  }

  // ── 1. Insert trade record ────────────────────────────────────────────────
  const { data: tradeRow, error: tradeErr } = await supabase
    .from('trades')
    .insert({
      user_id:  user.id,
      symbol:   stock.ticker,
      name:     stock.name,
      type,
      quantity,
      price,
      total,
    })
    .select('id')
    .single()

  if (tradeErr) throw new Error(`Trade failed: ${tradeErr.message}`)

  try {
    // ── 2. Update holdings ──────────────────────────────────────────────────
    if (type === 'BUY') {
      if (holding) {
        const newQty = holding.quantity + quantity
        const newAvg = (holding.quantity * holding.avg_buy_price + quantity * price) / newQty
        const { error } = await supabase
          .from('holdings')
          .update({ quantity: newQty, avg_buy_price: newAvg, updated_at: new Date() })
          .eq('id', holding.id)
        if (error) throw new Error(`Holdings update failed: ${error.message}`)
      } else {
        const { error } = await supabase
          .from('holdings')
          .insert({ user_id: user.id, symbol: stock.ticker, name: stock.name, quantity, avg_buy_price: price })
        if (error) throw new Error(`Holdings insert failed: ${error.message}`)
      }
      // Deduct balance
      const { error } = await supabase
        .from('profiles')
        .update({ virtual_balance: balance - total })
        .eq('id', user.id)
      if (error) throw new Error(`Balance update failed: ${error.message}`)

    } else {
      // SELL
      const newQty = holding.quantity - quantity
      if (newQty <= 0) {
        const { error } = await supabase.from('holdings').delete().eq('id', holding.id)
        if (error) throw new Error(`Holdings delete failed: ${error.message}`)
      } else {
        const { error } = await supabase
          .from('holdings')
          .update({ quantity: newQty, updated_at: new Date() })
          .eq('id', holding.id)
        if (error) throw new Error(`Holdings update failed: ${error.message}`)
      }
      // Add proceeds to balance
      const { error } = await supabase
        .from('profiles')
        .update({ virtual_balance: balance + total })
        .eq('id', user.id)
      if (error) throw new Error(`Balance update failed: ${error.message}`)
    }
  } catch (err) {
    // ── Rollback: delete the trade record we already inserted ───────────────
    await supabase.from('trades').delete().eq('id', tradeRow.id)
    throw err
  }

  // ── 3. Return fresh holding state ─────────────────────────────────────────
  const { data: updatedHolding } = await supabase
    .from('holdings')
    .select('*')
    .eq('user_id', user.id)
    .eq('symbol', stock.ticker)
    .single()

  return { holding: updatedHolding ?? null }
}
