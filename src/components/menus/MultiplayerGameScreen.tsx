import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Board } from '@/components/game/Board'
import { useMultiplayer } from '@/hooks/useMultiplayer'
import { useGameStore } from '@/stores/gameStore'
import { useUserStore } from '@/stores/userStore'
import { useTheme } from '@/hooks/useTheme'
import type { Move, ChatMessage as ChatMessageType } from '@/types'

interface MultiplayerGameScreenProps {
  onBack: () => void
}

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function MultiplayerGameScreen({ onBack }: MultiplayerGameScreenProps) {
  const { colors } = useTheme()
  const {
    currentGame,
    makeMove,
    sendChatMessage,
    offerDraw,
    resign,
  } = useMultiplayer()
  const currentTurn = useGameStore((s) => s.currentTurn)
  const myId = useUserStore((s) => s.id)

  const [showChat, setShowChat] = useState(false)
  const [chatMessage, setChatMessage] = useState('')
  const [showMenu, setShowMenu] = useState(false)

  const isMyTurn =
    currentGame?.yourColor ===
    (currentTurn === 'white' ? 'light' : 'dark')
  const opponent = currentGame?.players.find((p) => p.id !== myId)

  const handleMove = (move: Move) => {
    makeMove(move)
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage)
      setChatMessage('')
    }
  }

  if (!currentGame) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6"
        style={{ background: colors.background }}
      >
        <div className="text-center">
          <div
            className="animate-spin w-16 h-16 border-4 border-t-transparent rounded-full mx-auto mb-4"
            style={{ borderColor: colors.primary }}
          />
          <p className="mb-6" style={{ color: colors.text }}>
            Chargement de la partie...
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              border: `2px solid ${colors.border}`,
            }}
          >
            Retour au menu
          </button>
        </div>
      </div>
    )
  }

  const myTimerValue =
    currentGame.timer &&
    (currentGame.yourColor === 'light'
      ? currentGame.timer.white
      : currentGame.timer.black)
  const opponentTimerValue =
    currentGame.timer &&
    (currentGame.yourColor === 'light'
      ? currentGame.timer.black
      : currentGame.timer.white)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: colors.background }}
    >
      {/* Header avec infos joueurs */}
      <motion.div
        className="p-4"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img
              src={opponent?.photoUrl || '/images/default-avatar.png'}
              alt={opponent?.username || 'Adversaire'}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold" style={{ color: colors.text }}>
                {opponent?.username || 'Adversaire'}
              </p>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                ⭐ {opponent?.rating ?? 1200}
              </p>
            </div>
          </div>

          {currentGame.timer && opponentTimerValue !== undefined && (
            <div
              className="px-4 py-2 rounded-lg font-mono text-lg"
              style={{
                backgroundColor:
                  currentTurn !== currentGame.yourColor
                    ? colors.error
                    : colors.surface,
                color: colors.text,
              }}
            >
              {formatTime(opponentTimerValue)}
            </div>
          )}
        </div>

        <motion.div
          className="text-center py-2 px-4 rounded-lg font-semibold"
          style={{
            backgroundColor: isMyTurn ? colors.success + '20' : colors.surface,
            color: isMyTurn ? colors.success : colors.textSecondary,
          }}
          animate={isMyTurn ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          {isMyTurn ? "🎯 Votre tour" : "⏳ Tour de l'adversaire"}
        </motion.div>
      </motion.div>

      {/* Plateau de jeu */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Board
          onMove={handleMove}
          disabled={!isMyTurn}
          showCoordinates
        />
      </div>

      {/* Footer avec contrôles */}
      <motion.div
        className="p-4 space-y-3"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        {currentGame.timer && myTimerValue !== undefined && (
          <div
            className="text-center px-4 py-3 rounded-lg font-mono text-2xl font-bold"
            style={{
              backgroundColor:
                currentTurn === currentGame.yourColor
                  ? colors.error
                  : colors.surface,
              color: colors.text,
            }}
          >
            {formatTime(myTimerValue)}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowChat(true)}
            className="flex-1 py-3 rounded-xl font-semibold relative"
            style={{ backgroundColor: colors.surface, color: colors.text }}
          >
            💬 Chat
            {currentGame.chat.length > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{ backgroundColor: colors.error, color: 'white' }}
              >
                {currentGame.chat.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowMenu(true)}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{ backgroundColor: colors.surface, color: colors.text }}
          >
            ⚙️
          </button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showChat && (
          <ChatModal
            messages={currentGame.chat}
            onClose={() => setShowChat(false)}
            onSend={handleSendMessage}
            message={chatMessage}
            setMessage={setChatMessage}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMenu && (
          <GameMenu
            onClose={() => setShowMenu(false)}
            onOfferDraw={offerDraw}
            onResign={resign}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface ChatModalProps {
  messages: ChatMessageType[]
  onClose: () => void
  onSend: () => void
  message: string
  setMessage: (s: string) => void
}

function ChatModal({
  messages,
  onClose,
  onSend,
  message,
  setMessage,
}: ChatModalProps) {
  const { colors } = useTheme()

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black opacity-70"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Fermer"
      />
      <motion.div
        className="relative w-full rounded-t-3xl p-6 max-h-[70vh] flex flex-col"
        style={{ backgroundColor: colors.background }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold" style={{ color: colors.text }}>
            Chat
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl"
            style={{ color: colors.text }}
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className="flex gap-2">
              <div
                className="max-w-[80%] px-4 py-2 rounded-2xl"
                style={{
                  backgroundColor:
                    msg.userId === 'me' ? colors.primary : colors.surface,
                  color: colors.text,
                }}
              >
                <p className="text-sm font-semibold mb-1">{msg.username}</p>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            placeholder="Votre message..."
            className="flex-1 px-4 py-3 rounded-xl border-0"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          />
          <button
            type="button"
            onClick={onSend}
            className="px-6 py-3 rounded-xl font-semibold"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            ➤
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface GameMenuProps {
  onClose: () => void
  onOfferDraw: () => void
  onResign: () => void
}

function GameMenu({ onClose, onOfferDraw, onResign }: GameMenuProps) {
  const { colors } = useTheme()

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 bg-black opacity-70"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Fermer"
      />
      <motion.div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ backgroundColor: colors.background }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
      >
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.text }}>
          Menu
        </h3>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              onOfferDraw()
              onClose()
            }}
            className="w-full py-4 rounded-xl font-semibold"
            style={{ backgroundColor: colors.info, color: 'white' }}
          >
            🤝 Proposer match nul
          </button>

          <button
            type="button"
            onClick={() => {
              onResign()
              onClose()
            }}
            className="w-full py-4 rounded-xl font-semibold"
            style={{ backgroundColor: colors.error, color: 'white' }}
          >
            🏳️ Abandonner
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-4 rounded-xl font-semibold"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
            }}
          >
            Annuler
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
