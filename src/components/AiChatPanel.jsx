import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Bot, X, Send, Loader2 } from 'lucide-react'

export default function AiChatPanel() {
  const [open, setOpen]       = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Request failed')
      setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, something went wrong: ${err.message}` }])
    }
    setLoading(false)
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="AI Market Analyst"
      >
        {open ? <X className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-80 sm:w-96 h-[480px] rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50 flex-shrink-0">
            <Bot className="h-4 w-4 text-orange-500" />
            <span className="font-semibold text-sm">AI Market Analyst</span>
            <span className="ml-auto text-xs text-muted-foreground">Powered by Claude</span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8 leading-relaxed">
                Ask me about stocks, market trends,<br/>trading strategies, or portfolio tips.
              </p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] whitespace-pre-wrap leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-orange-500 text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-3 py-2 bg-muted">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2 flex-shrink-0">
            <input
              type="text"
              placeholder="Ask about markets…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <Button
              size="sm"
              className="bg-orange-500 hover:bg-orange-600 text-white h-9 w-9 p-0 flex-shrink-0"
              onClick={send}
              disabled={loading || !input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
