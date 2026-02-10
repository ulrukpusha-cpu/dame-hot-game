/**
 * Constantes globales du projet
 */

export const APP_NAME = 'Dame Hot Game'

export const BOARD_SIZE = 10

export const AI_DIFFICULTY_LEVELS = [
  { value: 1 as const, label: 'Débutant' },
  { value: 2 as const, label: 'Facile' },
  { value: 3 as const, label: 'Moyen' },
  { value: 4 as const, label: 'Difficile' },
  { value: 5 as const, label: 'Expert' },
] as const

export const THEMES = [
  { id: 'bronze' as const, label: 'Bronze', emoji: '🪵' },
  { id: 'silver' as const, label: 'Silver', emoji: '⚪' },
  { id: 'gold' as const, label: 'Gold', emoji: '👑' },
] as const
