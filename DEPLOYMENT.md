# Guide de Déploiement - Dame Hot Game

## Lignes précises à ajouter

### Fichier `.env.local` (racine du projet, pour le dev / build)

```env
VITE_API_URL=https://hot-game-dame-production.up.railway.app
VITE_WS_URL=wss://hot-game-dame-production.up.railway.app
VITE_BOT_USERNAME=VotreBotUsername
VITE_TON_MANIFEST_URL=https://votre-domaine.com/tonconnect-manifest.json
```

### Variables Vercel (dashboard → Project → Settings → Environment Variables)

Ajouter **une par une** (remplacer les valeurs) :

| Nom | Valeur à coller |
|-----|------------------|
| `VITE_API_URL` | `https://hot-game-dame-production.up.railway.app` |
| `VITE_WS_URL` | `wss://hot-game-dame-production.up.railway.app` |
| `VITE_BOT_USERNAME` | `DameHotGameBot` (ou le username de votre bot) |
| `VITE_TON_MANIFEST_URL` | `https://votre-domaine.vercel.app/tonconnect-manifest.json` |

### Variables Railway / Render (backend)

| Nom | Valeur à coller |
|-----|------------------|
| `DATABASE_URL` | `postgresql://user:password@host:5432/database` |
| `REDIS_URL` | `redis://default:xxx@host:port` (ou l’URL fournie par Railway/Render) |
| `JWT_SECRET` | une chaîne aléatoire longue (ex. `openssl rand -hex 32`) |
| `TELEGRAM_BOT_TOKEN` | le token de @BotFather |
| `API_URL` | `https://hot-game-dame-production.up.railway.app` (URL publique de votre backend) |
| `CLIENT_URL` | URL du frontend (ex. `https://votre-app.vercel.app`) — **obligatoire pour CORS** |

### Commandes à exécuter (remplacer les valeurs puis coller)

**Menu Telegram (bouton « Jouer ») :**

```bash
export TELEGRAM_BOT_TOKEN="123456:ABC-Def..."
export APP_URL="https://votre-app.vercel.app"
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton" -H "Content-Type: application/json" -d "{\"menu_button\":{\"type\":\"web_app\",\"text\":\"🎮 Jouer\",\"web_app\":{\"url\":\"${APP_URL}\"}}}"
```

**Webhook Telegram (si votre backend a une route `/webhook/telegram`) :**

```bash
export TELEGRAM_BOT_TOKEN="123456:ABC-Def..."
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" -H "Content-Type: application/json" -d "{\"url\":\"https://hot-game-dame-production.up.railway.app/webhook/telegram\"}"
```

---

## Prérequis

- **Node.js 18+**
- Compte **Vercel** ou **Netlify** (frontend)
- Compte **Railway**, **Render** ou équivalent (backend WebSocket)
- Bot Telegram créé via **@BotFather**
- Wallet **TON** (Tonkeeper, etc.) pour le smart contract

---

## 1. Créer le Bot Telegram

1. Ouvrir **@BotFather** sur Telegram.
2. Envoyer `/newbot` et suivre les instructions (nom, username).
3. Récupérer le **token** (ex. `123456:ABC-Def...`).
4. Conserver ce token pour `TELEGRAM_BOT_TOKEN` / `BOT_TOKEN`.

---

## 2. Configurer le Bot

Dans @BotFather :

- **Description** : `/setdescription` → texte de présentation du jeu.
- **Photo** : `/setuserpic` → image du bot.
- **Menu (Mini App)** : `/setmenubutton`  
  - Type : **webapp**  
  - Texte : `🎮 Jouer`  
  - URL : `https://votre-domaine.com` (URL réelle du frontend après déploiement)

Vous pouvez aussi configurer le menu après déploiement avec le script :

```bash
export TELEGRAM_BOT_TOKEN="..."
export APP_URL="https://votre-domaine.com"
# Puis exécuter la partie "Menu Button" de deploy.sh, ou :
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d '{"menu_button":{"type":"web_app","text":"🎮 Jouer","web_app":{"url":"'"${APP_URL}"'"}}}'
```

---

## 3. Déployer le Frontend (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Connexion
vercel login

# Déployer (depuis la racine du projet)
vercel --prod
```

**Variables d'environnement** (dashboard Vercel → Project → Settings → Environment Variables) :

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `VITE_API_URL`      | URL de l’API backend (ex. `https://api.votre-domaine.com`) |
| `VITE_WS_URL`       | URL WebSocket (ex. `wss://ws.votre-domaine.com`) |
| `VITE_BOT_USERNAME` | Username du bot (ex. `DameHotGameBot`) |
| `VITE_TON_MANIFEST_URL` | URL du manifest TonConnect (ex. `https://votre-domaine.com/tonconnect-manifest.json`) |

Après déploiement, noter l’URL du frontend (ex. `https://dame-hot-game.vercel.app`) pour `APP_URL` et pour le menu du bot.

---

## 4. Déployer le Backend (Railway / Render)

Le backend est dans `server/` (Express + Socket.io + Redis).

### Comment obtenir une URL d’API Railway (étape par étape)

