export type PieceType = 'pawn' | 'king'
export type Player = 'white' | 'black'

export interface Piece {
  type: PieceType
  player: Player
}

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  captures?: Position[]
}

export interface Board {
  squares: (Piece | null)[][]
  currentPlayer: Player
  moveHistory: Move[]
}
