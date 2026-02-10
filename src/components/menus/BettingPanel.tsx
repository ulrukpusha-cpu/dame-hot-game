import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface BettingPanelProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (amount: number, currency: 'TON' | 'STARS') => void
}

export function BettingPanel({ isOpen, onClose, onConfirm }: BettingPanelProps) {
  const [amount, setAmount] = useState(1)
  const [currency, setCurrency] = useState<'TON' | 'STARS'>('TON')

  const handleConfirm = () => {
    onConfirm(amount, currency)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Parier">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1">Montant</label>
          <input
            type="number"
            min={1}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-lg bg-white/10 border border-[var(--ui-border)] text-white"
          />
        </div>
        <div>
          <label className="block text-sm text-white/80 mb-1">Devise</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCurrency('TON')}
              className={`flex-1 py-2 rounded-lg font-medium ${currency === 'TON' ? 'btn-primary' : 'btn-secondary'}`}
            >
              TON
            </button>
            <button
              type="button"
              onClick={() => setCurrency('STARS')}
              className={`flex-1 py-2 rounded-lg font-medium ${currency === 'STARS' ? 'btn-primary' : 'btn-secondary'}`}
            >
              Stars
            </button>
          </div>
        </div>
        <p className="text-xs text-white/60">
          Commission 5-10% selon le mode de paiement.
        </p>
        <div className="flex gap-2 pt-2">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            Annuler
          </Button>
          <Button variant="primary" onClick={handleConfirm} className="flex-1">
            Confirmer
          </Button>
        </div>
      </div>
    </Modal>
  )
}
