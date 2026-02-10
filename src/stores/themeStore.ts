import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeType, ThemeColors } from '@/styles/themes/themeConfig'
import { getTheme } from '@/styles/themes/themeConfig'

interface ThemeStore {
  currentTheme: ThemeType
  theme: ThemeType
  colors: ThemeColors
  setTheme: (theme: ThemeType) => void
  toggleTheme: () => void
}

const THEME_CLASSES = ['theme-bronze', 'theme-silver', 'theme-gold'] as const

function applyThemeToDocument(theme: ThemeType, haptic = false): void {
  const colors = getTheme(theme)
  document.documentElement.setAttribute('data-theme', theme)
  THEME_CLASSES.forEach((c) => document.documentElement.classList.remove(c))
  document.documentElement.classList.add(`theme-${theme}`)
  Object.entries(colors).forEach(([key, value]) => {
    const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`
    document.documentElement.style.setProperty(cssVar, value)
  })
  if (haptic && window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
  }
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      currentTheme: 'bronze',
      theme: 'bronze',
      colors: getTheme('bronze'),

      setTheme: (theme: ThemeType) => {
        const colors = getTheme(theme)
        applyThemeToDocument(theme, true)
        set({ currentTheme: theme, theme, colors })
      },

      toggleTheme: () => {
        const themes: ThemeType[] = ['bronze', 'silver', 'gold']
        const currentIndex = themes.indexOf(get().currentTheme)
        const nextTheme = themes[(currentIndex + 1) % themes.length]
        get().setTheme(nextTheme)
      },
    }),
    {
      name: 'dame-theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state?.currentTheme) {
          applyThemeToDocument(state.currentTheme, false)
        }
      },
    }
  )
)
