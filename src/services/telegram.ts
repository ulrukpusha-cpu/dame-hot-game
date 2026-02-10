/**
 * Service Telegram - WebApp SDK et helpers
 */

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          show: () => void
          hide: () => void
          setText: (t: string) => void
          onClick: (cb: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
        }
        HapticFeedback: { impactOccurred: (style: string) => void }
        initData: string
        initDataUnsafe?: {
          user?: {
            id: number
            first_name?: string
            last_name?: string
            username?: string
          }
        }
      }
    }
  }
}

export function getTelegramWebApp() {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp : undefined
}

export function isInTelegram() {
  return !!getTelegramWebApp()
}

export function hapticFeedback(style: 'light' | 'medium' | 'heavy' = 'light') {
  getTelegramWebApp()?.HapticFeedback?.impactOccurred(style)
}
