import React from 'react'
import type { PiecePosition, Position } from '@/types'
import type { ThemeType } from '@/styles/themes/themeConfig'

interface PieceProps {
  piece: PiecePosition
  position: Position
  theme: ThemeType
  isSelected: boolean
}

export const Piece: React.FC<PieceProps> = ({
  piece,
  position,
  theme,
  isSelected,
}) => {
  const getPieceClasses = () => {
    const baseClasses = [
      'piece',
      'absolute w-[85%] h-[85%] left-[7.5%] top-[7.5%]',
      'rounded-full',
      'flex',
      'items-center',
      'justify-center',
      'text-2xl',
      'font-bold',
      'transition-all',
      'duration-300',
      'cursor-pointer',
      'relative',
    ]

    if (piece.color === 'light') {
      baseClasses.push('piece-white')
    } else {
      baseClasses.push('piece-black')
    }

    if (piece.type === 'king') {
      baseClasses.push('piece-king')
    }

    if (isSelected) {
      baseClasses.push('scale-110', 'z-20')
    }

    baseClasses.push('hover:scale-105', 'active:scale-95')

    return baseClasses.join(' ')
  }

  return (
    <div
      className={getPieceClasses()}
      draggable
      data-position={JSON.stringify(position)}
      data-theme={theme}
    >
      {/* Reflet 3D */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Ombre interne */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1/3 rounded-full pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          borderRadius: '0 0 50% 50%',
        }}
      />
    </div>
  )
}
