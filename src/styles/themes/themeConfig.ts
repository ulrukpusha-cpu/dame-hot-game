export type ThemeType = 'bronze' | 'silver' | 'gold'

export interface ThemeColors {
  boardLight: string
  boardDark: string
  boardBorder: string
  boardBackground: string

  pieceWhite: string
  pieceBlack: string
  pieceHighlight: string
  pieceShadow: string

  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string

  success: string
  warning: string
  error: string
  info: string

  glow: string
  shimmer: string
}

export const themes: Record<ThemeType, ThemeColors> = {
  bronze: {
    boardLight: '#D4A574',
    boardDark: '#8B6F47',
    boardBorder: '#5C4A33',
    boardBackground: 'linear-gradient(135deg, #3E2723 0%, #5D4037 100%)',

    pieceWhite: 'linear-gradient(145deg, #F5E6D3 0%, #D4A574 50%, #B8956A 100%)',
    pieceBlack: 'linear-gradient(145deg, #8B6F47 0%, #6B5745 50%, #5C4A33 100%)',
    pieceHighlight: '#FFD700',
    pieceShadow: 'rgba(0, 0, 0, 0.6)',

    primary: '#CD7F32',
    secondary: '#B8956A',
    accent: '#FFD700',
    background: '#2C1810',
    surface: '#3E2723',
    text: '#F5E6D3',
    textSecondary: '#D4A574',
    border: '#8B6F47',

    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',

    glow: 'rgba(255, 215, 0, 0.3)',
    shimmer:
      'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)',
  },

  silver: {
    boardLight: '#E0E0E0',
    boardDark: '#9E9E9E',
    boardBorder: '#616161',
    boardBackground: 'linear-gradient(135deg, #263238 0%, #37474F 100%)',

    pieceWhite: 'linear-gradient(145deg, #FFFFFF 0%, #E0E0E0 50%, #BDBDBD 100%)',
    pieceBlack: 'linear-gradient(145deg, #757575 0%, #616161 50%, #424242 100%)',
    pieceHighlight: '#00BCD4',
    pieceShadow: 'rgba(0, 0, 0, 0.7)',

    primary: '#B0BEC5',
    secondary: '#90A4AE',
    accent: '#00BCD4',
    background: '#1A1A1A',
    surface: '#263238',
    text: '#ECEFF1',
    textSecondary: '#B0BEC5',
    border: '#546E7A',

    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#03A9F4',

    glow: 'rgba(0, 188, 212, 0.4)',
    shimmer:
      'linear-gradient(90deg, transparent, rgba(0, 188, 212, 0.4), transparent)',
  },

  gold: {
    boardLight: '#FFD700',
    boardDark: '#DAA520',
    boardBorder: '#B8860B',
    boardBackground: 'linear-gradient(135deg, #1A0F00 0%, #2D1F0F 100%)',

    pieceWhite: 'linear-gradient(145deg, #FFF9E6 0%, #FFD700 50%, #DAA520 100%)',
    pieceBlack: 'linear-gradient(145deg, #B8860B 0%, #9B7410 50%, #7A5C0F 100%)',
    pieceHighlight: '#00FF88',
    pieceShadow: 'rgba(0, 0, 0, 0.8)',

    primary: '#FFD700',
    secondary: '#DAA520',
    accent: '#00FF88',
    background: '#0D0800',
    surface: '#1A0F00',
    text: '#FFF9E6',
    textSecondary: '#FFD700',
    border: '#B8860B',

    success: '#00FF88',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#29B6F6',

    glow: 'rgba(255, 215, 0, 0.5)',
    shimmer:
      'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.5), transparent)',
  },
}

export function getTheme(themeType: ThemeType): ThemeColors {
  return themes[themeType]
}
