import express from 'express'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import { createClient } from 'redis'

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
    credentials: true,
  },
})

const redisUrl = process.env.REDIS_URL
const redisClient = redisUrl ? createClient({ url: redisUrl }) : null

interface AuthUser {
  id: string
  telegramId: number
  username: string
  photoUrl?: string
  rating?: number
}

interface Player {
  id: string
  telegramId: number
  username: string
  photoUrl?: string
  socketId: string
  rating: number
}

interface ChatMessage {
  userId: string
  username: string
  message: string
  timestamp: number
}

interface GameRoom {
  id: string
  players: [Player, Player]
  board: (null | { type: string; player: string })[][]
  currentTurn: 'white' | 'black'
  status: 'waiting' | 'active' | 'finished'
  betAmount?: number
  betCurrency?: 'TON' | 'STARS'
  startTime: number
  lastMoveTime: number
  moveHistory: { move: unknown; player: string; timestamp: number }[]
  chat: ChatMessage[]
  timer: { white: number; black: number }
}

const connectedPlayers = new Map<string, Player>()
const gameRooms = new Map<string, GameRoom>()
const playerToRoom = new Map<string, string>()

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) {
      return next(new Error('Authentication error'))
    }
    const userData = verifyTelegramWebAppData(token)
    ;(socket as Socket & { data: { user: AuthUser } }).data.user = userData
    next()
  } catch {
    next(new Error('Authentication error'))
  }
})

