import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { init } from '@telegram-apps/sdk'

try {
  init()
} catch {
  // Outside of Telegram — use default CSS variables from index.css
}

// Map Telegram theme params to CSS variables if available
const tgWindow = window as Window & { Telegram?: { WebApp?: {
  themeParams?: Record<string, string>
  expand?: () => void
  ready?: () => void
} } }

const tg = tgWindow.Telegram?.WebApp
if (tg) {
  const p = tg.themeParams ?? {}
  const style = document.documentElement.style
  if (p.bg_color) style.setProperty('--tg-theme-bg-color', p.bg_color)
  if (p.text_color) style.setProperty('--tg-theme-text-color', p.text_color)
  if (p.hint_color) style.setProperty('--tg-theme-hint-color', p.hint_color)
  if (p.link_color) style.setProperty('--tg-theme-link-color', p.link_color)
  if (p.button_color) style.setProperty('--tg-theme-button-color', p.button_color)
  if (p.button_text_color) style.setProperty('--tg-theme-button-text-color', p.button_text_color)
  if (p.secondary_bg_color) style.setProperty('--tg-theme-secondary-bg-color', p.secondary_bg_color)
  tg.expand?.()
  tg.ready?.()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