1. **Créer un compte**  
   Aller sur [railway.app](https://railway.app) → **Login** (GitHub, Google ou email).

2. **Installer Railway CLI** (sur votre PC) :
   ```bash
   npm i -g @railway/cli
   ```

3. **Se connecter** :
   ```bash
   railway login
   ```
   Une page s’ouvre dans le navigateur pour autoriser le CLI.

4. **Créer un projet et déployer le serveur** (depuis la racine du projet) :
   ```bash
   cd server
   railway init
   ```
   Choisir **« Create new project »** puis donner un nom (ex. `dame-hot-game-api`).

5. **Déployer** :
   ```bash
   railway up
   ```
   Railway détecte Node.js, exécute `npm install` et `npm start` (votre `server/` utilise déjà `process.env.PORT`).

6. **Obtenir une URL publique**  
   - Dans le dashboard Railway : ouvrir votre projet → cliquer sur le **service** (votre backend).  
   - Onglet **Settings** → **Networking** → **Generate Domain**.  
   - Railway crée une URL du type `https://votre-service-xxxx.up.railway.app`.  
   Cette URL est votre **API_URL** (et la même en `wss://...` pour le WebSocket).

7. **Variables d’environnement**  
   Dans le même service : **Variables** → ajouter au minimum :
   - `REDIS_URL` : créer un service **Redis** dans le projet (Railway → New → Database → Redis), puis copier l’URL dans **Variables** (ou `REDIS_URL` est parfois injecté automatiquement).  
   - `JWT_SECRET` : une chaîne aléatoire (ex. `openssl rand -hex 32`).  
   - `CLIENT_URL` : l’URL de votre frontend Vercel (ex. `https://votre-app.vercel.app`) pour que le CORS accepte les requêtes.  
   Optionnel : `TELEGRAM_BOT_TOKEN`, `API_URL` (mettre l’URL Railway générée à l’étape 6).

8. **Redéployer** après avoir ajouté les variables (Railway redéploie souvent automatiquement).

Votre API est alors accessible à l’URL générée (ex. `https://dame-hot-game-api.up.railway.app`). Utilisez cette URL pour `VITE_API_URL` et `VITE_WS_URL` (en `wss://` pour le WebSocket) dans Vercel et dans le webhook Telegram.

---

**Railway (raccourci) :**

```bash
cd server
railway init
railway up
```

**Variables d’environnement** (Railway / Render) :

| Variable   | Description                    |
|-----------|---------------------------------|
| `DATABASE_URL` | PostgreSQL (si utilisé)      |
| `REDIS_URL`    | Redis (sessions, matchmaking) |
| `JWT_SECRET`   | Secret pour les JWT          |
| `TELEGRAM_BOT_TOKEN` | Token du bot (pour webhook) |
| `API_URL`      | URL publique de l’API (pour webhook Telegram) |

Si vous exposez un **webhook Telegram**, l’API doit exposer une route (ex. `POST /webhook/telegram`) et l’URL enregistrée sera `https://api.votre-domaine.com/webhook/telegram`.

---

## 5. Déployer le Smart Contract TON

Le contrat est dans `contract/betting.fc`. Voir aussi `contract/README.md`.

**Option A – Blueprint / toncli :**

- Inclure la stdlib TON et compiler `betting.fc` → `.boc` / `.tvc`.
- Déployer via Blueprint ou toncli sur testnet/mainnet.

**Option B – Compilateur Func :**

```bash
cd contract
# Avec stdlib TON (stdlib.fc au même niveau ou dans le PATH)
func -o betting.fif betting.fc
# Puis générer .boc et déployer via Tonkeeper / ton-wallet
```

Après déploiement, renseigner l’adresse du contrat dans `TON_CONTRACT_ADDRESS` (backend) et dans le frontend si nécessaire (TonConnect / manifest).

---

## 6. Configurer le Webhook Telegram (optionnel)

Si le backend gère les mises à jour du bot via webhook (et non via le bot Python en polling) :

```bash
curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\": \"https://api.votre-domaine.com/webhook/telegram\"}"
```

Le script `deploy.sh` à la racine peut faire cette configuration si `TELEGRAM_BOT_TOKEN` et `API_URL` sont définis.

**Alternative :** utiliser le bot Python (`bot/bot.py`) en **polling** (sans webhook). Voir `bot/README.md`.

---

## 7. Tester

1. Ouvrir le bot dans Telegram.
2. Cliquer sur **« 🎮 Jouer »** (ou le bouton du menu) et vérifier que la Mini App se charge.
3. Tester une partie contre l’IA.
4. Tester une partie en ligne (deux clients, même backend).
5. Vérifier connexion TON (TonConnect) et manifest si les paris sont activés.

---

## Monitoring

- **Logs** : Vercel (frontend), Railway/Render (backend).
- **Erreurs** : Sentry (ajouter `SENTRY_DSN` si configuré).
- **Analytics** : Google Analytics, Mixpanel, etc.
- **Performance** : Lighthouse, Web Vitals.

---

## Maintenance

- **Sauvegardes** : backups quotidiens de la base de données (PostgreSQL, etc.).
- **TON** : surveiller les transactions et le solde du contrat.
- **Dépendances** : mettre à jour régulièrement (`npm update`, `pip install -U -r bot/requirements.txt`).
- **Tests** : exécuter les tests de régression (lint, build, scénarios critiques) avant chaque mise en production.

---

## Récapitulatif des URLs

| Rôle        | Variable / usage        | Exemple                          |
|------------|-------------------------|----------------------------------|
| Frontend   | `APP_URL`, menu bot     | `https://dame-hot-game.vercel.app` |
| API        | `API_URL`, webhook      | `https://hot-game-dame-production.up.railway.app` |
| WebSocket  | `VITE_WS_URL`           | `wss://hot-game-dame-production.up.railway.app` |
| TonConnect | `VITE_TON_MANIFEST_URL` | `https://.../tonconnect-manifest.json` |

Pour un déploiement en une commande (build + Vercel + config bot), utiliser `./deploy.sh` après avoir défini `TELEGRAM_BOT_TOKEN`, `API_URL` et `APP_URL`.
