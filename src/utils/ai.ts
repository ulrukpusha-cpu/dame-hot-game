import type { Board, Move, Piece, Player, Position } from '@/types/game'

export class DameAI {
  private difficulty: 1 | 2 | 3 | 4 | 5
  private maxDepth: number
  private evaluationCache: Map<string, number>

  constructor(difficulty: 1 | 2 | 3 | 4 | 5) {
    this.difficulty = difficulty
    this.maxDepth = this.getMaxDepth(difficulty)
    this.evaluationCache = new Map()
  }

  private getMaxDepth(diff: number): number {
    const depthMap: Record<number, number> = {
      1: 1,
      2: 2,
      3: 4,
      4: 6,
      5: 8,
    }
    return depthMap[diff] ?? 2
  }

  public getBestMove(board: Board): Move | null {
    if (this.difficulty === 1) {
      return this.getRandomMove(board)
    }

    const allMoves = this.getAllPossibleMoves(board, board.currentPlayer)
    if (allMoves.length === 0) return null
    if (allMoves.length === 1) return allMoves[0]

    let bestMove = allMoves[0]
    let bestScore = -Infinity

    for (const move of allMoves) {
      const newBoard = this.applyMove(board, move)
      const score = this.minimax(newBoard, this.maxDepth - 1, -Infinity, Infinity, false)
      if (score > bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const boardKey = this.getBoardHash(board)
    if (this.evaluationCache.has(boardKey)) {
      return this.evaluationCache.get(boardKey)!
    }

    if (depth === 0 || this.isGameOver(board)) {
      const evaluation = this.evaluatePosition(board)
      this.evaluationCache.set(boardKey, evaluation)
      return evaluation
    }

    const currentPlayer: Player = isMaximizing ? 'black' : 'white'
    const moves = this.getAllPossibleMoves(board, currentPlayer)

    if (moves.length === 0) {
      return isMaximizing ? -10000 : 10000
    }

    if (isMaximizing) {
      let maxEval = -Infinity
      for (const move of moves) {
        const newBoard = this.applyMove(board, move)
        const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, false)
        maxEval = Math.max(maxEval, evaluation)
        alpha = Math.max(alpha, evaluation)
        if (beta <= alpha) break
      }
      return maxEval
    } else {
      let minEval = Infinity
      for (const move of moves) {
        const newBoard = this.applyMove(board, move)
        const evaluation = this.minimax(newBoard, depth - 1, alpha, beta, true)
        minEval = Math.min(minEval, evaluation)
        beta = Math.min(beta, evaluation)
        if (beta <= alpha) break
      }
      return minEval
    }
  }

  private getBoardSize(board: Board): number {
    return board.squares.length
  }

  private evaluatePosition(board: Board): number {
    const size = this.getBoardSize(board)
    const center = (size - 1) / 2
    let score = 0

    const PAWN_VALUE = 100
    const KING_VALUE = 300
    const CENTER_BONUS = 10
    const EDGE_PENALTY = -5
    const BACK_ROW_BONUS = 15
    const PROMOTION_ROW_BONUS = 50

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < (board.squares[row]?.length ?? 0); col++) {
        const piece = board.squares[row][col]
        if (!piece) continue

        let pieceScore = piece.type === 'pawn' ? PAWN_VALUE : KING_VALUE

        if (piece.type === 'pawn') {
          const distanceFromCenter = Math.abs(row - center) + Math.abs(col - center)
          if (distanceFromCenter < size / 2) {
            pieceScore += CENTER_BONUS
          }
          if (col === 0 || col === size - 1) {
            pieceScore += EDGE_PENALTY
          }
          if ((piece.player === 'white' && row === size - 1) || (piece.player === 'black' && row === 0)) {
            pieceScore += BACK_ROW_BONUS
          }
          if (piece.player === 'white' && row >= size - 2) {
            pieceScore += PROMOTION_ROW_BONUS * (row - (size - 3))
          } else if (piece.player === 'black' && row <= 1) {
            pieceScore += PROMOTION_ROW_BONUS * (2 - row)
          }
        }

        if (piece.type === 'king') {
          const mobility = this.getPieceMobility(board, { row, col })
          pieceScore += mobility * 5
        }

        score += piece.player === 'black' ? pieceScore : -pieceScore
      }
    }

