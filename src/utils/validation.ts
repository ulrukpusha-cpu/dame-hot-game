import type { Position, PiecePosition } from '@/types'
import {
  getPieceAt,
  getValidMoves,
  hasMandatoryCapture,
  checkPromotion,
} from '@/utils/gameRules'

export function isValidMove(
  board: PiecePosition[],
  from: Position,
  to: Position,
  currentTurn: 'light' | 'dark',
  size: 8 | 10
): { valid: boolean; captures?: Position[]; promoted?: boolean } {
  const piece = getPieceAt(board, from)
  if (!piece || piece.color !== currentTurn) {
    return { valid: false }
  }

  const mandatoryCapture = hasMandatoryCapture(board, currentTurn, size)
  const moves = getValidMoves(board, from, size)

  const move = moves.find(
    (m) => m.to.row === to.row && m.to.col === to.col
  )
  if (!move) return { valid: false }

  if (mandatoryCapture && !move.captures?.length) {
    const hasJump = moves.some((m) => m.captures && m.captures.length > 0)
    if (hasJump) return { valid: false }
  }

  const promoted = piece.type === 'pawn' && checkPromotion(to, piece.color, size)
  return {
    valid: true,
    captures: move.captures,
    promoted,
  }
}
