import { create } from 'zustand'
import type { UserProfile } from '@/types'

interface UserStore extends UserProfile {
  isLoaded: boolean
  setProfile: (profile: Partial<UserProfile>) => void
  setBalance: (ton: number, stars: number) => void
  addXp: (amount: number) => void
  setLoaded: (loaded: boolean) => void
}

const initialProfile: UserProfile = {
  id: '',
  balanceTon: 0,
  balanceStars: 0,
  xp: 0,
  level: 1,
}

export const useUserStore = create<UserStore>((set) => ({
  ...initialProfile,
  isLoaded: false,

  setProfile: (profile) =>
    set((s) => ({ ...s, ...profile })),
  setBalance: (balanceTon, balanceStars) =>
    set({ balanceTon, balanceStars }),
  addXp: (amount) =>
    set((s) => {
      const xp = s.xp + amount
      const level = Math.floor(xp / 100) + 1
      return { xp, level }
    }),
  setLoaded: (isLoaded) => set({ isLoaded }),
}))
