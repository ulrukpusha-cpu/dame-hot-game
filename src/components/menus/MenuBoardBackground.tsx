import { useThemeStore } from '@/stores/themeStore'

const SIZE = 10

/**
 * Plateau de dames en arrière-plan (flou) comme sur l'image d'exemple.
 */
export function MenuBoardBackground() {
  const theme = useThemeStore((s) => s.theme)

  return (
    <div
      data-theme={theme}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-hidden
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="board grid gap-0.5 rounded-xl overflow-hidden shadow-2xl opacity-60 scale-150 blur-[2px]"
        style={{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }}
      >
        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const row = Math.floor(i / SIZE)
          const col = i % SIZE
          const isDark = (row + col) % 2 === 1
          const cellClass = isDark ? 'square-dark' : 'square-light'
          return (
            <div
              key={`${row}-${col}`}
              className={`aspect-square w-8 ${cellClass}`}
            />
          )
        })}
      </div>
    </div>
  )
}
