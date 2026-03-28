import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'
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

Remember: All trading in StockSim Academy uses virtual money for educational purposes.
Be concise, educational, and actionable. Use plain language.`

// Vite plugin that serves /api/chat locally so `npm run dev` works with AI chat.
// In production, Vercel handles /api/chat via api/chat.js instead.
function devApiPlugin(apiKey) {
  return {
    name: 'dev-api-chat',
    configureServer(server) {
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
    plugins: [react(), devApiPlugin(env.GROQ_API_KEY)],
    resolve: {
      alias: { "@": path.resolve(__dirname, "./src") },
    },
  }
})
