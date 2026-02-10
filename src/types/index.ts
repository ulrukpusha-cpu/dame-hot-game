export type ThemeId = 'bronze' | 'silver' | 'gold'

export type PlayerColor = 'light' | 'dark'

/** Couleur de pièce dans le store (plateau 2D) */
export type PiecePlayer = 'white' | 'black'

export type PieceType = 'pawn' | 'king'

/** Pièce sur une case (plateau 2D 10x10) */
export interface BoardPiece {
  type: PieceType
  player: PiecePlayer
}

export interface Position {
  row: number
  col: number
}

export interface PiecePosition {
  id: string
  position: Position
  color: PlayerColor
  type: PieceType
}

export interface Move {
  from: Position
  to: Position
  captures?: Position[]
  promoted?: boolean
}

export type GameMode = 'vs-ai' | 'vs-friend' | null

export type GameStatus = 'idle' | 'playing' | 'finished' | 'draw'

export type Screen =
  | 'splash'
  | 'menu'
  | 'game'
  | 'friend-list'
  | 'ai-select'
  | 'betting'
  | 'results'
  | 'leaderboard'
  | 'settings'
  | 'profile'

/** Joueur pour la liste d'amis / multijoueur */
export interface Player {
  id: string
  username: string
  photoUrl?: string
  rating?: number
}

/** Message de chat en partie multijoueur */
export interface ChatMessage {
  userId: string
  username: string
  message: string
}

/** Partie en cours (multijoueur) */
export interface CurrentGame {
  id: string
  players: Player[]
  yourColor: PlayerColor
  timer?: { white: number; black: number }
  chat: ChatMessage[]
}

export interface GameState {
  board: PiecePosition[]
  currentTurn: PlayerColor
  status: GameStatus
  winner: PlayerColor | null
  moveHistory: Move[]
  selectedPiece: Position | null
  validMoves: Position[]
  lastMove: Move | null
}

export interface BetInfo {
  amount: number
  currency: 'TON' | 'STARS'
  confirmed: boolean
}

export interface BetRecord {
  id: string
  gameId: string
  amount: number
  currency: 'TON' | 'STARS'
  status: 'pending' | 'won' | 'lost' | 'withdrawn'
  txHash?: string
  timestamp: number
}

export interface UserProfile {
  id: string
  username?: string
  firstName?: string
  lastName?: string
  photoUrl?: string
  balanceTon: number
  balanceStars: number
  xp: number
  level: number
  walletConnected?: boolean
  walletAddress?: string | null
}

export type AIDifficulty = 1 | 2 | 3 | 4 | 5
