# Bot Telegram - Dame Hot Game

Bot optionnel pour lancer la Mini App et afficher le menu depuis Telegram.

## Configuration

Variables d'environnement (ou `.env` chargé avant) :

- **TELEGRAM_BOT_TOKEN** : token du bot (obtenir via [@BotFather](https://t.me/BotFather))
- **WEB_APP_URL** : URL de la Mini App (ex. `https://votre-domaine.com`)

## Installation

```bash
cd bot
python -m venv .venv
# Windows
.venv\Scripts\activate
# Unix / macOS
source .venv/bin/activate
pip install -r requirements.txt
```

## Lancer le bot

```bash
export TELEGRAM_BOT_TOKEN="..."
export WEB_APP_URL="https://votre-domaine.com"
python bot.py
```

## Commandes

- `/start` : message de bienvenue + boutons (Jouer, Classement, Inviter)
- `/help` : aide
- `/stats` : statistiques (placeholder, à brancher sur l’API)

## Note

L’app frontend (Vite) est une SPA : l’URL `/leaderboard` n’existe que si vous ajoutez un routeur (ex. React Router). Sinon, le bouton « Classement » peut pointer sur la même URL que « Jouer » et l’utilisateur ouvre le classement depuis le menu dans l’app.
