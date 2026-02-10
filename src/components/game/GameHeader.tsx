import React from 'react'
import { useGameStore } from '@/stores/gameStore'
import { useTheme } from '@/hooks/useTheme'

export const GameHeader: React.FC<{
  player1: { name: string; color: 'white' | 'black' }
  player2: { name: string; color: 'white' | 'black' }
}> = ({ player1, player2 }) => {
  const { colors } = useTheme()
  const capturedPieces = useGameStore((s) => s.capturedPieces)

  const getScore = (color: 'white' | 'black') => {
    const captured = capturedPieces[color === 'white' ? 'black' : 'white']
    return captured.reduce((score, piece) => {
      return score + (piece.type === 'king' ? 3 : 1)
    }, 0)
  }

  const whitePieces = 20 - capturedPieces.white.length
  const blackPieces = 20 - capturedPieces.black.length

  return (
    <div className="p-4 space-y-3">
      {/* Joueur 2 (en haut) */}
      <div
        className="p-4 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
            {player2.color === 'white' ? '⚪' : '⚫'}
          </div>
          <div>
            <p className="font-bold" style={{ color: colors.text }}>
              {player2.name}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Pièces: {player2.color === 'white' ? whitePieces : blackPieces}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: colors.primary }}>
            {getScore(player2.color)}
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            points
          </p>
        </div>
      </div>

      {/* Pièces capturées (par le joueur du haut) */}
      <div className="flex justify-between px-2">
        <div className="flex gap-1 flex-wrap">
          {capturedPieces[player2.color === 'white' ? 'black' : 'white'].map(
            (piece, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: player2.color === 'white' ? '#333' : '#fff',
                  border: '1px solid #666',
                }}
              >
                {piece.type === 'king' && (
                  <span className="text-xs" style={{ color: player2.color === 'white' ? '#fff' : '#333' }}>♛</span>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Joueur 1 (en bas) */}
      <div
        className="p-4 rounded-xl flex items-center justify-between"
        style={{ backgroundColor: colors.surface }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
            {player1.color === 'white' ? '⚪' : '⚫'}
          </div>
          <div>
            <p className="font-bold" style={{ color: colors.text }}>
              {player1.name}
            </p>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Pièces: {player1.color === 'white' ? whitePieces : blackPieces}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: colors.primary }}>
            {getScore(player1.color)}
          </p>
          <p className="text-xs" style={{ color: colors.textSecondary }}>
            points
          </p>
        </div>
      </div>
    </div>
  )
}
