/**
 * Service Telegram - WebApp SDK et helpers
 * Types Window.Telegram définis dans @/lib/telegram
 */

export function getTelegramWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
}

export function isInTelegram() {
  return !!getTelegramWebApp()
}

export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light') {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style)
}
