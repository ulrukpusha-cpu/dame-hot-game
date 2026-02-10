import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemeColors, ThemeType } from '@/styles/themes/themeConfig'

export function useTheme() {
  const { currentTheme, colors, setTheme, toggleTheme } = useThemeStore(
    useShallow((s) => ({
      currentTheme: s.currentTheme,
      colors: s.colors,
      setTheme: s.setTheme,
      toggleTheme: s.toggleTheme,
    }))
  )

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  return useMemo(
    () => ({ theme: currentTheme, colors, setTheme, toggleTheme }),
    [currentTheme, colors, setTheme, toggleTheme]
  )
}

/** Retourne les couleurs du thème actif (plateau, pièces, UI, états, effets). */
export function useThemeColors(): ThemeColors {
  return useThemeStore((s) => s.colors)
}

export type { ThemeColors, ThemeType }
