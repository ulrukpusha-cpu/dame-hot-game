/** Déclarations pour @tonconnect/sdk et @tonconnect/ui (types résolus au build) */
declare module '@tonconnect/sdk' {
  export function toUserFriendlyAddress(address: unknown): string
  export function fromUserFriendlyAddress(address: string): unknown
}

declare module '@tonconnect/ui' {
  export class TonConnectUI {
    wallet: { account?: { address?: string } } | null
    constructor(options: { manifestUrl: string; buttonRootId?: string })
    onStatusChange(callback: (wallet: { account?: { address?: string } } | null) => void): () => void
    openModal(): Promise<void>
    disconnect(): Promise<void>
    sendTransaction(tx: unknown): Promise<{ boc: string }>
  }
}
