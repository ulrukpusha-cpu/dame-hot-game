/**
 * Service API - Appels backend (scores, classement, parties)
 */

const API_BASE = import.meta.env.VITE_API_URL ?? ''

export async function fetchLeaderboard(limit = 50): Promise<{ rank: number; name: string; score: number; wins: number }[]> {
  if (!API_BASE) return []
  const res = await fetch(`${API_BASE}/leaderboard?limit=${limit}`)
  if (!res.ok) throw new Error('Leaderboard fetch failed')
  return res.json()
}

export async function fetchUserProfile(userId: string) {
  if (!API_BASE) return null
  const res = await fetch(`${API_BASE}/users/${userId}`)
  if (!res.ok) return null
  return res.json()
}

export async function saveGameResult(params: {
  userId: string
  mode: string
  winner: string | null
  moves: number
}) {
  if (!API_BASE) return
  await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
}
