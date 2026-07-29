import { logger } from "../../shared/logger/logger";
import { ordersRepository } from "../orders/orders.repository";
import { ordersService } from "../orders/orders.service";
import { productsRepository } from "../products/products.repository";
import { selectProvider } from "./delivery.selector";
import { gamesRepository } from "../games/games.repository";
import { telegramClient } from "../notifications/telegram.client";

export const deliveryEngine = {
  async processOrder(orderId: string): Promise<void> {
    const order = await ordersRepository.findById(orderId);
    if (!order) {
      logger.error("Delivery Engine : commande introuvable", { orderId });
      return;
    }

    if (order.status !== "paid") {
      logger.warn("Delivery Engine : commande dans un état non livrable, ignorée", {
        orderId,
        status: order.status,
      });
      return;
    }

    await ordersService.transitionStatus(orderId, "processing");

    const product = await productsRepository.findById(order.productId);
    if (!product) {
      logger.error("Delivery Engine : produit introuvable pour la commande", { orderId });
      await ordersService.transitionStatus(orderId, "failed");
      return;
    }

    const provider = await selectProvider();

    const result = await provider.deliver({
      orderId: order.id,
      productSku: product.providerMapping[provider.name] ?? product.id,
      playerId: order.playerId,
      playerIdExtra: order.playerIdExtra,
    });

    if (result.externalTransactionId) {
      await ordersRepository.setProviderOrderId(orderId, result.externalTransactionId);
    }

    const attemptStatus =
      result.outcome === "success" ? "success" : result.outcome === "failed" ? "failed" : "pending";

    await ordersRepository.addDeliveryAttempt(orderId, {
      provider: provider.name,
      status: attemptStatus,
      response: result.rawResponse,
    });

    if (result.outcome === "success") {
      await ordersService.transitionStatus(orderId, "delivered");
    } else if (result.outcome === "failed") {
      await ordersService.transitionStatus(orderId, "failed");
    } else {
      // manual_pending : notifier les admins qu'une action manuelle est requise.
      const game = await gamesRepository.findById(order.gameId);
      const extraLines = Object.entries(order.playerIdExtra)
        .map(([key, value]) => `${key} : ${value}`)
        .join("\n");

      await telegramClient.sendAdminMessage(
        `🔔 <b>Nouvelle commande à livrer manuellement</b>\n\n` +
          `Jeu : ${game?.name ?? order.gameId}\n` +
          `Pack : ${product.name}\n` +
          `ID joueur : ${order.playerId}\n` +
          (extraLines ? `${extraLines}\n` : "") +
          `Montant : ${order.price} ${order.currency}\n` +
          `Commande : ${order.id}`
      );
    }
  },
};