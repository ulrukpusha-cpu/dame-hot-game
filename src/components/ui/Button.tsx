import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary'
  onClick?: () => void
  disabled?: boolean
  className?: string
  fullWidth?: boolean
}

export function Button({
  children,
  variant = 'primary',
  onClick,
  disabled,
  className = '',
  fullWidth,
}: ButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-xl font-semibold transition-colors
        btn-${variant}
        ${fullWidth ? 'w-full' : ''}
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
