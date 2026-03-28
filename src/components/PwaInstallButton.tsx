// @ts-nocheck
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type WindowWithPrompt = Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent }

export default function PwaInstallButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(
    // Pick up event captured before React mounted
    () => (window as WindowWithPrompt).__pwaInstallPrompt ?? null
  )
  const [installed, setInstalled] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  )

  useEffect(() => {
    // Also listen for future events (e.g. after service worker activates)
    const handler = (e: Event) => {
      e.preventDefault()
      setPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => { setInstalled(true); setPrompt(null) })
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (installed || !prompt) return null

  async function install() {
    if (!prompt) return
    await prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setPrompt(null)
      setInstalled(true)
      delete (window as WindowWithPrompt).__pwaInstallPrompt
    }
  }

  return (
    <Button
      variant="ghost" size="sm"
      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      onClick={install}
    >
      <Download className="h-4 w-4" />
      Install App
    </Button>
  )
}