import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const remove: Command = {
  handler: async (ctx) => {
    const userId = ctx.getOptionValue("player");

    if (userId === ctx.userId) {
      return genericResponse("cannot remove organizer");
    }

    const playerId = await model.entities.PlayerEntity.query
      .game_({
        gameId: ctx.getGame().gameId,
        userId,
      })
      .go()
      .then(({ data }) => data[0]?.playerId);

    if (!playerId) {
      return genericResponse("player does not exist");
    }

    await model.entities.PlayerEntity.remove({ playerId }).go();

    return genericResponse("removed player");
  },
};
