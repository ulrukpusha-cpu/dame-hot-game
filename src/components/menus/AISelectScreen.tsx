import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

interface AISelectScreenProps {
  onSelectDifficulty: (level: 1 | 2 | 3 | 4 | 5) => void
  onBack: () => void
}

function vibrate(style: 'light' | 'medium' | 'heavy') {
  if (window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
  }
}

const difficulties = [
  {
    level: 1 as const,
    name: 'Débutant',
    description: 'Parfait pour apprendre',
    icon: '🐣',
    color: '#4CAF50',
    stars: 1,
  },
  {
    level: 2 as const,
    name: 'Facile',
    description: 'Quelques tactiques de base',
    icon: '🌱',
    color: '#8BC34A',
    stars: 2,
  },
  {
    level: 3 as const,
    name: 'Moyen',
    description: 'Un vrai défi',
    icon: '⚡',
    color: '#FF9800',
    stars: 3,
  },
  {
    level: 4 as const,
    name: 'Difficile',
    description: 'Pour les joueurs expérimentés',
    icon: '🔥',
    color: '#FF5722',
    stars: 4,
  },
  {
    level: 5 as const,
    name: 'Expert',
    description: 'Quasi-imbattable',
    icon: '👑',
    color: '#9C27B0',
    stars: 5,
  },
]

export function AISelectScreen({ onSelectDifficulty, onBack }: AISelectScreenProps) {
  const { colors } = useTheme()

  const handleDifficultySelect = (level: 1 | 2 | 3 | 4 | 5) => {
    vibrate('medium')
    onSelectDifficulty(level)
  }

  return (
    <div
      className="min-h-screen p-6 flex flex-col"
      style={{ background: colors.background }}
    >
      {/* Header avec bouton retour */}
      <motion.div
        className="mb-8 flex items-center gap-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.surface }}
          aria-label="Retour"
        >
          <svg
            className="w-6 h-6"
            style={{ color: colors.text }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="flex-1 text-center pr-10">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Choisir la difficulté
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Sélectionnez le niveau de l&apos;IA
          </p>
        </div>
      </motion.div>

      {/* Niveaux */}
      <div className="space-y-4 max-w-2xl mx-auto flex-1">
        {difficulties.map((diff, index) => (
          <motion.div
            key={diff.level}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <motion.button
              type="button"
              onClick={() => handleDifficultySelect(diff.level)}
              className="w-full p-6 rounded-2xl relative overflow-hidden"
              style={{
                backgroundColor: colors.surface,
                border: `3px solid ${diff.color}`,
              }}
              whileHover={{ scale: 1.03, x: 10 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  background: `linear-gradient(135deg, ${diff.color}, transparent)`,
                }}
              />

              <div className="relative flex items-center gap-6">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                  style={{ backgroundColor: diff.color + '20' }}
                >
                  {diff.icon}
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-3 mb-2">
                    <h3
                      className="text-2xl font-bold"
                      style={{ color: diff.color }}
                    >
                      {diff.name}
                    </h3>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className="text-lg"
                          style={{
                            color:
                              i < diff.stars ? diff.color : colors.border,
                            opacity: i < diff.stars ? 1 : 0.3,
                          }}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  </div>
                  <p style={{ color: colors.textSecondary }}>
                    {diff.description}
                  </p>
                </div>

                <svg
                  className="w-8 h-8"
                  style={{ color: diff.color }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* Info supplémentaire */}
      <motion.div
        className="mt-8 p-6 rounded-xl max-w-2xl mx-auto"
        style={{ backgroundColor: colors.surface }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="flex items-start gap-4">
          <div className="text-3xl">💡</div>
          <div>
            <h4 className="font-bold mb-2" style={{ color: colors.text }}>
              Conseil
            </h4>
            <p
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Commencez par le niveau Débutant pour apprendre les bases, puis
              progressez vers les niveaux supérieurs. L&apos;IA Expert utilise un
              algorithme Minimax avancé !
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
