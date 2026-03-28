/**
 * Finnhub API proxy — keeps FINNHUB_KEY server-side only.
 *
 * NOTE: Vercel Functions are stateless — each invocation may run in a fresh
 * process, so in-memory rate limiting (token buckets, counters) does not work.
 * Rate limiting is delegated to the client: stockService.ts uses fetchSequential()
 * with a 120 ms delay between requests, which keeps well under Finnhub's 60 req/min.
 *
 * Usage: GET /api/finnhub?path=/quote&symbol=AAPL
 * The `path` param is the Finnhub v1 endpoint path.
 * All other query params are forwarded as-is to Finnhub.
 */

const ALLOWED_ORIGINS = [
  'https://stocksim-academy.vercel.app',
  'http://localhost:5173',
]

export default async function handler(req, res) {
  const origin = req.headers.origin || ''
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin)
  res.setHeader('Vary', 'Origin')

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const key = process.env.FINNHUB_KEY
  if (!key) {
    return res.status(500).json({ error: 'FINNHUB_KEY environment variable not set' })
  }

  const url  = new URL(req.url, 'http://localhost')
  const path = url.searchParams.get('path')

  if (!path) {
    return res.status(400).json({ error: 'Missing required query param: path' })
  }

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