io.on('connection', (socket: Socket) => {
  const user = (socket as Socket & { data: { user: AuthUser } }).data.user
  if (!user) return

  const player: Player = {
    id: user.id,
    telegramId: user.telegramId,
    username: user.username,
    photoUrl: user.photoUrl,
    socketId: socket.id,
    rating: user.rating ?? 1200,
  }
  connectedPlayers.set(user.id, player)

  socket.emit('friends:online', getOnlineFriends(user.id))
  notifyFriendsOnlineStatus(user.id, true)

  socket.on('game:invite', (data: { friendId: string; betAmount?: number; betCurrency?: 'TON' | 'STARS' }) => {
    const friend = connectedPlayers.get(data.friendId)
    if (!friend) {
      socket.emit('error', { message: 'Ami non connecté' })
      return
    }
    const invitation = {
      id: generateId(),
      from: player,
      to: friend,
      betAmount: data.betAmount,
      betCurrency: data.betCurrency,
      timestamp: Date.now(),
    }
    io.to(friend.socketId).emit('game:invitation', invitation)
    io.to(friend.socketId).emit('haptic:notification')
    socket.emit('game:invitation-sent', { invitationId: invitation.id })
  })

  socket.on('game:accept', async (data: { invitationId: string; fromUserId: string }) => {
    const opponent = connectedPlayers.get(data.fromUserId)
    if (!opponent) {
      socket.emit('error', { message: 'Adversaire non disponible' })
      return
    }
    const gameRoom = await createGameRoom(player, opponent, data)
    socket.join(gameRoom.id)
    io.sockets.sockets.get(opponent.socketId)?.join(gameRoom.id)
    playerToRoom.set(player.id, gameRoom.id)
    playerToRoom.set(opponent.id, gameRoom.id)

    io.to(gameRoom.id).emit('game:started', {
      gameId: gameRoom.id,
      players: gameRoom.players,
      board: gameRoom.board,
      betAmount: gameRoom.betAmount,
      betCurrency: gameRoom.betCurrency,
      timer: gameRoom.timer,
    })

    if (gameRoom.timer) {
      startGameTimer(gameRoom.id)
    }
  })

  socket.on('game:decline', (data: { invitationId: string; fromUserId: string }) => {
    const opponent = connectedPlayers.get(data.fromUserId)
    if (opponent) {
      io.to(opponent.socketId).emit('game:invitation-declined', { by: player.username })
    }
  })

  socket.on('game:move', async (data: { gameId: string; move: { from: { row: number; col: number }; to: { row: number; col: number }; captures?: { row: number; col: number }[] } }) => {
    const gameRoom = gameRooms.get(data.gameId)
    if (!gameRoom) {
      socket.emit('error', { message: 'Partie introuvable' })
      return
    }
    const playerColor = gameRoom.players[0].id === user.id ? 'white' : 'black'
    if (gameRoom.currentTurn !== playerColor) {
      socket.emit('error', { message: "Ce n'est pas votre tour" })
      return
    }
    const isValidMove = validateMove(gameRoom.board, data.move, playerColor)
    if (!isValidMove) {
      socket.emit('error', { message: 'Coup invalide' })
      return
    }

    gameRoom.board = applyMove(gameRoom.board, data.move)
    gameRoom.moveHistory.push({ move: data.move, player: playerColor, timestamp: Date.now() })
    gameRoom.currentTurn = playerColor === 'white' ? 'black' : 'white'
    gameRoom.lastMoveTime = Date.now()

    const gameResult = checkGameEnd(gameRoom.board)
    if (gameResult) {
      await endGame(gameRoom, gameResult)
    } else {
      io.to(data.gameId).emit('game:move-made', {
        move: data.move,
        board: gameRoom.board,
        currentTurn: gameRoom.currentTurn,
        moveHistory: gameRoom.moveHistory,
      })
      io.to(data.gameId).emit('sound:play', { sound: 'move' })
    }
    await saveGameState(gameRoom)
  })

  socket.on('game:offer-draw', (data: { gameId: string }) => {
    const gameRoom = gameRooms.get(data.gameId)
    if (!gameRoom) return
    const opponentId = gameRoom.players.find((p) => p.id !== user.id)?.id
    const opponent = opponentId ? connectedPlayers.get(opponentId) : null
    if (opponent) {
      io.to(opponent.socketId).emit('game:draw-offered', { by: player.username })
    }
  })

  socket.on('game:accept-draw', async (data: { gameId: string }) => {
    const gameRoom = gameRooms.get(data.gameId)
    if (!gameRoom) return
    await endGame(gameRoom, { result: 'draw' })
  })

  socket.on('game:resign', async (data: { gameId: string }) => {
    const gameRoom = gameRooms.get(data.gameId)
    if (!gameRoom) return
    const playerColor = gameRoom.players[0].id === user.id ? 'white' : 'black'
    const winner = playerColor === 'white' ? 'black' : 'white'
    await endGame(gameRoom, { result: 'resignation', winner })
  })

  socket.on('chat:message', (data: { gameId: string; message: string }) => {
    const gameRoom = gameRooms.get(data.gameId)
    if (!gameRoom) return
    const chatMessage: ChatMessage = {
      userId: user.id,
      username: player.username,
      message: data.message,
      timestamp: Date.now(),
    }
    gameRoom.chat.push(chatMessage)
    io.to(data.gameId).emit('chat:new-message', chatMessage)
    io.to(data.gameId).emit('haptic:impact', { style: 'light' })
  })

  socket.on('chat:emoji', (data: { gameId: string; emoji: string }) => {
    io.to(data.gameId).emit('chat:emoji', {
      userId: user.id,
      username: player.username,
      emoji: data.emoji,
      timestamp: Date.now(),
    })
  })

  socket.on('disconnect', () => {
    connectedPlayers.delete(user.id)
    notifyFriendsOnlineStatus(user.id, false)
    const gameId = playerToRoom.get(user.id)
    if (gameId) {
      handlePlayerDisconnect(gameId, user.id)
    }
  })
})

async function createGameRoom(
  player1: Player,
  player2: Player,
  _options: { invitationId: string; fromUserId: string; betAmount?: number; betCurrency?: 'TON' | 'STARS' }
): Promise<GameRoom> {
  const gameId = generateId()
  const players: [Player, Player] = Math.random() > 0.5 ? [player1, player2] : [player2, player1]

  const gameRoom: GameRoom = {
    id: gameId,
    players,
    board: initializeBoard(),
    currentTurn: 'white',
    status: 'active',
    betAmount: _options.betAmount,
    betCurrency: _options.betCurrency,
    startTime: Date.now(),
    lastMoveTime: Date.now(),
    moveHistory: [],
    chat: [],
    timer: { white: 600_000, black: 600_000 },
  }
  gameRooms.set(gameId, gameRoom)
  await saveGameState(gameRoom)
  return gameRoom
}

