import { useGameStore } from '@/stores/gameStore'

const MAX_VISIBLE = 8

export function MoveHistory() {
  const moveHistory = useGameStore((s) => s.moveHistory)

  if (moveHistory.length === 0) return null

  const visible = moveHistory.slice(-MAX_VISIBLE)

  return (
    <div className="mt-3 w-full max-w-xs mx-auto">
      <h3 className="text-sm font-semibold text-white/80 mb-0.5">Historique des coups</h3>
      <p className="text-xs text-white/50 mb-1">Mouvements effectués pendant la partie (ce ne sont pas des commandes).</p>
      <ul className="text-xs text-white/70 space-y-0.5 max-h-24 overflow-y-auto">
        {visible.map((move, i) => (
          <li key={i}>
            {move.from.row},{move.from.col} → {move.to.row},{move.to.col}
            {move.captures?.length ? ` (prise)` : ''}
            {move.promoted ? ' ♔' : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
