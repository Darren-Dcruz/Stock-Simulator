import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body ?? {}
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      max_tokens: 1024,
    })

    const text = completion.choices[0]?.message?.content ?? ''
    res.status(200).json({ message: text })
  } catch (err) {
    console.error('Groq API error:', err)
    res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
