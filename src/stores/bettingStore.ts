import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Bet {
  id: string
  gameId: string
  amount: number
  currency: 'TON' | 'STARS'
  status: 'pending' | 'won' | 'lost' | 'refunded'
  txHash?: string
  timestamp: number
  result?: {
    winnings?: number
    paidAt?: number
  }
}

interface BettingState {
  bets: Bet[]
  activeBet: Bet | null
  totalWagered: { TON: number; STARS: number }
  totalWon: { TON: number; STARS: number }

  addBet: (bet: Bet) => void
  updateBetStatus: (
    betId: string,
    status: Bet['status'],
    result?: Bet['result']
  ) => void
  getBetsByGame: (gameId: string) => Bet[]
  getActiveBet: () => Bet | null
  clearActiveBet: () => void
  getBettingHistory: () => Bet[]
  getStats: () => {
    totalBets: number
    wonBets: number
    lostBets: number
    winRate: number
  }
}

export const useBettingStore = create<BettingState>()(
  persist(
    (set, get) => ({
      bets: [],
      activeBet: null,
      totalWagered: { TON: 0, STARS: 0 },
      totalWon: { TON: 0, STARS: 0 },

      addBet: (bet) => {
        set((state) => ({
          bets: [...state.bets, bet],
          activeBet: bet,
          totalWagered: {
            ...state.totalWagered,
            [bet.currency]: state.totalWagered[bet.currency] + bet.amount,
          },
        }))
      },

      updateBetStatus: (betId, status, result) => {
        set((state) => {
          let newTotalWon = state.totalWon
          const updatedBets = state.bets.map((bet) => {
            if (bet.id !== betId) return bet
            const updatedBet: Bet = { ...bet, status, result }
            if (status === 'won' && result?.winnings !== undefined) {
              newTotalWon = {
                ...state.totalWon,
                [bet.currency]: state.totalWon[bet.currency] + result.winnings,
              }
            }
            return updatedBet
          })
          return {
            bets: updatedBets,
            activeBet: state.activeBet?.id === betId ? null : state.activeBet,
            totalWon: newTotalWon,
          }
        })
      },

      getBetsByGame: (gameId) => {
        return get().bets.filter((bet) => bet.gameId === gameId)
      },

      getActiveBet: () => get().activeBet,

      clearActiveBet: () => set({ activeBet: null }),

      getBettingHistory: () => {
        return [...get().bets].sort((a, b) => b.timestamp - a.timestamp)
      },

      getStats: () => {
        const { bets } = get()
        const totalBets = bets.length
        const wonBets = bets.filter((b) => b.status === 'won').length
        const lostBets = bets.filter((b) => b.status === 'lost').length
        const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0
        return { totalBets, wonBets, lostBets, winRate }
      },
    }),
    { name: 'betting-storage' }
  )
)
