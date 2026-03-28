import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Capture the PWA install prompt as early as possible (before React mounts)
// PwaInstallButton reads from window.__pwaInstallPrompt
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  ;(window as Window & { __pwaInstallPrompt?: Event }).__pwaInstallPrompt = e
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <App />
)
