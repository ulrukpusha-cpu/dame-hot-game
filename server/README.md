# Serveur multijoueur – Dame Hot Game

Serveur Express + Socket.io + Redis pour le jeu de dames en temps réel (invitations, parties, chat, paris, ELO).

## Prérequis

- Node.js 18+
- Redis (local ou `REDIS_URL`)

## Installation

```bash
cd server
npm install
```

## Variables d'environnement

| Variable       | Description                    | Défaut              |
|----------------|--------------------------------|---------------------|
| `PORT`         | Port du serveur                | `3001`              |
| `CLIENT_URL`   | Origine CORS (URL de la webapp)| `http://localhost:5173` |
| `REDIS_URL`    | URL Redis                      | `redis://localhost:6379` |
| `API_URL`      | URL de l’API principale (paiements, games, users) | (optionnel) |

## Démarrage

```bash
npm run dev   # développement (watch)
npm start     # production
```

## Authentification

Le client envoie le **token Telegram** (initData de la WebApp) dans `socket.handshake.auth.token`.  
Le serveur utilise `verifyTelegramWebAppData(token)` pour extraire l’utilisateur (id, telegramId, username, photoUrl, rating).  
Pour la prod, il faut vérifier la signature Telegram (voir [Validating data](https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)).

## Événements Socket.io

### Client → Serveur

- `game:invite` – Inviter un ami (`friendId`, `betAmount?`, `betCurrency?`)
- `game:accept` – Accepter une invitation (`invitationId`, `fromUserId`)
- `game:decline` – Refuser une invitation
- `game:move` – Jouer un coup (`gameId`, `move`)
- `game:offer-draw` – Proposer la nulle
- `game:accept-draw` – Accepter la nulle
- `game:resign` – Abandonner
- `chat:message` – Message dans le chat de la partie
- `chat:emoji` – Envoyer un emoji

### Serveur → Client

- `friends:online` – Liste des amis en ligne
- `game:invitation` – Nouvelle invitation
- `game:invitation-sent` – Invitation envoyée
- `game:invitation-declined` – Invitation refusée
- `game:started` – Partie démarrée (gameId, players, board, betAmount, betCurrency, timer)
- `game:move-made` – Coup joué
- `game:ended` – Partie terminée (result, winner, winnings, finalBoard, moveHistory)
- `game:draw-offered` – Nulle proposée
- `game:timer-update` – Mise à jour des temps
- `player:disconnected` – Adversaire déconnecté (reconnectTime: 60s)
- `chat:new-message` – Nouveau message
- `chat:emoji` – Emoji reçu
- `friend:status-changed` – Un ami est en ligne / hors ligne
- `error` – Erreur (message)
- `haptic:notification` / `haptic:impact` – Feedback haptique
- `sound:play` – Son à jouer

## Connexion client

Depuis la webapp, connecter le socket avec l’URL du serveur et le token Telegram :

```ts
import { io } from 'socket.io-client'

const socket = io('http://localhost:3001', {
  auth: { token: window.Telegram?.WebApp?.initData }
})
```
