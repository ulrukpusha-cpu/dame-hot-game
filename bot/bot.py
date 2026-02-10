# bot/bot.py - Bot Telegram optionnel pour Dame Hot Game
# Variables d'environnement : TELEGRAM_BOT_TOKEN, WEB_APP_URL

import os
from telegram import Update, WebAppInfo, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Configuration
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://votre-domaine.com")


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Commande /start"""
    keyboard = [
        [
            InlineKeyboardButton(
                "🎮 Jouer maintenant",
                web_app=WebAppInfo(url=WEB_APP_URL),
            )
        ],
        [
            InlineKeyboardButton(
                "📊 Classement",
                web_app=WebAppInfo(url=f"{WEB_APP_URL}/leaderboard"),
            )
        ],
        [
            InlineKeyboardButton(
                "👥 Inviter des amis",
                url=f"https://t.me/share/url?url={WEB_APP_URL}&text=Viens jouer aux dames avec moi!",
            )
        ],
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "🎲 Bienvenue sur Dame Hot Game!\n\n"
        "Jouez aux dames contre vos amis ou l'IA, "
        "pariez en crypto et gagnez!\n\n"
        "Choisissez une option:",
        reply_markup=reply_markup,
    )


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Commande /help"""
    await update.message.reply_text(
        "📖 Aide - Dame Hot Game\n\n"
        "Commandes disponibles:\n"
        "/start - Démarrer le jeu\n"
        "/help - Afficher l'aide\n"
        "/stats - Voir vos statistiques\n"
        "/leaderboard - Classement global\n\n"
        "Pour jouer, cliquez sur '🎮 Jouer maintenant'!",
    )


async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Commande /stats"""
    # TODO: Appel API pour récupérer les stats (user_id = update.effective_user.id)
    await update.message.reply_text(
        "📊 Vos statistiques:\n\n"
        "⭐ Rating: 1200\n"
        "🏆 Victoires: 0\n"
        "😔 Défaites: 0\n"
        "🤝 Nuls: 0\n"
        "💰 Gains totaux: 0 TON",
    )


def main() -> None:
    """Démarrer le bot"""
    if not BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN non défini. Exportez-le ou ajoutez-le dans .env")
        return

    application = Application.builder().token(BOT_TOKEN).build()

    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("help", help_command))
    application.add_handler(CommandHandler("stats", stats))

    print("🤖 Bot démarré!")
    application.run_polling()


if __name__ == "__main__":
    main()
