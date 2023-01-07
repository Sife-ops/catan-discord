import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const cancel: Command = {
  handler: async (_, { game, channelId }) => {
    if (!game) throw new Error("missing game");
    await model.entities.GameEntity.update({
      channelId,
      gameId: game.gameId,
    })
      .set({ winner: "none" })
      .go();

    return genericResponse("game cancelled");
  },
};
