import { toUserFriendlyAddress } from '@tonconnect/sdk'
import { TonConnectUI } from '@tonconnect/ui'
import { useUserStore } from '@/stores/userStore'

const MANIFEST_URL = import.meta.env.VITE_TONCONNECT_MANIFEST_URL ?? 'https://votre-domaine.com/tonconnect-manifest.json'
const CONTRACT_ADDRESS = import.meta.env.VITE_TON_CONTRACT_ADDRESS ?? 'VOTRE_ADRESSE_CONTRACT'

export class TonService {
  private tonConnect: TonConnectUI
  private manifestUrl: string

  constructor() {
    this.manifestUrl = MANIFEST_URL
    this.tonConnect = new TonConnectUI({
      manifestUrl: this.manifestUrl,
      buttonRootId: 'ton-connect-button',
    })
    this.setupListeners()
  }

  private setupListeners(): void {
    this.tonConnect.onStatusChange((wallet) => {
      if (wallet?.account?.address) {
        const address = toUserFriendlyAddress(wallet.account.address)
        useUserStore.getState().setProfile({
          walletConnected: true,
          walletAddress: address,
        })
      } else {
        useUserStore.getState().setProfile({
          walletConnected: false,
          walletAddress: null,
        })
      }
    })
  }

  async connectWallet(): Promise<boolean> {
    try {
      await this.tonConnect.openModal()
      return true
    } catch (error) {
      console.error('Erreur connexion wallet:', error)
      return false
    }
  }

  async disconnectWallet(): Promise<void> {
    await this.tonConnect.disconnect()
  }

  getWalletAddress(): string | null {
    const wallet = this.tonConnect.wallet
    if (!wallet?.account?.address) return null
    return toUserFriendlyAddress(wallet.account.address)
  }

  async getBalance(): Promise<number> {
    const address = this.getWalletAddress()
    if (!address) return 0
    try {
      const response = await fetch(
        `https://toncenter.com/api/v2/getAddressBalance?address=${address}`
      )
      const data = await response.json()
      return Number(data?.result ?? 0) / 1e9
    } catch (error) {
      console.error('Erreur récupération solde:', error)
      return 0
    }
  }

  async placeBet(
    amount: number,
    gameId: string
  ): Promise<{ success: boolean; txHash?: string }> {
    try {
      const wallet = this.tonConnect.wallet
      if (!wallet) throw new Error('Wallet non connecté')

      const nanoAmount = Math.floor(amount * 1e9).toString()
      const payload = this.createBetPayload(gameId)

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: nanoAmount,
            payload,
          },
        ],
      }

      const result = await this.tonConnect.sendTransaction(transaction)
      return { success: true, txHash: result?.boc }
    } catch (error) {
      console.error('Erreur lors du pari:', error)
      return { success: false }
    }
  }

  async withdrawWinnings(amount: number): Promise<boolean> {
    try {
      const wallet = this.tonConnect.wallet
      if (!wallet?.account?.address) return false

      const userAddress = toUserFriendlyAddress(wallet.account.address)
      const nanoAmount = Math.floor(amount * 1e9)
      const payload = this.createWithdrawPayload(userAddress, nanoAmount)

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 360,
        messages: [
          {
            address: CONTRACT_ADDRESS,
            amount: '50000000',
            payload,
          },
        ],
      }

      await this.tonConnect.sendTransaction(transaction)
      return true
    } catch (error) {
      console.error('Erreur retrait:', error)
      return false
    }
  }

  private createBetPayload(gameId: string): string {
    const data = {
      action: 'bet',
      gameId,
      timestamp: Date.now(),
    }
    return btoa(JSON.stringify(data))
  }

  private createWithdrawPayload(address: string, amount: number): string {
    const data = {
      action: 'withdraw',
      toAddress: address,
      amount,
      timestamp: Date.now(),
    }
    return btoa(JSON.stringify(data))
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const address = this.getWalletAddress()
      if (!address) return false
      const response = await fetch(
        `https://toncenter.com/api/v2/getTransactions?address=${address}&limit=10`
      )
      const data = await response.json()
      const list = data?.result ?? []
      return list.some(
        (tx: { transaction_id?: { hash?: string } }) =>
          tx.transaction_id?.hash === txHash
      )
    } catch (error) {
      console.error('Erreur vérification transaction:', error)
      return false
    }
  }
}

export const tonService = new TonService()
