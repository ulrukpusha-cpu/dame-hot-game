import { useState, useCallback } from 'react'
import type { Player, Move, CurrentGame } from '@/types'
import { useGameStore } from '@/stores/gameStore'

/**
 * Hook multijoueur : amis en ligne, invitation, partie en cours, coups, chat, nulle, abandon.
 * currentGame à null tant qu'aucune partie multijoueur n'est jointe ; à brancher sur WebSocket/API.
 */
export function useMultiplayer() {
  const [onlineFriends] = useState<Player[]>([])
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null)

  const invitePlayer = useCallback(
    (
      _playerId: string,
      _betAmount?: number,
      _betCurrency?: 'TON' | 'STARS'
    ) => {
      // TODO: envoyer invitation (WebSocket, API, Telegram share, etc.)
    },
    []
  )

  const makeMove = useCallback((move: Move) => {
    useGameStore.getState().makeMove(move)
    // TODO: envoyer le coup au serveur / WebSocket
  }, [])

  const sendChatMessage = useCallback((_message: string) => {
    // TODO: envoyer message chat (WebSocket)
    setCurrentGame((prev) =>
      prev
        ? {
            ...prev,
            chat: [
              ...prev.chat,
              {
                userId: 'me',
                username: 'Moi',
                message: _message,
              },
            ],
          }
        : null
    )
  }, [])

  const offerDraw = useCallback(() => {
    // TODO: proposer nulle (WebSocket)
  }, [])

  const resign = useCallback(() => {
    // TODO: abandon (WebSocket) puis retour menu / résultats
  }, [])

  return {
    onlineFriends,
    invitePlayer,
    currentGame,
    setCurrentGame,
    makeMove,
    sendChatMessage,
    offerDraw,
    resign,
  }
}
