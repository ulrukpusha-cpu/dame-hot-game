import type {
  PiecePosition,
  Position,
  PlayerColor,
  BoardPiece,
} from '@/types'

const LIGHT_ROWS = 3
const DARK_ROWS = 3

export function createInitialBoard(size: 8 | 10): PiecePosition[] {
  const pieces: PiecePosition[] = []
  let id = 0

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const isDark = (row + col) % 2 === 1
      if (!isDark) continue

      if (row < LIGHT_ROWS) {
        pieces.push({
          id: `light-${id++}`,
          position: { row, col },
          color: 'light',
          type: 'pawn',
        })
      } else if (row >= size - DARK_ROWS) {
        pieces.push({
          id: `dark-${id++}`,
          position: { row, col },
          color: 'dark',
          type: 'pawn',
        })
      }
    }
  }
  return pieces
}

export function posKey(p: Position): string {
  return `${p.row}-${p.col}`
}

export function posEquals(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col
}

export function getPieceAt(
  board: PiecePosition[],
  pos: Position
): PiecePosition | undefined {
  return board.find(
    (p) => p.position.row === pos.row && p.position.col === pos.col
  )
}

export function isOnBoard(size: number, pos: Position): boolean {
  return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size
}

export function getValidMoves(
  board: PiecePosition[],
  from: Position,
  size: 8 | 10
): { to: Position; captures?: Position[] }[] {
  const piece = getPieceAt(board, from)
  if (!piece) return []

  const moves: { to: Position; captures?: Position[] }[] = []
  const isKing = piece.type === 'king'
  const dirs: [number, number][] = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]
  const moveDirs = piece.color === 'light' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]
  const used = moveDirs as [number, number][]
  const allDirs = isKing ? dirs : used

  const jumps = getJumpMoves(board, from, piece, size)
  if (jumps.length > 0) return jumps

  for (const [dr, dc] of allDirs) {
    let r = from.row + dr
    let c = from.col + dc
    if (!isKing) {
      if (isOnBoard(size, { row: r, col: c }) && !getPieceAt(board, { row: r, col: c })) {
        moves.push({ to: { row: r, col: c } })
      }
      continue
    }
    while (isOnBoard(size, { row: r, col: c })) {
      if (!getPieceAt(board, { row: r, col: c })) {
        moves.push({ to: { row: r, col: c } })
      } else break
      r += dr
      c += dc
    }
  }
  return moves
}

function getJumpMoves(
  board: PiecePosition[],
  from: Position,
  piece: PiecePosition,
  size: 8 | 10
): { to: Position; captures: Position[] }[] {
  const results: { to: Position; captures: Position[] }[] = []
  const isKing = piece.type === 'king'
  const dirs: [number, number][] = [
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ]
  const moveDirs = piece.color === 'light' ? [[1, -1], [1, 1]] : [[-1, -1], [-1, 1]]
  const used = isKing ? dirs : (moveDirs as [number, number][])

  for (const [dr, dc] of used) {
    const over = { row: from.row + dr, col: from.col + dc }
    const to = { row: from.row + 2 * dr, col: from.col + 2 * dc }
    if (!isOnBoard(size, over) || !isOnBoard(size, to)) continue
    const overPiece = getPieceAt(board, over)
    const toPiece = getPieceAt(board, to)
    if (overPiece && overPiece.color !== piece.color && !toPiece) {
      results.push({ to, captures: [over] })
    }
  }

  if (isKing) {
    for (const [dr, dc] of dirs) {
      let r = from.row + dr
      let c = from.col + dc
      let captured: Position | null = null
      while (isOnBoard(size, { row: r, col: c })) {
        const p = getPieceAt(board, { row: r, col: c })
        if (p) {
          if (p.color === piece.color) break
          if (captured) break
          captured = { row: r, col: c }
          r += dr
          c += dc
          if (isOnBoard(size, { row: r, col: c }) && !getPieceAt(board, { row: r, col: c }) && captured) {
            results.push({ to: { row: r, col: c }, captures: [captured] })
          }
          break
        }
        r += dr
        c += dc
      }
    }
  }
  return results
}

export function hasMandatoryCapture(
  board: PiecePosition[],
  currentTurn: PlayerColor,
  size: 8 | 10
): boolean {
  for (const p of board) {
    if (p.color !== currentTurn) continue
    const jumps = getJumpMoves(board, p.position, p, size)
    if (jumps.length > 0) return true
  }
  return false
}

export function getPromotionRow(color: PlayerColor, size: number): number {
  return color === 'light' ? size - 1 : 0
}

export function checkPromotion(pos: Position, color: PlayerColor, size: number): boolean {
  return pos.row === getPromotionRow(color, size)
}

export function countPieces(board: PiecePosition[], color: PlayerColor): number {
  return board.filter((p) => p.color === color).length
}

export function isGameOver(
  board: PiecePosition[],
  currentTurn: PlayerColor,
  size: 8 | 10 = 8
): { over: boolean; winner: PlayerColor | null } {
  const lightCount = countPieces(board, 'light')
  const darkCount = countPieces(board, 'dark')
  if (lightCount === 0) return { over: true, winner: 'dark' }
  if (darkCount === 0) return { over: true, winner: 'light' }
  const moves = board
    .filter((p) => p.color === currentTurn)
    .flatMap((p) => getValidMoves(board, p.position, size))
  if (moves.length === 0) {
    return { over: true, winner: currentTurn === 'light' ? 'dark' : 'light' }
  }
  return { over: false, winner: null }
}

/** Convertit le plateau 2D (store) en liste de pièces pour isGameOver / AI */
export function board2DToFlat(
  board: (BoardPiece | null)[][]
): PiecePosition[] {
  const pieces: PiecePosition[] = []
  const size = board.length
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const cell = board[row]?.[col]
      if (!cell) continue
      pieces.push({
        id: `${row}-${col}`,
        position: { row, col },
        color: cell.player === 'white' ? 'light' : 'dark',
        type: cell.type,
      })
    }
  }
  return pieces
}
