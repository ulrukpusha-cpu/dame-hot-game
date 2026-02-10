/**
 * Service WebSocket - Multijoueur temps réel (stub)
 */

type SocketEvent =
  | 'game:invite'
  | 'game:accept'
  | 'game:move'
  | 'game:end'
  | 'chat:message'
  | 'bet:placed'

type EventHandler = (payload: unknown) => void

let ws: WebSocket | null = null
const listeners = new Map<SocketEvent, Set<EventHandler>>()

export function connect(_url?: string): void {
  // TODO: WebSocket URL from env, auth token from Telegram
  // ws = new WebSocket(url)
  // ws.onmessage = (e) => { const { event, data } = JSON.parse(e.data); emit(event, data) }
}

export function disconnect(): void {
  ws?.close()
  ws = null
  listeners.clear()
}

export function on(event: SocketEvent, handler: EventHandler): () => void {
  if (!listeners.has(event)) listeners.set(event, new Set())
  listeners.get(event)!.add(handler)
  return () => listeners.get(event)?.delete(handler)
}

export function emit(event: SocketEvent, data: unknown): void {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({ event, data }))
}

export function isConnected(): boolean {
  return ws != null && ws.readyState === WebSocket.OPEN
}
