import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { Position, Move, BoardPiece } from '@/types'

const BOARD_SIZE = 10

interface GameState {
  board: (BoardPiece | null)[][]
  currentTurn: 'white' | 'black'
  selectedSquare: Position | null
  validMoves: Position[]
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

function calculateValidMoves(
  board: (BoardPiece | null)[][],
  from: Position,
  piece: BoardPiece
): Position[] {
  const moves: Position[] = []
  const directions: [number, number][] =
    piece.type === 'pawn'
      ? piece.player === 'white'
        ? [
            [1, -1],
            [1, 1],
          ]
        : [
            [-1, -1],
            [-1, 1],
          ]
      : [
          [1, 1],
          [1, -1],
          [-1, 1],
          [-1, -1],
        ]

  for (const [dRow, dCol] of directions) {
    const to: Position = {
      row: from.row + dRow,
      col: from.col + dCol,
    }
    if (
      to.row >= 0 &&
      to.row < BOARD_SIZE &&
      to.col >= 0 &&
      to.col < BOARD_SIZE
    ) {
      if (!board[to.row][to.col]) {
        moves.push(to)
      }
    }
  }

  return moves
}

export const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set, get) => ({
        board: initialBoard(),
        currentTurn: 'white',
        selectedSquare: null,
        validMoves: [],
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
            moveHistory: [],
            capturedPieces: { white: [], black: [] },
            lastMove: null,
          }),

        setBoard: (board) => set({ board }),

        selectSquare: (position) => {
          const { board, currentTurn } = get()
          const piece = board[position.row][position.col]

          if (!piece || piece.player !== currentTurn) {
            set({ selectedSquare: null, validMoves: [] })
            return
          }

          const validMoves = calculateValidMoves(board, position, piece)
          set({ selectedSquare: position, validMoves })
        },

        clearSelection: () => set({ selectedSquare: null, validMoves: [] }),

        makeMove: (move) => {
          const {
            board,
            currentTurn,
            moveHistory,
            capturedPieces,
          } = get()

          const newBoard = board.map((row) => [...row])
          const piece = newBoard[move.from.row][move.from.col]
          if (!piece) return

          newBoard[move.to.row][move.to.col] = piece
          newBoard[move.from.row][move.from.col] = null

          const newCapturedPieces = { ...capturedPieces }
          if (move.captures) {
            for (const capturePos of move.captures) {
              const capturedPiece = newBoard[capturePos.row][capturePos.col]
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
            moveHistory: [...moveHistory, move],
            capturedPieces: newCapturedPieces,
            lastMove: move,
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
