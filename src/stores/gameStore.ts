import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { board2DToFlat, getValidMoves, hasMandatoryCapture } from '@/utils/gameRules'
import type { Position, Move, BoardPiece } from '@/types'

const BOARD_SIZE = 10

export type ValidMoveFull = { to: Position; captures?: Position[] }

interface GameState {
  board: (BoardPiece | null)[][]
  currentTurn: 'white' | 'black'
  selectedSquare: Position | null
  validMoves: Position[]
  /** Coups complets (avec prises) pour appliquer correctement makeMove */
  validMovesFull: ValidMoveFull[]
  moveHistory: Move[]
  capturedPieces: { white: BoardPiece[]; black: BoardPiece[] }
  gameId: string | null
  gameMode: 'online' | 'ai' | null
  aiDifficulty: 1 | 2 | 3 | 4 | 5 | null
  status: 'idle' | 'playing' | 'finished' | 'draw'
  winner: 'white' | 'black' | null
  lastMove: Move | null

  initBoard: () => void
  setBoard: (board: (BoardPiece | null)[][]) => void
  selectSquare: (position: Position) => void
  clearSelection: () => void
  makeMove: (move: Move) => void
  undoMove: () => void
  setCurrentTurn: (turn: 'white' | 'black') => void
  resetGame: () => void
  setGameMode: (mode: 'online' | 'ai', difficulty?: 1 | 2 | 3 | 4 | 5) => void
  setStatus: (status: GameState['status']) => void
  setWinner: (winner: GameState['winner']) => void
  startGame: (mode: 'vs-ai' | 'vs-friend', difficulty?: 1 | 2 | 3 | 4 | 5) => void
}

function initialBoard(): (BoardPiece | null)[][] {
  const board: (BoardPiece | null)[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null))

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'pawn', player: 'white' }
      }
    }
  }

  for (let row = 6; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'pawn', player: 'black' }
      }
    }
  }

  return board
}

function computeValidMovesFromRules(
  board: (BoardPiece | null)[][],
  from: Position,
  currentTurn: 'white' | 'black'
): ValidMoveFull[] {
  const flat = board2DToFlat(board)
  const color = currentTurn === 'white' ? 'light' : 'dark'
  const size = 10 as 8 | 10
  const allMoves = getValidMoves(flat, from, size)
  if (allMoves.length === 0) return []
  const mustCapture = hasMandatoryCapture(flat, color, size)
  const moves = mustCapture ? allMoves.filter((m) => m.captures?.length) : allMoves
  return moves.length ? moves : allMoves
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        board: initialBoard(),
        currentTurn: 'white',
        selectedSquare: null,
        validMoves: [],
        validMovesFull: [],
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        gameId: null,
        gameMode: null,
        aiDifficulty: null,
        status: 'idle',
        winner: null,
        lastMove: null,

        initBoard: () =>
          set({
            board: initialBoard(),
            currentTurn: 'white',
        selectedSquare: null,
        validMoves: [],
        validMovesFull: [],
        moveHistory: [],
        capturedPieces: { white: [], black: [] },
        lastMove: null,
      }),

        setBoard: (board) => set({ board }),

        selectSquare: (position) => {
          const { board, currentTurn } = get()
          const piece = board[position.row]?.[position.col]

          if (!piece || piece.player !== currentTurn) {
            set({ selectedSquare: null, validMoves: [], validMovesFull: [] })
            return
          }

          const validMovesFull = computeValidMovesFromRules(board, position, currentTurn)
          const validMoves = validMovesFull.map((m) => m.to)
          set({ selectedSquare: position, validMoves, validMovesFull })
        },

        clearSelection: () => set({ selectedSquare: null, validMoves: [], validMovesFull: [] }),

        makeMove: (move) => {
          const {
            board,
            currentTurn,
            moveHistory,
            capturedPieces,
            validMovesFull,
          } = get()

          const fullMove = validMovesFull?.find(
            (m) => m.to.row === move.to.row && m.to.col === move.to.col
          )
          const captures = fullMove?.captures ?? move.captures

          const newBoard = board.map((row) => [...row])
          const piece = newBoard[move.from.row]?.[move.from.col]
          if (!piece) return

          newBoard[move.to.row][move.to.col] = piece
          newBoard[move.from.row][move.from.col] = null

          const newCapturedPieces = { ...capturedPieces }
          if (captures?.length) {
            for (const capturePos of captures) {
              const capturedPiece = newBoard[capturePos.row]?.[capturePos.col]
              if (capturedPiece) {
                newCapturedPieces[capturedPiece.player].push(capturedPiece)
                newBoard[capturePos.row][capturePos.col] = null
              }
            }
          }

          if (piece.type === 'pawn') {
            if (
              (piece.player === 'white' && move.to.row === BOARD_SIZE - 1) ||
              (piece.player === 'black' && move.to.row === 0)
            ) {
              newBoard[move.to.row][move.to.col] = { ...piece, type: 'king' }
            }
          }

          set({
            board: newBoard,
            currentTurn: currentTurn === 'white' ? 'black' : 'white',
            selectedSquare: null,
            validMoves: [],
            validMovesFull: [],
            moveHistory: [...moveHistory, { ...move, captures }],
            capturedPieces: newCapturedPieces,
            lastMove: { ...move, captures },
          })
        },

        undoMove: () => {
          const { moveHistory } = get()
          if (moveHistory.length === 0) return
          set({ moveHistory: moveHistory.slice(0, -1) })
        },

        setCurrentTurn: (turn) => set({ currentTurn: turn }),

        resetGame: () =>
          set({
            board: initialBoard(),
            currentTurn: 'white',
            selectedSquare: null,
            validMoves: [],
            validMovesFull: [],
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            gameId: null,
            status: 'idle',
            winner: null,
            lastMove: null,
          }),

        setGameMode: (mode, difficulty) =>
          set({
            gameMode: mode,
            aiDifficulty: mode === 'ai' ? difficulty ?? null : null,
          }),

        setStatus: (status) => set({ status }),
        setWinner: (winner) => set({ winner, status: 'finished' }),

        startGame: (mode, difficulty) => {
          const gameMode = mode === 'vs-friend' ? 'online' : 'ai'
          set({
            gameMode,
            aiDifficulty: gameMode === 'ai' ? (difficulty ?? 3) : null,
            board: initialBoard(),
            currentTurn: 'white',
            selectedSquare: null,
            validMoves: [],
            validMovesFull: [],
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null,
            status: 'playing',
            winner: null,
          })
        },
      }),
      {
        name: 'game-storage',
        partialize: (state) => ({
          moveHistory: state.moveHistory,
          gameMode: state.gameMode,
          aiDifficulty: state.aiDifficulty,
        }),
      }
    )
  )
)
