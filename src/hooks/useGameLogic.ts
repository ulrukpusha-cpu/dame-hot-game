import { useEffect, useCallback } from 'react'
import { useGameStore } from '@/stores/gameStore'
import { isGameOver, board2DToFlat } from '@/utils/gameRules'
import { DameAI } from '@/utils/ai'
import { toAIBoard } from '@/utils/boardAdapter'

const BOARD_SIZE = 10

export function useGameLogic() {
  const board = useGameStore((s) => s.board)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const status = useGameStore((s) => s.status)
  const gameMode = useGameStore((s) => s.gameMode)
  const aiDifficulty = useGameStore((s) => s.aiDifficulty)
  const setWinner = useGameStore((s) => s.setWinner)
  const setStatus = useGameStore((s) => s.setStatus)
  const makeMove = useGameStore((s) => s.makeMove)
  const setAIIsThinking = useGameStore((s) => s.setAIIsThinking)

  const currentTurnColor = currentTurn === 'white' ? 'light' : 'dark'

  const checkGameOver = useCallback(() => {
    const flatBoard = board2DToFlat(board)
    const { over, winner } = isGameOver(
      flatBoard,
      currentTurnColor,
      BOARD_SIZE
    )
    if (over) {
      setWinner(winner === 'light' ? 'white' : 'black')
      setStatus('finished')
    }
  }, [board, currentTurnColor, setWinner, setStatus])

  useEffect(() => {
    if (status !== 'playing' || gameMode !== 'ai') return
    if (currentTurn !== 'black') return

    setAIIsThinking(true)
    const timer = setTimeout(() => {
      const flatBoard = board2DToFlat(board)
      const aiBoard = toAIBoard(flatBoard, currentTurnColor, BOARD_SIZE)
      const ai = new DameAI(aiDifficulty ?? 3)
      const move = ai.getBestMove(aiBoard)
      ai.clearCache()
      if (move) {
        makeMove({
          from: move.from,
          to: move.to,
          captures: move.captures,
        })
      }
      setAIIsThinking(false)
    }, 400)

    return () => {
      clearTimeout(timer)
      setAIIsThinking(false)
    }
  }, [board, currentTurn, status, gameMode, aiDifficulty, makeMove, currentTurnColor, setAIIsThinking])

  useEffect(() => {
    if (status !== 'playing') return
    const moveCount = useGameStore.getState().moveHistory.length
    if (moveCount === 0) return
    checkGameOver()
  }, [board, status, checkGameOver])
}
