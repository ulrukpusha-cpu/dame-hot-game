# Dame Hot Game

WebApp de jeu de dames pour Telegram : multijoueur, IA, paris (TON / Stars), 3 thèmes (Bronze, Silver, Gold).

## Stack

- **React 18+** + **TypeScript** + **Vite**
- **Tailwind CSS** (v4) + **Framer Motion**
- **Zustand** (état global)
- **@telegram-apps/sdk-react** (intégration Telegram)

## Structure du projet

```
src/
├── components/
│   ├── game/          # Plateau, pièces, contrôles, historique des coups
│   │   ├── Board.tsx
│   │   ├── Piece.tsx
│   │   ├── GameControls.tsx
│   │   └── MoveHistory.tsx
│   ├── menus/         # Menu principal, thèmes, paris, résultats, classement
│   │   ├── MainMenu.tsx
│   │   ├── ThemeSelector.tsx
│   │   ├── BettingPanel.tsx
│   │   ├── ResultsScreen.tsx
│   │   └── LeaderboardScreen.tsx
│   └── ui/            # Bouton, Modal, Toast
├── config/
│   └── constants.ts   # Constantes (thèmes, niveaux IA, nom app)
├── hooks/
│   ├── useGameLogic.ts  # Logique partie + IA
│   ├── useTheme.ts      # Application du thème (data-theme)
│   └── useTelegram.ts   # SDK Telegram (user, haptic)
├── services/
│   ├── api.ts         # Appels backend (classement, profil)
│   ├── telegram.ts    # Helpers WebApp Telegram
│   ├── payment.ts     # TON / Telegram Stars (stub)
│   └── socket.ts      # WebSocket multijoueur (stub)
├── stores/
│   ├── gameStore.ts   # État du jeu (plateau, tour, historique)
│   ├── userStore.ts   # Profil et solde
│   ├── bettingStore.ts
│   └── themeStore.ts
├── styles/
│   ├── globals.css    # Tailwind + variables thèmes
│   └── themes/        # Bronze, Silver, Gold (classes plateau/pièces/boutons)
├── types/
│   └── index.ts
└── utils/
    ├── gameRules.ts   # Règles dames (8x8), coups valides, fin de partie
    ├── validation.ts  # Validation d’un coup
    └── ai.ts          # IA (random → minimax alpha-beta)
```

## Imports

Les imports utilisent l’alias **`@/`** (→ `src/`) pour des chemins plus courts :

- `@/components/game/Board`
- `@/stores/gameStore`
- `@/utils/gameRules`
- `@/types`

## Commandes

```bash
npm install
npm run dev      # Démarrage en dev
npm run build    # Build production
npm run preview  # Prévisualisation du build
```

## Configuration Telegram

Pour tester dans Telegram : configurer un Bot et une Web App, puis ouvrir l’URL de l’app. Le script `telegram-web-app.js` est chargé dans `index.html`.

## Prochaines étapes

1. Backend + WebSocket pour le multijoueur
2. TON Connect + Telegram Stars pour les paris
3. Persistance (Supabase/Firebase) pour classement et profils