function initializeBoard(): (null | { type: string; player: string })[][] {
  const board = Array(10)
    .fill(null)
    .map(() => Array(10).fill(null) as (null | { type: string; player: string })[])

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'pawn', player: 'white' }
      }
    }
  }
  for (let row = 6; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { type: 'pawn', player: 'black' }
      }
    }
  }
  return board
}

function validateMove(
  board: (null | { type: string; player: string })[][],
  _move: { from: { row: number; col: number }; to: { row: number; col: number }; captures?: { row: number; col: number }[] },
  _player: string
): boolean {
  return true
}

function applyMove(
  board: (null | { type: string; player: string })[][],
  move: { from: { row: number; col: number }; to: { row: number; col: number }; captures?: { row: number; col: number }[] }
): (null | { type: string; player: string })[][] {
  const newBoard = board.map((row) => [...row])
  const piece = newBoard[move.from.row][move.from.col]
  if (!piece) return board
  newBoard[move.to.row][move.to.col] = { ...piece }
  newBoard[move.from.row][move.from.col] = null
  if (move.captures) {
    for (const cap of move.captures) {
      newBoard[cap.row][cap.col] = null
    }
  }
  if (piece.type === 'pawn') {
    if ((piece.player === 'white' && move.to.row === 9) || (piece.player === 'black' && move.to.row === 0)) {
      const p = newBoard[move.to.row][move.to.col]
      if (p) p.type = 'king'
    }
  }
  return newBoard
}

function checkGameEnd(
  board: (null | { type: string; player: string })[][]
): { result: string; winner?: string } | null {
  let whitePieces = 0
  let blackPieces = 0
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < (board[row]?.length ?? 0); col++) {
      const piece = board[row][col]
      if (piece?.player === 'white') whitePieces++
      else if (piece?.player === 'black') blackPieces++
    }
  }
  if (whitePieces === 0) return { result: 'checkmate', winner: 'black' }
  if (blackPieces === 0) return { result: 'checkmate', winner: 'white' }
  return null
}

async function endGame(
  gameRoom: GameRoom,
  result: { result: string; winner?: string }
): Promise<void> {
  gameRoom.status = 'finished'

  let winnings: { playerId: string; amount: number; currency?: string } | null = null
  if (gameRoom.betAmount && result.winner) {
    const winnerId = result.winner === 'white' ? gameRoom.players[0].id : gameRoom.players[1].id
    winnings = {
      playerId: winnerId,
      amount: gameRoom.betAmount * 1.9,
      currency: gameRoom.betCurrency,
    }
    await processWinnings(winnings)
  }

  await updateRatings(gameRoom, result)
  await saveGameToDatabase(gameRoom, result)

  io.to(gameRoom.id).emit('game:ended', {
    result: result.result,
    winner: result.winner,
    winnings,
    finalBoard: gameRoom.board,
    moveHistory: gameRoom.moveHistory,
  })
  io.to(gameRoom.id).emit('sound:play', { sound: 'game-end' })
  io.to(gameRoom.id).emit('haptic:notification')

  gameRooms.delete(gameRoom.id)
  playerToRoom.delete(gameRoom.players[0].id)
  playerToRoom.delete(gameRoom.players[1].id)
}

