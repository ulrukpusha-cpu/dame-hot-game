import React, { useState, useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useTheme } from '@/hooks/useTheme'
import { useUserStore } from '@/stores/userStore'
import { motion, AnimatePresence } from 'framer-motion'
import { MenuBoardBackground } from '@/components/menus/MenuBoardBackground'
import type { ThemeType } from '@/styles/themes/themeConfig'

interface MainMenuProps {
  onPlayVsAI: () => void
  onPlayVsFriend: () => void
  onLeaderboard: () => void
  onSettings?: () => void
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onPlayVsAI,
  onPlayVsFriend,
  onLeaderboard,
  onSettings,
}) => {
  const { theme, colors } = useTheme()
  const user = useUserStore(
    useShallow((s) => ({
      username: s.username,
      photoUrl: s.photoUrl,
      balanceTon: s.balanceTon,
      balanceStars: s.balanceStars,
    }))
  )
  const [showPlayOptions, setShowPlayOptions] = useState(false)
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([])

  useEffect(() => {
    if (theme === 'gold') {
      const interval = setInterval(() => {
        setParticles((prev) => {
          const next = [...prev]
          if (next.length < 20) {
            next.push({
              id: Date.now() + Math.random(),
              x: Math.random() * 100,
              y: -10,
            })
          }
          return next.filter((p) => p.y < 110)
        })
      }, 300)
      return () => clearInterval(interval)
    }
  }, [theme])

  const handlePlayClick = () => {
    setShowPlayOptions(!showPlayOptions)
    vibrate('medium')
  }

  const handleModeSelect = (mode: 'online' | 'ai') => {
    vibrate('light')
    if (mode === 'online') {
      onPlayVsFriend()
    } else {
      onPlayVsAI()
    }
  }

  return (
    <div
      className={`main-menu theme-${theme} min-h-screen relative overflow-hidden flex flex-col`}
      style={{ background: colors.background }}
    >
      <MenuBoardBackground />

      {/* Particules flottantes (thème gold) */}
      {theme === 'gold' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-60"
              initial={{ x: `${particle.x}%`, y: '-10%' }}
              animate={{ y: '110%' }}
              transition={{ duration: 4, ease: 'linear' }}
              style={{
                boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
      )}

      {/* En-tête avec profil utilisateur */}
      <motion.header
        className="p-6 flex justify-between items-center relative z-10"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={user?.photoUrl || '/vite.svg'}
              alt={user?.username || 'Joueur'}
              className="w-14 h-14 rounded-full border-4 object-cover"
              style={{ borderColor: colors.primary }}
            />
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white"
              style={{ backgroundColor: colors.success }}
            />
          </motion.div>

          <div>
            <h3 className="font-bold text-lg" style={{ color: colors.text }}>
              {user?.username || 'Joueur'}
            </h3>
            <div
              className="flex items-center gap-2 text-sm"
              style={{ color: colors.textSecondary }}
            >
              <span>⭐ {1200}</span>
              <span>•</span>
              <span>🏆 0V</span>
            </div>
          </div>
        </div>

        {onSettings && (
          <motion.button
            type="button"
            onClick={onSettings}
            className="p-3 rounded-full"
            style={{ backgroundColor: colors.surface }}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
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
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </motion.button>
        )}
      </motion.header>

      {/* Logo principal avec animation */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            duration: 1,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 100,
          }}
        >
          <motion.div
            className="relative inline-block"
            animate={{
              textShadow:
                theme === 'gold'
                  ? [
                      '0 0 20px rgba(255,215,0,0.5)',
                      '0 0 40px rgba(255,215,0,0.8)',
                      '0 0 20px rgba(255,215,0,0.5)',
                    ]
                  : 'none',
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <h1
              className="font-script text-7xl mb-2"
              style={{
                color: colors.primary,
                fontFamily: "'Pacifico', cursive",
              }}
            >
              Dame
            </h1>
            <p
              className="text-2xl font-bold tracking-wider"
              style={{ color: colors.accent }}
            >
              Hot Game
            </p>
          </motion.div>

          <motion.div
            className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: colors.surface,
              border: `2px solid ${colors.primary}`,
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: colors.accent }}
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z"
              />
            </svg>
            <span
              className="text-sm font-semibold"
              style={{ color: colors.text }}
            >
              Telegram Mini App
            </span>
          </motion.div>
        </motion.div>

        {/* Boutons principaux */}
        <div className="w-full max-w-md space-y-4">
          <motion.button
            type="button"
            onClick={handlePlayClick}
            className="w-full py-5 px-8 rounded-2xl font-bold text-xl shadow-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
              color: colors.background,
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <span className="relative z-10 flex items-center justify-center gap-3">
              <span>🎮</span>
              Jouer
            </span>
          </motion.button>

          <AnimatePresence>
            {showPlayOptions && (
              <motion.div
                className="space-y-3 overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  type="button"
                  onClick={() => handleModeSelect('online')}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-between"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `2px solid ${colors.primary}`,
                  }}
                  whileHover={{ scale: 1.03, x: 10 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">👥</span>
                    Jouer avec des amis
                  </span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  type="button"
                  onClick={() => handleModeSelect('ai')}
                  className="w-full py-4 px-6 rounded-xl font-semibold text-lg flex items-center justify-between"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    border: `2px solid ${colors.secondary}`,
                  }}
                  whileHover={{ scale: 1.03, x: 10 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-2xl">🤖</span>
                    Jouer contre l&apos;IA
                  </span>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            type="button"
            onClick={onLeaderboard}
            className="w-full py-4 px-6 rounded-xl font-semibold text-lg"
            style={{
              backgroundColor: colors.surface,
              color: colors.text,
              border: `2px solid ${colors.border}`,
            }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="flex items-center justify-center gap-3">
              <span className="text-xl">🏆</span>
              Classement
            </span>
          </motion.button>

          <motion.div
            className="flex gap-3 justify-center"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ThemeButton themeType="bronze" currentTheme={theme} />
            <ThemeButton themeType="silver" currentTheme={theme} />
            <ThemeButton themeType="gold" currentTheme={theme} />
          </motion.div>
        </div>

        <motion.div
          className="mt-8 w-full max-w-md"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div
            className="p-4 rounded-xl flex items-center justify-between flex-wrap gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <div>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                Solde disponible
              </p>
              <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                {user?.balanceTon ?? 0} TON
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl font-semibold"
              style={{
                backgroundColor: colors.primary,
                color: colors.background,
              }}
            >
              Connect TON
            </button>
          </div>
        </motion.div>
      </div>

      <motion.footer
        className="p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          Dame Hot Game • Version 1.0.0
        </p>
      </motion.footer>
    </div>
  )
}

interface ThemeButtonProps {
  themeType: ThemeType
  currentTheme: ThemeType
}

const ThemeButton: React.FC<ThemeButtonProps> = ({
  themeType,
  currentTheme,
}) => {
  const { setTheme } = useTheme()
  const colors: Record<ThemeType, string> = {
    bronze: '#CD7F32',
    silver: '#B0BEC5',
    gold: '#FFD700',
  }

  const icons: Record<ThemeType, string> = {
    bronze: '🟤',
    silver: '⚪',
    gold: '🟡',
  }

  return (
    <motion.button
      type="button"
      onClick={() => setTheme(themeType)}
      className={`
        w-16 h-16 rounded-full flex items-center justify-center text-2xl
        transition-all duration-300
        ${currentTheme === themeType ? 'ring-4 ring-offset-2 ring-offset-gray-900' : 'opacity-50'}
      `}
      style={{
        backgroundColor: colors[themeType],
        ['--tw-ring-color' as string]: currentTheme === themeType ? colors[themeType] : 'transparent',
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      {icons[themeType]}
    </motion.button>
  )
}

function vibrate(style: 'light' | 'medium' | 'heavy') {
  if (window.Telegram?.WebApp?.HapticFeedback?.impactOccurred) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style)
  }
}
