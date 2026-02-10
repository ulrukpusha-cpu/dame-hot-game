import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Board } from '@/components/game/Board'
import { GameControls } from '@/components/game/GameControls'
import { MoveHistory } from '@/components/game/MoveHistory'
import { MainMenu } from '@/components/menus/MainMenu'
import { ThemeSelector } from '@/components/menus/ThemeSelector'
import { BettingPanel } from '@/components/menus/BettingPanel'
import { ResultsScreen } from '@/components/menus/ResultsScreen'
import { LeaderboardScreen } from '@/components/menus/LeaderboardScreen'
import { FriendsScreen } from '@/components/menus/FriendsScreen'
import { AISelectScreen } from '@/components/menus/AISelectScreen'
import { MultiplayerGameScreen } from '@/components/menus/MultiplayerGameScreen'
import { useTheme } from '@/hooks/useTheme'
import { useGameLogic } from '@/hooks/useGameLogic'
import { useGameStore } from '@/stores/gameStore'
import { useTelegramWebApp } from '@/lib/telegram'
import type { Screen } from '@/types'

function App() {
  useTelegramWebApp()
  const { theme, colors } = useTheme()
  useGameLogic()

  useEffect(() => {
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(
        `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
        value
      )
    })
    document.body.className = `theme-${theme}`
  }, [theme, colors])

  const [screen, setScreen] = useState<Screen>('menu')
  const [showBetting, setShowBetting] = useState(false)

  const status = useGameStore((s) => s.status)
  const startGame = useGameStore((s) => s.startGame)
  const gameMode = useGameStore((s) => s.gameMode)

  useEffect(() => {
    if (status === 'finished' && screen === 'game') setScreen('results')
  }, [status, screen])

  const goToGame = (mode: 'vs-ai' | 'vs-friend') => {
    startGame(mode)
    setScreen('game')
  }

  const goToMenu = () => {
    setScreen('menu')
    useGameStore.getState().resetGame()
  }

  const goToResultsReplay = () => {
    const store = useGameStore.getState()
    const gameMode = store.gameMode ?? 'ai'
    store.startGame(
      gameMode === 'ai' ? 'vs-ai' : 'vs-friend',
      gameMode === 'ai' ? store.aiDifficulty ?? 3 : undefined
    )
    setScreen('game')
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MainMenu
              onPlayVsAI={() => setScreen('ai-select')}
              onPlayVsFriend={() => setScreen('friend-list')}
              onLeaderboard={() => setScreen('leaderboard')}
            />
          </motion.div>
        )}

        {screen === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <LeaderboardScreen onBack={() => setScreen('menu')} />
          </motion.div>
        )}

        {screen === 'friend-list' && (
          <motion.div
            key="friend-list"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <FriendsScreen onBack={() => setScreen('menu')} />
          </motion.div>
        )}

        {screen === 'ai-select' && (
          <motion.div
            key="ai-select"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AISelectScreen
              onSelectDifficulty={(level) => {
                startGame('vs-ai', level)
                setScreen('game')
              }}
              onBack={() => setScreen('menu')}
            />
          </motion.div>
        )}

        {screen === 'game' && gameMode === 'online' && (
          <motion.div
            key="game-multiplayer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MultiplayerGameScreen onBack={goToMenu} />
          </motion.div>
        )}

        {screen === 'game' && gameMode === 'ai' && (
          <motion.div
            key="game-ai"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 py-8"
          >
            <div className="mb-2">
              <ThemeSelector />
            </div>
            <Board />
            <MoveHistory />
            <GameControls onBack={goToMenu} />
          </motion.div>
        )}

        {screen === 'game' && gameMode === null && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col items-center justify-center p-4 py-8"
          >
            <div className="mb-2">
              <ThemeSelector />
            </div>
            <Board />
            <MoveHistory />
            <GameControls onBack={goToMenu} />
          </motion.div>
        )}

        {screen === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <ResultsScreen onReplay={goToResultsReplay} onMenu={goToMenu} />
          </motion.div>
        )}
      </AnimatePresence>

      <BettingPanel
        isOpen={showBetting}
        onClose={() => setShowBetting(false)}
        onConfirm={() => setShowBetting(false)}
      />
    </div>
  )
}

export default App
