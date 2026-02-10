import { useEffect } from 'react'
import { useThemeStore } from '@/stores/themeStore'
import type { ThemeColors, ThemeType } from '@/styles/themes/themeConfig'

export function useTheme() {
  const { currentTheme, colors, setTheme, toggleTheme } = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }, [currentTheme])

  return {
    theme: currentTheme,
    colors,
    setTheme,
    toggleTheme,
  }
}

/** Retourne les couleurs du thème actif (plateau, pièces, UI, états, effets). */
export function useThemeColors(): ThemeColors {
  return useThemeStore((s) => s.colors)
}

export type { ThemeColors, ThemeType }
