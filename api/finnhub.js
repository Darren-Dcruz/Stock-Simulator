/**
 * Finnhub API proxy — keeps FINNHUB_KEY server-side only.
 * Applies an in-memory token bucket: 60 tokens/min (Finnhub free-tier limit).
 *
 * Usage: GET /api/finnhub?path=/quote&symbol=AAPL
 * The `path` param is the Finnhub v1 endpoint path.
 * All other query params are forwarded as-is.
 */

// ── In-memory token bucket (60 req/min) ─────────────────────────────────────
let tokens   = 60
let lastTime = Date.now()

function consumeToken() {
  const now     = Date.now()
  const elapsed = (now - lastTime) / 1000          // seconds since last call
  tokens        = Math.min(60, tokens + elapsed * 1) // refill 1/sec
  lastTime      = now
  if (tokens < 1) return false
  tokens -= 1
  return true
}

export default async function handler(req, res) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!consumeToken()) {
    return res.status(429).json({ error: 'Rate limit exceeded — max 60 req/min' })
  }

  const key = process.env.FINNHUB_KEY
  if (!key) {
    return res.status(500).json({ error: 'FINNHUB_KEY environment variable not set' })
  }

  // Parse incoming query params
  const base   = 'http://localhost'
  const url    = new URL(req.url, base)
  const path   = url.searchParams.get('path')   // e.g. "/quote" or "/stock/candle"

  if (!path) {
    return res.status(400).json({ error: 'Missing required query param: path' })
  }

  // Forward all params except `path`, then append token
  url.searchParams.delete('path')
  url.searchParams.set('token', key)

  const finnhubUrl = `https://finnhub.io/api/v1${path}?${url.searchParams.toString()}`

  try {
    const upstream = await fetch(finnhubUrl)
    const data     = await upstream.json()
    res.status(upstream.status).json(data)
  } catch (err) {
    res.status(502).json({ error: `Upstream error: ${err.message}` })
  }
}
