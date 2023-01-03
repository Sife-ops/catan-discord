import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const cancel: Command = {
  schema: undefined,
  handler: async (_, { game, channelId }) => {
    if (!game) throw new Error("missing game");
    await model.entities.GameEntity.update({
      channelId,
      gameId: game.gameId,
    })
      .set({ winner: "none" })
      .go();

    return {
      type: 4,
      data: {
        content: "game cancelled",
      },
    };
  },
};