    const blackCaptures = this.getCapturesCount(board, 'black')
    const whiteCaptures = this.getCapturesCount(board, 'white')
    score += (blackCaptures - whiteCaptures) * 50
    score += this.evaluateCenterControl(board)

    return score
  }

  private getPieceMobility(board: Board, pos: Position): number {
    const piece = board.squares[pos.row]?.[pos.col]
    if (!piece) return 0
    const moves = this.getPossibleMovesForPiece(board, pos, piece)
    return moves.length
  }

  private getCapturesCount(board: Board, player: Player): number {
    const moves = this.getAllPossibleMoves(board, player)
    return moves.filter((m) => m.captures && m.captures.length > 0).length
  }

  private evaluateCenterControl(board: Board): number {
    const size = board.squares.length
    const c = Math.floor(size / 2)
    const centerSquares: Position[] = [
      { row: c, col: c },
      { row: c, col: c + 1 },
      { row: c + 1, col: c },
      { row: c + 1, col: c + 1 },
    ].filter((p) => p.row < size && p.col < size)

    let score = 0
    for (const pos of centerSquares) {
      const piece = board.squares[pos.row]?.[pos.col]
      if (piece) score += piece.player === 'black' ? 20 : -20
    }
    return score
  }

  private getAllPossibleMoves(board: Board, player: Player): Move[] {
    const moves: Move[] = []
    const captures: Move[] = []
    const size = board.squares.length

    for (let row = 0; row < size; row++) {
      for (let col = 0; col < (board.squares[row]?.length ?? 0); col++) {
        const piece = board.squares[row][col]
        if (piece && piece.player === player) {
          const pieceMoves = this.getPossibleMovesForPiece(board, { row, col }, piece)
          for (const move of pieceMoves) {
            if (move.captures && move.captures.length > 0) {
              captures.push(move)
            } else {
              moves.push(move)
            }
          }
        }
      }
    }
    return captures.length > 0 ? captures : moves
  }

  private getPossibleMovesForPiece(board: Board, from: Position, piece: Piece): Move[] {
    if (piece.type === 'pawn') {
      return this.getPawnMoves(board, from, piece.player)
    }
    return this.getKingMoves(board, from, piece.player)
  }

  private getPawnMoves(board: Board, from: Position, player: Player): Move[] {
    const moves: Move[] = []
    const direction = player === 'white' ? 1 : -1
    const directions = [
      { row: direction, col: -1 },
      { row: direction, col: 1 },
    ]

    for (const dir of directions) {
      const to = { row: from.row + dir.row, col: from.col + dir.col }
      if (this.isValidPosition(board, to) && !board.squares[to.row]?.[to.col]) {
        moves.push({ from, to })
      }
    }

    const captures = this.findCaptures(board, from, player, [])
    moves.push(...captures)
    return moves
  }

  private getKingMoves(board: Board, from: Position, player: Player): Move[] {
    const moves: Move[] = []
    const directions = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ]

    for (const dir of directions) {
      let distance = 1
      while (true) {
        const to = {
          row: from.row + dir.row * distance,
          col: from.col + dir.col * distance,
        }
        if (!this.isValidPosition(board, to)) break
        const targetSquare = board.squares[to.row]?.[to.col]
        if (!targetSquare) {
          moves.push({ from, to })
          distance++
        } else break
      }
    }

    const captures = this.findKingCaptures(board, from, player, [])
    moves.push(...captures)
    return moves
  }

  private findCaptures(
    board: Board,
    from: Position,
    player: Player,
    capturedSoFar: Position[]
  ): Move[] {
    const captures: Move[] = []
    const directions = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ]

    for (const dir of directions) {
      const capturePos = { row: from.row + dir.row, col: from.col + dir.col }
      const landingPos = { row: from.row + dir.row * 2, col: from.col + dir.col * 2 }

      if (!this.isValidPosition(board, capturePos) || !this.isValidPosition(board, landingPos)) continue

      const capturedPiece = board.squares[capturePos.row]?.[capturePos.col]
      const landingSquare = board.squares[landingPos.row]?.[landingPos.col]

      if (
        capturedPiece &&
        capturedPiece.player !== player &&
        !landingSquare &&
        !this.isPositionInArray(capturePos, capturedSoFar)
      ) {
        const newCaptured = [...capturedSoFar, capturePos]
        const tempBoard = this.applyMove(board, { from, to: landingPos, captures: [capturePos] })
        const furtherCaptures = this.findCaptures(tempBoard, landingPos, player, newCaptured)

        if (furtherCaptures.length > 0) {
          captures.push(...furtherCaptures)
        } else {
          captures.push({ from, to: landingPos, captures: newCaptured })
        }
      }
    }
    return captures
  }

  private findKingCaptures(
    board: Board,
    from: Position,
    player: Player,
    capturedSoFar: Position[]
  ): Move[] {
    const captures: Move[] = []
    const directions = [
      { row: 1, col: 1 },
      { row: 1, col: -1 },
      { row: -1, col: 1 },
      { row: -1, col: -1 },
    ]

    for (const dir of directions) {
      let distance = 1
      let foundEnemy = false
      let capturePos: Position | null = null

      while (true) {
        const checkPos = {
          row: from.row + dir.row * distance,
          col: from.col + dir.col * distance,
        }
        if (!this.isValidPosition(board, checkPos)) break

        const piece = board.squares[checkPos.row]?.[checkPos.col]

        if (piece) {
          if (!foundEnemy && piece.player !== player) {
            if (!this.isPositionInArray(checkPos, capturedSoFar)) {
              foundEnemy = true
              capturePos = checkPos
            } else break
          } else break
        } else if (foundEnemy && capturePos) {
          const newCaptured = [...capturedSoFar, capturePos]
          const tempBoard = this.applyMove(board, { from, to: checkPos, captures: [capturePos] })
          const furtherCaptures = this.findKingCaptures(tempBoard, checkPos, player, newCaptured)
          if (furtherCaptures.length > 0) {
            captures.push(...furtherCaptures)
          } else {
            captures.push({ from, to: checkPos, captures: newCaptured })
          }
        }
        distance++
      }
    }
    return captures
  }

  private applyMove(board: Board, move: Move): Board {
    const size = this.getBoardSize(board)
    const newBoard: Board = {
      squares: board.squares.map((row) => [...row]),
      currentPlayer: board.currentPlayer === 'white' ? 'black' : 'white',
      moveHistory: [...board.moveHistory, move],
    }

    const piece = newBoard.squares[move.from.row]?.[move.from.col]
    if (!piece) return board

    newBoard.squares[move.to.row] = [...(newBoard.squares[move.to.row] ?? [])]
    newBoard.squares[move.to.row][move.to.col] = piece
    newBoard.squares[move.from.row][move.from.col] = null

    if (move.captures) {
      for (const cap of move.captures) {
        if (newBoard.squares[cap.row]) newBoard.squares[cap.row][cap.col] = null
      }
    }

    const promoRowWhite = size - 1
    const promoRowBlack = 0
    if (
      piece.type === 'pawn' &&
      ((piece.player === 'white' && move.to.row === promoRowWhite) ||
        (piece.player === 'black' && move.to.row === promoRowBlack))
    ) {
      newBoard.squares[move.to.row][move.to.col] = { ...piece, type: 'king' }
    }

    return newBoard
  }

  private getRandomMove(board: Board): Move | null {
    const moves = this.getAllPossibleMoves(board, board.currentPlayer)
    if (moves.length === 0) return null
    return moves[Math.floor(Math.random() * moves.length)]
  }

  private isValidPosition(board: Board, pos: Position): boolean {
    const size = this.getBoardSize(board)
    return pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size
  }

  private isPositionInArray(pos: Position, arr: Position[]): boolean {
    return arr.some((p) => p.row === pos.row && p.col === pos.col)
  }

  private getBoardHash(board: Board): string {
    return board.squares
      .map((row) =>
        row.map((piece) => (piece ? `${piece.player[0]}${piece.type[0]}` : '0')).join('')
      )
      .join('|')
  }

  private isGameOver(board: Board): boolean {
    const whiteMoves = this.getAllPossibleMoves(board, 'white')
    const blackMoves = this.getAllPossibleMoves(board, 'black')
    return whiteMoves.length === 0 || blackMoves.length === 0
  }

  public clearCache(): void {
    this.evaluationCache.clear()
  }
}
