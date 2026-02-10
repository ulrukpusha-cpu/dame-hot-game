import type { Board, Move, Piece, Player } from '@/types/game'
import type { PiecePosition, PlayerColor } from '@/types'

/**
 * Convertit notre état (liste de pièces + tour) vers le format Board de l'IA.
 * light -> black, dark -> white (même sens de déplacement)
 */
export function toAIBoard(
  pieces: PiecePosition[],
  currentTurn: PlayerColor,
  size: 8 | 10 = 10
): Board {
  const squares: (Piece | null)[][] = Array.from({ length: size }, () =>
    Array(size).fill(null)
  )

  for (const p of pieces) {
    const player: Player = p.color === 'light' ? 'black' : 'white'
    squares[p.position.row][p.position.col] = {
      type: p.type,
      player,
    }
  }

  const currentPlayer: Player = currentTurn === 'light' ? 'black' : 'white'

  return {
    squares,
    currentPlayer,
    moveHistory: [],
  }
}

/**
 * Indique si un coup de l'IA entraîne une promotion.
 */
export function isPromotion(
  move: Move,
  movingPlayer: Player,
  size: 8 | 10 = 10
): boolean {
  const promoRowBlack = 0
  const promoRowWhite = size - 1
  return (
    (movingPlayer === 'black' && move.to.row === promoRowBlack) ||
    (movingPlayer === 'white' && move.to.row === promoRowWhite)
  )
}
