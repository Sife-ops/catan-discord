import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const cancel: Command = {
  handler: async (_, c) => {
    await model.entities.GameEntity.update({
      channelId: c.channelId,
      gameId: c.getGame().gameId,
    })
      .set({ winner: "none" })
      .go();

    return genericResponse("game cancelled");
  },
};
