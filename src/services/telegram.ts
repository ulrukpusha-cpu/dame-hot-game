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

/** HapticFeedback non supporté en WebApp 6.0+ — ne rien appeler pour éviter les warnings */
function isHapticSupported(): boolean {
  const tg = getTelegramWebApp()
  if (!tg?.version) return true
  const major = parseInt(String(tg.version).split('.')[0], 10)
  return major < 6
}

export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light') {
  if (!isHapticSupported()) return
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style)
}
