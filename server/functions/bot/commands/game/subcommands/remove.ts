import { getOptionValue, genericResponse } from "@catan-discord/bot/common";

import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const remove: Command = {
  handler: async (_, ctx) => {
    const userId = getOptionValue(ctx.flatOptions[2], "player");

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
