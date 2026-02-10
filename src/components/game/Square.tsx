import React from 'react'
import type { Position } from '@/types'
import type { ThemeType } from '@/styles/themes/themeConfig'

interface SquareProps {
  position: Position
  isLight: boolean
  isSelected: boolean
  isValidMove: boolean
  isLastMove: boolean
  onClick: () => void
  theme: ThemeType
  children?: React.ReactNode
}

export const Square: React.FC<SquareProps> = ({
  position,
  isLight,
  isSelected,
  isValidMove,
  isLastMove,
  onClick,
  theme,
  children,
}) => {
  const getSquareClasses = () => {
    const baseClasses = [
      'square',
      'relative',
      'aspect-square',
      'min-w-[36px] min-h-[36px] sm:min-w-[44px] sm:min-h-[44px]',
      'flex',
      'items-center',
      'justify-center',
      'transition-all',
      'duration-200',
      'cursor-pointer',
      'select-none',
    ]

    if (isLight) {
      baseClasses.push('square-light')
    } else {
      baseClasses.push('square-dark')
    }

    if (isSelected) {
      baseClasses.push('ring-4', 'ring-yellow-400', 'ring-opacity-80', 'z-10')
    }

    if (isLastMove) {
      baseClasses.push('bg-opacity-80')
    }

    return baseClasses.join(' ')
  }

  return (
    <div
      role="button"
      tabIndex={0}
      className={getSquareClasses()}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      data-row={position.row}
      data-col={position.col}
      data-theme={theme}
    >
      {children}

      {/* Indicateur de coup valide */}
      {isValidMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className={`
              w-4 h-4 rounded-full
              ${children ? 'border-4 border-red-500' : 'bg-green-500'}
              animate-pulse
            `}
            style={{
              boxShadow: children
                ? '0 0 20px rgba(239, 68, 68, 0.8)'
                : '0 0 15px rgba(34, 197, 94, 0.8)',
            }}
          />
        </div>
      )}

      {/* Highlight du dernier coup */}
      {isLastMove && (
        <div
          className="absolute inset-0 bg-yellow-300 bg-opacity-20 pointer-events-none animate-pulse"
        />
      )}

      {/* Effet hover */}
      <div className="absolute inset-0 bg-white opacity-0 hover:opacity-10 transition-opacity pointer-events-none" />
    </div>
  )
}
