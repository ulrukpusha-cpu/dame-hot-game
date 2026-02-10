import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMultiplayer } from '@/hooks/useMultiplayer'
import { useTheme } from '@/hooks/useTheme'
import { BettingPanel } from '@/components/betting/BettingPanel'
import type { Player } from '@/types'

interface FriendsScreenProps {
  onBack: () => void
}

function vibrate(style: 'light' | 'medium' | 'heavy') {
  if (window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
  }
}

export function FriendsScreen({ onBack }: FriendsScreenProps) {
  const { colors } = useTheme()
  const { onlineFriends, invitePlayer } = useMultiplayer()
  const [selectedFriend, setSelectedFriend] = useState<Player | null>(null)
  const [showBettingPanel, setShowBettingPanel] = useState(false)

  const handleFriendSelect = (friend: Player) => {
    setSelectedFriend(friend)
    setShowBettingPanel(true)
    vibrate('light')
  }

  const handleInvite = (betAmount?: number, betCurrency?: 'TON' | 'STARS') => {
    if (!selectedFriend) return
    invitePlayer(selectedFriend.id, betAmount, betCurrency)
    setShowBettingPanel(false)
    setSelectedFriend(null)
  }

  return (
    <div
      className="min-h-screen p-6 flex flex-col"
      style={{ background: colors.background }}
    >
      {/* Header avec bouton retour */}
      <motion.div
        className="mb-8 flex items-center gap-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <button
          type="button"
          onClick={onBack}
          className="p-2 rounded-full"
          style={{ backgroundColor: colors.surface }}
          aria-label="Retour"
        >
          <svg
            className="w-6 h-6"
            style={{ color: colors.text }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Inviter un ami
          </h1>
          <p style={{ color: colors.textSecondary }}>
            {onlineFriends.length} amis en ligne
          </p>
        </div>
      </motion.div>

      {/* Liste d'amis */}
      <div className="space-y-3 mb-20 flex-1">
        {onlineFriends.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">😔</div>
            <p
              className="text-xl"
              style={{ color: colors.textSecondary }}
            >
              Aucun ami en ligne
            </p>
            <p
              className="text-sm mt-2"
              style={{ color: colors.textSecondary }}
            >
              Invitez vos amis à jouer !
            </p>
          </motion.div>
        ) : (
          onlineFriends.map((friend, index) => (
            <motion.div
              key={friend.id}
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <motion.button
                type="button"
                onClick={() => handleFriendSelect(friend)}
                className="w-full p-4 rounded-xl flex items-center justify-between"
                style={{
                  backgroundColor: colors.surface,
                  border: `2px solid ${colors.border}`,
                }}
                whileHover={{ scale: 1.02, x: 10 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={friend.photoUrl || '/vite.svg'}
                      alt={friend.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: colors.success }}
                    />
                  </div>
                  <div className="text-left">
                    <p
                      className="font-semibold"
                      style={{ color: colors.text }}
                    >
                      {friend.username}
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: colors.textSecondary }}
                    >
                      ⭐ {friend.rating ?? 1200}
                    </p>
                  </div>
                </div>
                <div
                  className="px-4 py-2 rounded-lg font-semibold"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  Inviter
                </div>
              </motion.button>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal de pari */}
      <AnimatePresence>
        {showBettingPanel && selectedFriend && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBettingPanel(false)}
              onKeyDown={(e) => e.key === 'Escape' && setShowBettingPanel(false)}
              role="button"
              tabIndex={0}
              aria-label="Fermer"
            />
            <motion.div
              className="relative w-full max-w-lg"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <div className="bg-gray-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Inviter {selectedFriend.username}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowBettingPanel(false)}
                    className="p-2 rounded-full bg-gray-800 text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4 mb-6">
                  <button
                    type="button"
                    onClick={() => handleInvite()}
                    className="w-full py-4 px-6 rounded-xl font-semibold text-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                  >
                    Jouer sans pari
                  </button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-400">
                        ou
                      </span>
                    </div>
                  </div>
                </div>

                <BettingPanel
                  gameId="temp"
                  opponent={selectedFriend.username}
                  onBetPlaced={(amount, currency) =>
                    handleInvite(amount, currency)
                  }
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