async function processWinnings(winnings: { playerId: string; amount: number; currency?: string }): Promise<void> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) return
  await fetch(`${apiUrl}/api/payments/payout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(winnings),
  })
}

async function updateRatings(gameRoom: GameRoom, result: { result: string; winner?: string }): Promise<void> {
  const K = 32
  const player1Rating = gameRoom.players[0].rating
  const player2Rating = gameRoom.players[1].rating
  const expectedPlayer1 = 1 / (1 + Math.pow(10, (player2Rating - player1Rating) / 400))
  const expectedPlayer2 = 1 - expectedPlayer1
  let actualPlayer1: number
  let actualPlayer2: number
  if (result.result === 'draw') {
    actualPlayer1 = 0.5
    actualPlayer2 = 0.5
  } else if (result.winner === 'white') {
    actualPlayer1 = 1
    actualPlayer2 = 0
  } else {
    actualPlayer1 = 0
    actualPlayer2 = 1
  }
  const newRatingPlayer1 = Math.round(player1Rating + K * (actualPlayer1 - expectedPlayer1))
  const newRatingPlayer2 = Math.round(player2Rating + K * (actualPlayer2 - expectedPlayer2))
  await updateUserRating(gameRoom.players[0].id, newRatingPlayer1)
  await updateUserRating(gameRoom.players[1].id, newRatingPlayer2)
}

function handlePlayerDisconnect(gameId: string, userId: string): void {
  const gameRoom = gameRooms.get(gameId)
  if (!gameRoom) return
  io.to(gameId).emit('player:disconnected', { playerId: userId, reconnectTime: 60 })
  setTimeout(async () => {
    const stillDisconnected = !connectedPlayers.has(userId)
    const room = gameRooms.get(gameId)
    if (stillDisconnected && room) {
      const winner = room.players[0].id === userId ? 'black' : 'white'
      await endGame(room, { result: 'disconnect', winner })
    }
  }, 60_000)
}

function startGameTimer(gameId: string): void {
  const interval = setInterval(async () => {
    const gameRoom = gameRooms.get(gameId)
    if (!gameRoom || gameRoom.status !== 'active') {
      clearInterval(interval)
      return
    }
    const elapsed = Date.now() - gameRoom.lastMoveTime
    if (gameRoom.currentTurn === 'white') {
      gameRoom.timer.white -= elapsed
      if (gameRoom.timer.white <= 0) {
        await endGame(gameRoom, { result: 'timeout', winner: 'black' })
        clearInterval(interval)
        return
      }
    } else {
      gameRoom.timer.black -= elapsed
      if (gameRoom.timer.black <= 0) {
        await endGame(gameRoom, { result: 'timeout', winner: 'white' })
        clearInterval(interval)
        return
      }
    }
    gameRoom.lastMoveTime = Date.now()
    io.to(gameId).emit('game:timer-update', {
      white: gameRoom.timer.white,
      black: gameRoom.timer.black,
    })
  }, 1000)
}

function getOnlineFriends(userId: string): Player[] {
  return Array.from(connectedPlayers.values()).filter((p) => p.id !== userId)
}

function notifyFriendsOnlineStatus(userId: string, isOnline: boolean): void {
  const player = connectedPlayers.get(userId)
  if (!player) return
  io.emit('friend:status-changed', { userId, username: player.username, isOnline })
}

async function saveGameState(gameRoom: GameRoom): Promise<void> {
  if (redisClient) {
    await redisClient.set(`game:${gameRoom.id}`, JSON.stringify(gameRoom), { EX: 86400 })
  }
}

async function saveGameToDatabase(gameRoom: GameRoom, result: { result: string; winner?: string }): Promise<void> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) return
  await fetch(`${apiUrl}/api/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: gameRoom.id,
      players: gameRoom.players.map((p) => p.id),
      result,
      moveHistory: gameRoom.moveHistory,
      betAmount: gameRoom.betAmount,
      betCurrency: gameRoom.betCurrency,
      startTime: gameRoom.startTime,
      endTime: Date.now(),
    }),
  })
}

async function updateUserRating(userId: string, newRating: number): Promise<void> {
  const apiUrl = process.env.API_URL
  if (!apiUrl) return
  await fetch(`${apiUrl}/api/users/${userId}/rating`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rating: newRating }),
  })
}

function verifyTelegramWebAppData(initData: string): AuthUser {
  const decoded = new URLSearchParams(initData)
  const userJson = decoded.get('user') ?? '{}'
  let user: { id?: number; username?: string; first_name?: string; photo_url?: string }
  try {
    user = JSON.parse(userJson) as { id?: number; username?: string; first_name?: string; photo_url?: string }
  } catch {
    user = {}
  }
  return {
    id: `tg_${user.id ?? 0}`,
    telegramId: user.id ?? 0,
    username: user.username ?? user.first_name ?? 'Player',
    photoUrl: user.photo_url,
    rating: 1200,
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

async function run(): Promise<void> {
  if (redisClient) {
    await redisClient.connect()
    console.log('Redis connecté')
  } else {
    console.warn('REDIS_URL non défini : persistance des parties désactivée (mémoire uniquement)')
  }
  const PORT = Number(process.env.PORT) || 3001
  httpServer.listen(PORT, () => {
    console.log(`Serveur WebSocket démarré sur le port ${PORT}`)
  })
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
