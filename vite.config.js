import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

const SYSTEM_PROMPT = `You are an AI Market Analyst for StockSim Academy, a virtual stock trading simulator designed for students learning to invest.

You help users with:
- Stock analysis and valuation (P/E ratios, revenue growth, moats)
- Market trends and macroeconomic indicators
- Technical analysis (moving averages, support/resistance, momentum)
- Trading strategies and risk management
- Portfolio diversification principles
- Interpreting financial metrics

Available instruments in the simulator:
- Stocks: AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX, JPM, V, JNJ, WMT, and more
- ETFs: SPY, QQQ, DIA, IWM, VTI, GLD, XLF, XLK
- Crypto: BTC, ETH, SOL, DOGE, ADA, XRP
- Forex: EUR/USD, GBP/USD, USD/JPY, USD/CHF
- Commodities: Gold, Silver, Oil (WTI), Natural Gas

The creator of StockSim Academy is Darren Dcruz, a college student passionate about AI and Finance. You can mention that if users ask about you or the simulator's origins.

Remember: All trading in StockSim Academy uses virtual money for educational purposes.
Be concise, educational, and actionable. Use plain language.`

// Vite plugin that serves /api/chat and /api/finnhub locally so `npm run dev` works.
// In production, Vercel handles these via api/*.js serverless functions instead.
function devApiPlugin(apiKey, finnhubKey) {
  return {
    name: 'dev-api',
    configureServer(server) {
      // ── /api/finnhub proxy ──────────────────────────────────────────────────
      server.middlewares.use('/api/finnhub', async (req, res) => {
        if (req.method !== 'GET') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        if (!finnhubKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'FINNHUB_KEY not set in .env.local' }))
          return
        }
        try {
          const base   = 'http://localhost'
          const url    = new URL(req.url, base)
          const path   = url.searchParams.get('path')
          if (!path) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Missing required query param: path' }))
            return
          }
          url.searchParams.delete('path')
          url.searchParams.set('token', finnhubKey)
          const finnhubUrl = `https://finnhub.io/api/v1${path}?${url.searchParams.toString()}`
          const upstream = await fetch(finnhubUrl)
          const data = await upstream.json()
          res.writeHead(upstream.status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(data))
        } catch (err) {
          res.writeHead(502, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: `Upstream error: ${err.message}` }))
        }
      })

      // ── /api/chat (Groq) ────────────────────────────────────────────────────
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }
        let body = ''
        req.on('data', chunk => { body += chunk })
        req.on('end', async () => {
          try {
            if (!apiKey) throw new Error('GROQ_API_KEY not set in .env.local')
            const Groq = (await import('groq-sdk')).default
            const { messages } = JSON.parse(body)
            const groq = new Groq({ apiKey })
            const completion = await groq.chat.completions.create({
              model: 'llama-3.3-70b-versatile',
              messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
              max_tokens: 1024,
            })
            const text = completion.choices[0]?.message?.content ?? ''
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ message: text }))
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: err.message }))
          }
        })
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [
      react(),
      devApiPlugin(env.GROQ_API_KEY, env.FINNHUB_KEY),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'icons/*.png'],
        manifest: {
          name: 'StockSim Academy',
          short_name: 'StockSim',
          description: 'Practice trading with real market data — zero risk, maximum learning.',
          theme_color: '#f97316',
          background_color: '#000000',
          display: 'standalone',
          scope: '/',
          start_url: '/',
          icons: [
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          // Cache-first for static assets
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/financialmodelingprep\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'logo-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/assets\.coingecko\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'logo-cache-crypto',
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            // Network-first for API calls
            {
              urlPattern: /\/api\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                networkTimeoutSeconds: 10,
                expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  }
})
