import {
  getOptionValue,
  getNestedOptions,
  genericResponse,
} from "@catan-discord/bot/common";

import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const remove: Command = {
  schema: undefined,
  handler: async (body, ctx) => {
    const userId = getOptionValue(
      getNestedOptions(body.data.options, "remove"),
      "player"
    );

    if (userId === ctx.userId) {
      return genericResponse("cannot remove organizer");
    }

    if (!ctx.game) throw new Error("missing game");
    const playerId = await model.entities.PlayerEntity.query
      .game_({
        gameId: ctx.game.gameId,
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
