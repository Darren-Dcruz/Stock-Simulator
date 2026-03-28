import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

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
Be concise, educational, and actionable. Use plain language and avoid jargon unless explaining it.`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body ?? {}
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    })

    const text = response.content.find(b => b.type === 'text')?.text ?? ''
    res.status(200).json({ message: text })
  } catch (err) {
    console.error('Claude API error:', err)
    res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
