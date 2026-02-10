import { useEffect, useMemo } from 'react'
import { getTelegramWebApp, hapticFeedback } from '@/services/telegram'

export function useTelegram() {
  const tg = getTelegramWebApp()

  useEffect(() => {
    tg?.ready()
    tg?.expand()
  }, [tg])

  const user = useMemo(() => {
    const u = tg?.initDataUnsafe?.user
    if (!u) return null
    return {
      id: String(u.id),
      firstName: u.first_name,
      lastName: u.last_name,
      username: u.username,
    }
  }, [tg])

  const haptic = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    hapticFeedback(style)
  }

  return { tg, user, haptic, isTelegram: !!tg }
}
