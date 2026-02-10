import { motion } from 'framer-motion'
import { useGameStore } from '@/stores/gameStore'
import { useThemeStore } from '@/stores/themeStore'

interface ResultsScreenProps {
  onReplay: () => void
  onMenu: () => void
}

export function ResultsScreen({ onReplay, onMenu }: ResultsScreenProps) {
  const theme = useThemeStore((s) => s.theme)
  const winner = useGameStore((s) => s.winner)

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[var(--ui-bg)] to-black">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center max-w-sm w-full rounded-2xl bg-black/30 border border-[var(--ui-border)] p-8"
      >
        <h2 className="text-2xl font-bold text-[var(--accent)] mb-2">
          Partie terminée
        </h2>
        <p className="text-white/90 text-lg mb-6">
          {winner
            ? `${winner === 'white' ? 'Blancs' : 'Noirs'} gagnent !`
            : 'Match nul'}
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onReplay()
            }}
            className="w-full px-6 py-3.5 rounded-xl font-semibold bg-[var(--accent)] hover:opacity-90 text-white border border-[var(--accent-hover)] transition-opacity"
          >
            Rejouer
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMenu()
            }}
            className="w-full px-6 py-3 rounded-xl font-semibold bg-transparent text-[var(--accent)] border border-[var(--ui-border)] hover:bg-white/10 transition-colors"
          >
            Menu principal
          </button>
        </div>
      </motion.div>
    </div>
  )
}
