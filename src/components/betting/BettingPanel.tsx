import { useState, useEffect } from 'react'
import { tonService } from '@/services/ton'
import { useBettingStore } from '@/stores/bettingStore'
import { useUserStore } from '@/stores/userStore'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        showAlert?: (message: string) => void
        openInvoice?: (url: string, callback?: (status: string) => void) => void
        HapticFeedback?: { notificationOccurred: (type: string) => void }
        initDataUnsafe?: { user?: { id: number } }
      }
    }
  }
}

interface BettingPanelProps {
  gameId: string
  opponent: string
  onBetPlaced: (amount: number, currency: 'TON' | 'STARS') => void
}

const presetAmounts = [1, 5, 10, 25, 50]

export function BettingPanel({ gameId, opponent, onBetPlaced }: BettingPanelProps) {
  const [betAmount, setBetAmount] = useState(1)
  const [currency, setCurrency] = useState<'TON' | 'STARS'>('TON')
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)

  const walletConnected = useUserStore((s) => s.walletConnected)
  const addBet = useBettingStore((s) => s.addBet)

  useEffect(() => {
    if (walletConnected && currency === 'TON') {
      tonService.getBalance().then(setBalance)
    }
  }, [walletConnected, currency])

  const handlePlaceBet = async () => {
    if (currency === 'TON' && !walletConnected) {
      alert('Veuillez connecter votre wallet TON')
      return
    }

    if (currency === 'TON' && betAmount > balance) {
      alert('Solde insuffisant')
      return
    }

    setLoading(true)

    try {
      if (currency === 'TON') {
        const result = await tonService.placeBet(betAmount, gameId)

        if (result.success) {
          addBet({
            id: Date.now().toString(),
            gameId,
            amount: betAmount,
            currency: 'TON',
            status: 'pending',
            txHash: result.txHash,
            timestamp: Date.now(),
          })

          onBetPlaced(betAmount, 'TON')

          if (window.Telegram?.WebApp?.showAlert) {
            window.Telegram.WebApp.showAlert(
              `Pari de ${betAmount} TON placé avec succès !`
            )
          }
          if (window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success')
          }
        } else {
          throw new Error('Transaction échouée')
        }
      } else {
        await placeBetWithStars(betAmount, gameId)
      }
    } catch (error) {
      console.error('Erreur pari:', error)
      alert('Erreur lors du placement du pari')
      if (window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred('error')
      }
    } finally {
      setLoading(false)
    }
  }

  const placeBetWithStars = async (amount: number, gameIdParam: string) => {
    try {
      const response = await fetch('/api/telegram/stars/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
          amount,
          gameId: gameIdParam,
          description: `Pari pour la partie contre ${opponent}`,
        }),
      })

      const data = await response.json()

      if (data.invoiceLink && window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(data.invoiceLink, (status) => {
          if (status === 'paid') {
            addBet({
              id: Date.now().toString(),
              gameId: gameIdParam,
              amount,
              currency: 'STARS',
              status: 'pending',
              timestamp: Date.now(),
            })
            onBetPlaced(amount, 'STARS')
          }
        })
      } else {
        throw new Error('API Stars non disponible')
      }
    } catch {
      alert('Paiement Stars indisponible. Utilisez TON ou réessayez plus tard.')
    }
  }

  return (
    <div className="betting-panel bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-700">
      <h3 className="text-2xl font-bold text-white mb-4">Placer un pari</h3>

      <div className="opponent-info mb-6 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400 text-sm">Adversaire</p>
        <p className="text-white font-semibold text-lg">{opponent}</p>
      </div>

      <div className="currency-selector mb-6">
        <p className="text-gray-400 text-sm mb-2">Devise</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setCurrency('TON')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              currency === 'TON'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="block text-xs">Crypto</span>
            <span className="block">TON</span>
          </button>
          <button
            type="button"
            onClick={() => setCurrency('STARS')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              currency === 'STARS'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <span className="block text-xs">Fiat</span>
            <span className="block">⭐ Stars</span>
          </button>
        </div>
      </div>

      {currency === 'TON' && !walletConnected && (
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-3">
            Connectez votre wallet pour parier en TON
          </p>
          <div id="ton-connect-button" />
        </div>
      )}

      {walletConnected && currency === 'TON' && (
        <div className="balance mb-6 p-4 bg-gray-800 rounded-lg">
          <p className="text-gray-400 text-sm">Solde disponible</p>
          <p className="text-white font-bold text-xl">{balance.toFixed(2)} TON</p>
        </div>
      )}

      <div className="preset-amounts mb-6">
        <p className="text-gray-400 text-sm mb-2">Montant rapide</p>
        <div className="grid grid-cols-5 gap-2">
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setBetAmount(amount)}
              className={`py-2 px-3 rounded-lg font-semibold transition-all ${
                betAmount === amount
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {amount}
            </button>
          ))}
        </div>
      </div>

      <div className="custom-amount mb-6">
        <p className="text-gray-400 text-sm mb-2">Montant personnalisé</p>
        <input
          type="number"
          value={betAmount}
          onChange={(e) => setBetAmount(parseFloat(e.target.value) || 0)}
          min={0.1}
          step={0.1}
          className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
          placeholder="Entrez un montant"
        />
      </div>

      <div className="potential-winnings mb-6 p-4 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-700/30">
        <p className="text-gray-400 text-sm">Gains potentiels (x1.9)</p>
        <p className="text-green-400 font-bold text-2xl">
          {(betAmount * 1.9).toFixed(2)} {currency}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Commission: 10% • Net: {(betAmount * 0.9).toFixed(2)} {currency}
        </p>
      </div>

      <button
        type="button"
        onClick={handlePlaceBet}
        disabled={
          loading ||
          (currency === 'TON' && !walletConnected) ||
          betAmount <= 0
        }
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-3"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Traitement...
          </span>
        ) : (
          `Parier ${betAmount} ${currency}`
        )}
      </button>

      <p className="text-gray-500 text-xs mt-4 text-center">
        ⚠️ Les paris comportent des risques. Jouez responsablement.
      </p>
    </div>
  )
}
