import { Button } from '@/components/ui/Button'
import { useGameStore } from '@/stores/gameStore'

interface GameControlsProps {
  onBack: () => void
}

export function GameControls({ onBack }: GameControlsProps) {
  const status = useGameStore((s) => s.status)
  const winner = useGameStore((s) => s.winner)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const resetGame = useGameStore((s) => s.resetGame)
  const startGame = useGameStore((s) => s.startGame)
  const gameMode = useGameStore((s) => s.gameMode)
  const aiDifficulty = useGameStore((s) => s.aiDifficulty)

  return (
    <div className="flex flex-wrap gap-3 justify-center items-center mt-4">
      <Button variant="secondary" onClick={onBack}>
        Retour
      </Button>
      {status === 'playing' && (
        <span className="text-sm text-white/80">
          Tour: {currentTurn === 'white' ? 'Blancs' : 'Noirs'}
        </span>
      )}
      {status === 'finished' && (
        <>
          <span className="text-lg font-bold text-yellow-400">
            {winner === 'white' ? 'Blancs gagnent !' : 'Noirs gagnent !'}
          </span>
          <Button
            variant="primary"
            onClick={() =>
            gameMode &&
            startGame(
              gameMode === 'ai' ? 'vs-ai' : 'vs-friend',
              gameMode === 'ai' ? aiDifficulty ?? 3 : undefined
            )
          }
          >
            Rejouer
          </Button>
        </>
      )}
      {status === 'idle' && (
        <Button variant="primary" onClick={() => resetGame()}>
          Nouvelle partie
        </Button>
      )}
    </div>
  )
}
