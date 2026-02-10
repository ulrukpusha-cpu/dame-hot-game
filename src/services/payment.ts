/**
 * Service Paiement - TON Connect / Telegram Stars (stub)
 */

export type PaymentCurrency = 'TON' | 'STARS'

const COMMISSION_RATE = 0.05

export function getCommission(amount: number): number {
  return Math.round(amount * COMMISSION_RATE * 100) / 100
}

export function getNetAmount(amount: number): number {
  return amount - getCommission(amount)
}

export async function requestPayment(
  _amount: number,
  _currency: PaymentCurrency
): Promise<{ success: boolean; txId?: string }> {
  // TODO: TON Connect / Telegram Stars
  return { success: false }
}

export async function withdraw(_amount: number, _currency: PaymentCurrency): Promise<boolean> {
  // TODO: retrait wallet
  return false
}
