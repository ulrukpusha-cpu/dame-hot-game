#!/bin/bash
# deploy.sh - Déploiement Dame Hot Game
# Variables attendues (export ou .env) : TELEGRAM_BOT_TOKEN, API_URL, APP_URL

set -e

echo "🚀 Déploiement de Dame Hot Game"

# 1. Build du frontend
echo "📦 Build du frontend..."
npm run build

# 2. Vérifications (pas de script test dans le projet, on fait lint)
echo "🔍 Vérification (lint)..."
npm run lint

# 3. Build du backend WebSocket
echo "📦 Build du backend..."
cd server
npm run build
cd ..

# 4. Déploiement sur Vercel (frontend)
echo "☁️ Déploiement sur Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod
else
  echo "⚠️ Vercel CLI non installé (npm i -g vercel). Déployez manuellement ou ignorez."
fi

# 5. Déploiement du backend (Railway / Render / autre)
echo "☁️ Déploiement du backend..."
echo "   À faire manuellement ou via CI (Railway, Render, etc.)."

# 6. Configuration du Bot Telegram (si variables définies)
if [ -n "${TELEGRAM_BOT_TOKEN}" ] && [ -n "${API_URL}" ]; then
  echo "🤖 Configuration du webhook Telegram..."
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
    -H "Content-Type: application/json" \
    -d "{\"url\": \"${API_URL}/webhook/telegram\"}"
  echo ""
else
  echo "⚠️ TELEGRAM_BOT_TOKEN et API_URL non définis : webhook non configuré."
fi

# 7. Menu Button Telegram (Mini App)
APP_URL="${APP_URL:-https://votre-domaine.com}"
if [ -n "${TELEGRAM_BOT_TOKEN}" ]; then
  echo "🤖 Configuration du menu Telegram..."
  curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setChatMenuButton" \
    -H "Content-Type: application/json" \
    -d "{
      \"menu_button\": {
        \"type\": \"web_app\",
        \"text\": \"🎮 Jouer\",
        \"web_app\": {
          \"url\": \"${APP_URL}\"
        }
      }
    }"
  echo ""
else
  echo "⚠️ TELEGRAM_BOT_TOKEN non défini : menu button non configuré."
fi

echo "✅ Déploiement terminé!"
