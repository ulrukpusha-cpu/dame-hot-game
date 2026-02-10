import { useRef, useEffect, useCallback } from 'react'
import { useTheme } from '@/hooks/useTheme'
import { Piece } from './Piece'
import { Square } from './Square'
import { useGameStore } from '@/stores/gameStore'
import type { Position, Move, BoardPiece, PiecePosition } from '@/types'

const SIZE = 10

const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

interface BoardProps {
  onMove?: (move: Move) => void
  disabled?: boolean
  showCoordinates?: boolean
}

function boardPieceToPiecePosition(
  piece: BoardPiece,
  row: number,
  col: number
): PiecePosition {
  return {
    id: `${row}-${col}`,
    position: { row, col },
    color: piece.player === 'white' ? 'light' : 'dark',
    type: piece.type,
  }
}

function checkIfLastMove(position: Position): boolean {
  const { lastMove } = useGameStore.getState()
  if (!lastMove) return false
  return (
    (lastMove.from.row === position.row &&
      lastMove.from.col === position.col) ||
    (lastMove.to.row === position.row && lastMove.to.col === position.col)
  )
}

function playSound(sound: string) {
  const audio = new Audio(`/sounds/${sound}.mp3`)
  audio.volume = 0.3
  audio.play().catch(() => {})
}

function vibrate(style: 'light' | 'medium' | 'heavy') {
  if (window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
  }
}

export function Board({
  onMove,
  disabled = false,
  showCoordinates = true,
}: BoardProps) {
  const { theme, colors } = useTheme()
  const board = useGameStore((s) => s.board)
  const selectedSquare = useGameStore((s) => s.selectedSquare)
  const validMoves = useGameStore((s) => s.validMoves)
  const currentTurn = useGameStore((s) => s.currentTurn)
  const clearSelection = useGameStore((s) => s.clearSelection)
  const selectSquare = useGameStore((s) => s.selectSquare)
  const makeMove = useGameStore((s) => s.makeMove)

  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (theme === 'gold' && boardRef.current) {
      const interval = setInterval(() => {
        if (!boardRef.current) return
        const particle = document.createElement('div')
        particle.className = 'particle'
        particle.style.left = `${Math.random() * 100}%`
        particle.style.bottom = '0'
        boardRef.current.appendChild(particle)
        setTimeout(() => particle.remove(), 3000)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [theme])

  const isValidMoveTarget = useCallback(
    (position: Position) =>
      validMoves.some(
        (v) => v.row === position.row && v.col === position.col
      ),
    [validMoves]
  )

  const handleSquareClick = useCallback(
    (position: Position) => {
      if (disabled) return

      const piece = board[position.row]?.[position.col] ?? null

      if (selectedSquare) {
        if (isValidMoveTarget(position)) {
          const move: Move = {
            from: selectedSquare,
            to: position,
          }
          makeMove(move)
          onMove?.(move)
          clearSelection()
          playSound('move')
          vibrate('light')
        } else if (piece && piece.player === currentTurn) {
          selectSquare(position)
        } else {
          clearSelection()
        }
      } else if (piece && piece.player === currentTurn) {
        selectSquare(position)
      }
    },
    [
      disabled,
      board,
      selectedSquare,
      validMoves,
      currentTurn,
      clearSelection,
      selectSquare,
      makeMove,
      onMove,
      isValidMoveTarget,
    ]
  )

  return (
    <div
      ref={boardRef}
      className={`board-container theme-${theme} relative inline-block p-2 rounded-2xl`}
      style={{
        background: colors.boardBackground,
      }}
    >
      <div className="board-border absolute inset-0 pointer-events-none rounded-2xl">
        {theme === 'gold' && (
          <>
            <div className="board-corner absolute top-2 left-2" />
            <div className="board-corner absolute top-2 right-2" />
            <div className="board-corner absolute bottom-2 left-2" />
            <div className="board-corner absolute bottom-2 right-2" />
          </>
        )}
      </div>

      <div
        className={`board grid gap-0.5 rounded-xl overflow-hidden shadow-2xl relative mx-auto ${showCoordinates ? 'pl-7 pt-7' : 'p-2'}`}
        style={{
          gridTemplateColumns: `repeat(${SIZE}, 1fr)`,
          boxShadow: `var(--board-shadow, 0 10px 40px rgba(0,0,0,0.4))`,
        }}
      >
        {showCoordinates && (
          <>
            <div
              className="absolute left-0 top-0 bottom-0 flex flex-col justify-around items-center w-7 text-xs font-semibold z-10 pointer-events-none"
              style={{ color: colors.textSecondary }}
            >
              {Array.from({ length: SIZE }, (_, i) => SIZE - i).map((num) => (
                <span key={num}>{num}</span>
              ))}
            </div>
            <div
              className="absolute top-0 left-7 right-0 flex justify-around items-center h-7 text-xs font-semibold z-10 pointer-events-none"
              style={{ color: colors.textSecondary }}
            >
              {COL_LETTERS.slice(0, SIZE).map((letter) => (
                <span key={letter}>{letter}</span>
              ))}
            </div>
          </>
        )}

        {Array.from({ length: SIZE * SIZE }, (_, i) => {
          const rowIndex = Math.floor(i / SIZE)
          const colIndex = i % SIZE
          const position: Position = { row: rowIndex, col: colIndex }
          const isLight = (rowIndex + colIndex) % 2 === 0
          const cellPiece = board[rowIndex]?.[colIndex] ?? null
          const pieceForRender =
            cellPiece &&
            boardPieceToPiecePosition(cellPiece, rowIndex, colIndex)
          const isSelected =
            selectedSquare?.row === rowIndex &&
            selectedSquare?.col === colIndex
          const isValidMoveTargetCell = isValidMoveTarget(position)
          const isLastMove = checkIfLastMove(position)

          return (
            <Square
              key={`${rowIndex}-${colIndex}`}
              position={position}
              isLight={isLight}
              isSelected={isSelected}
              isValidMove={isValidMoveTargetCell}
              isLastMove={isLastMove}
              onClick={() => handleSquareClick(position)}
              theme={theme}
            >
              {pieceForRender && (
                <Piece
                  piece={pieceForRender}
                  position={position}
                  theme={theme}
                  isSelected={isSelected}
                />
              )}
            </Square>
          )
        })}
      </div>

      {theme === 'gold' && (
        <div
          className="absolute inset-0 pointer-events-none rounded-2xl"
          style={{ animation: 'var(--glow-animation)' }}
        />
      )}
    </div>
  )
}
