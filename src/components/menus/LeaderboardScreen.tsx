import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useThemeStore } from '@/stores/themeStore'

interface LeaderboardScreenProps {
  onBack: () => void
}

const mockLeaderboard = [
  { rank: 1, name: 'Joueur1', score: 1250, wins: 42 },
  { rank: 2, name: 'Joueur2', score: 1180, wins: 38 },
  { rank: 3, name: 'Joueur3', score: 1100, wins: 35 },
]

export function LeaderboardScreen({ onBack }: LeaderboardScreenProps) {
  const theme = useThemeStore((s) => s.theme)

  return (
    <div data-theme={theme} className="min-h-screen flex flex-col items-center p-4 bg-gradient-to-b from-[var(--ui-bg)] to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-[var(--accent)] text-center mb-6">
          Classement
        </h1>
        <ul className="space-y-2 mb-6">
          {mockLeaderboard.map((entry) => (
            <li
              key={entry.rank}
              className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-[var(--ui-border)]"
            >
              <span className="font-bold text-white/90">#{entry.rank}</span>
              <span className="text-white">{entry.name}</span>
              <span className="text-[var(--accent)]">{entry.score} pts</span>
            </li>
          ))}
        </ul>
        <Button variant="secondary" onClick={onBack} fullWidth>
          Retour
        </Button>
      </motion.div>
    </div>
  )
}
