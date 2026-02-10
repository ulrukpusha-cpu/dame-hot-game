import { useEffect } from 'react'
import { useUserStore } from '@/stores/userStore'

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
            photo_url?: string
          }
          start_param?: string
        }
        version: string
        platform: string
        colorScheme: 'light' | 'dark'
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
        }
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean

        ready: () => void
        expand: () => void
        close: () => void
        showAlert: (message: string, callback?: () => void) => void
        showConfirm: (
          message: string,
          callback?: (confirmed: boolean) => void
        ) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
              text?: string
            }>
          },
          callback?: (buttonId: string) => void
        ) => void
        openLink: (
          url: string,
          options?: { try_instant_view?: boolean }
        ) => void
        openTelegramLink: (url: string) => void
        openInvoice: (url: string, callback?: (status: string) => void) => void

        HapticFeedback: {
          impactOccurred: (
            style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
          ) => void
          notificationOccurred: (
            type: 'error' | 'success' | 'warning'
          ) => void
          selectionChanged: () => void
        }

        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }

        BackButton: {
          isVisible: boolean
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
        }

        onEvent: (eventType: string, callback: () => void) => void
        offEvent: (eventType: string, callback: () => void) => void
        readTextFromClipboard: (callback?: (text: string) => void) => void
        showScanQrPopup: (
          params: { text?: string },
          callback?: (data: string) => boolean
        ) => void
        closeScanQrPopup: () => void
        enableClosingConfirmation: () => void
        disableClosingConfirmation: () => void
        setHeaderColor: (color: string) => void
        setBackgroundColor: (color: string) => void
      }
    }
  }
}

export function useTelegramWebApp() {
  const setProfile = useUserStore((s) => s.setProfile)

  useEffect(() => {
    const tg = window.Telegram?.WebApp

    if (!tg) {
      console.warn('Telegram WebApp not available')
      return
    }

    tg.ready()
    tg.expand()

    // En 6.0+ ces APIs ne sont pas supportées (éviter les warnings)
    const version = (tg.version || '').split('.')[0]
    const isLegacy = version && parseInt(version, 10) < 6
    if (isLegacy) {
      try {
        if (typeof tg.setHeaderColor === 'function') tg.setHeaderColor('#1A1A1A')
        if (typeof tg.setBackgroundColor === 'function') tg.setBackgroundColor('#0D0800')
        if (typeof tg.enableClosingConfirmation === 'function') tg.enableClosingConfirmation()
      } catch {
        // ignoré
      }
      try {
        if (tg.BackButton && typeof tg.BackButton.onClick === 'function') {
          tg.BackButton.onClick(() => window.history.back())
        }
      } catch {
        // ignoré
      }
    }

    const user = tg.initDataUnsafe?.user
    if (user) {
      setProfile({
        id: String(user.id),
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        photoUrl: user.photo_url,
      })
    }
  }, [setProfile])

  return window.Telegram?.WebApp
}

export const telegramUtils = {
  vibrate: (
    style: 'light' | 'medium' | 'heavy' = 'medium'
  ) => {
    window.Telegram?.WebApp?.HapticFeedback?.impactOccurred(style)
  },

  notify: (type: 'error' | 'success' | 'warning') => {
    window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred(type)
  },

  alert: (message: string): Promise<void> => {
    return new Promise((resolve) => {
      window.Telegram?.WebApp?.showAlert(message, () => resolve())
    })
  },

  confirm: (message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      window.Telegram?.WebApp?.showConfirm?.(message, (confirmed: boolean) =>
        resolve(confirmed ?? false)
      )
    })
  },

  popup: (params: {
    title?: string
    message: string
    buttons: Array<{
      id: string
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive'
      text: string
    }>
  }): Promise<string> => {
    return new Promise((resolve) => {
      window.Telegram?.WebApp?.showPopup?.(params, (buttonId: string) =>
        resolve(buttonId ?? '')
      )
    })
  },

  share: (url: string, text?: string) => {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}${
      text ? `&text=${encodeURIComponent(text)}` : ''
    }`
    window.Telegram?.WebApp?.openTelegramLink(shareUrl)
  },

  openLink: (url: string, instant = false) => {
    window.Telegram?.WebApp?.openLink(url, {
      try_instant_view: instant,
    })
  },

  showMainButton: (text: string, onClick: () => void) => {
    const btn = window.Telegram?.WebApp?.MainButton
    if (!btn) return
    btn.setText(text)
    btn.onClick(onClick)
    btn.show()
  },

  hideMainButton: () => {
    window.Telegram?.WebApp?.MainButton?.hide()
  },

  showBackButton: () => {
    window.Telegram?.WebApp?.BackButton?.show()
  },

  hideBackButton: () => {
    window.Telegram?.WebApp?.BackButton?.hide()
  },

  close: () => {
    window.Telegram?.WebApp?.close()
  },

  openInvoice: (invoiceUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      window.Telegram?.WebApp?.openInvoice?.(invoiceUrl, (status) =>
        resolve(status ?? '')
      )
    })
  },

  scanQR: (text = 'Scannez le QR code'): Promise<string | null> => {
    return new Promise((resolve) => {
      window.Telegram?.WebApp?.showScanQrPopup?.({ text }, (data: string) => {
        resolve(data ?? null)
        return true
      })
    })
  },
}
