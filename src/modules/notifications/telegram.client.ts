import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../shared/logger/logger";

/**
 * Notifications admin via Telegram — gratuit, instantané, pas besoin de
 * garder l'admin ouvert. Si les variables ne sont pas configurées, on
 * ignore silencieusement plutôt que de faire planter le traitement de la
 * commande : une notification ratée ne doit jamais bloquer une vente.
 */
export const telegramClient = {
  async sendAdminMessage(text: string): Promise<void> {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
      return;
    }
    try {
      console.log("DEBUG token:", JSON.stringify(env.TELEGRAM_BOT_TOKEN), "longueur:", env.TELEGRAM_BOT_TOKEN.length);
      console.log("DEBUG chatId:", JSON.stringify(env.TELEGRAM_CHAT_ID));
      await axios.post(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
      });
    } catch (err) {
      logger.error("Échec de l'envoi de la notification Telegram", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
};