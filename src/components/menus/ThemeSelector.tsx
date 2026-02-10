import React from 'react'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeType } from '@/styles/themes/themeConfig'

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme()

  const themes: { type: ThemeType; name: string; preview: string }[] = [
    {
      type: 'bronze',
      name: 'Bronze Classique',
      preview: '/images/theme-bronze.jpg',
    },
    {
      type: 'silver',
      name: 'Silver Moderne',
      preview: '/images/theme-silver.jpg',
    },
    {
      type: 'gold',
      name: 'Gold Premium',
      preview: '/images/theme-gold.jpg',
    },
  ]

  return (
    <div className="theme-selector p-6 bg-gray-900 rounded-2xl">
      <h3 className="text-2xl font-bold text-white mb-6">
        Choisir un thème
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {themes.map(({ type, name, preview }) => (
          <button
            key={type}
            type="button"
            onClick={() => setTheme(type)}
            className={`
              relative overflow-hidden rounded-xl transition-all duration-300
              ${theme === type
                ? 'ring-4 ring-yellow-400 scale-105'
                : 'hover:scale-105 opacity-70 hover:opacity-100'
              }
            `}
          >
            {/* Image de prévisualisation */}
            <div className="aspect-square relative">
              <img
                src={preview}
                alt={name}
                className="w-full h-full object-cover"
              />

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Nom du thème */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold text-sm text-center">
                  {name}
                </p>
              </div>

              {/* Checkmark si sélectionné */}
              {theme === type && (
                <div className="absolute top-2 right-2 bg-yellow-400 rounded-full w-8 h-8 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Aperçu du plateau */}
      <div className="mt-6 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm mb-3">Aperçu du plateau:</p>
        <div className="aspect-square max-w-xs mx-auto">
          <div className={`board theme-${theme} w-full h-full rounded-lg`}>
            {/* Mini aperçu simplifié */}
            <div className="grid grid-cols-4 gap-1 p-2 h-full">
              {[...Array(16)].map((_, i) => (
                <div
                  key={i}
                  className={
                    Math.floor(i / 4) % 2 === i % 2
                      ? 'square-light rounded'
                      : 'square-dark rounded'
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
