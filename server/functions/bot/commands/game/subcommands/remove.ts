import { Command } from "@catan-discord/bot/runner";
import { getOptionValue, getNestedOptions } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const remove: Command = {
  schema: undefined,
  handler: async (body, ctx) => {
    const userId = getOptionValue(
      getNestedOptions(body.data.options, "remove"),
      "player"
    );

    if (userId === ctx.userId) {
      return {
        type: 4,
        data: {
          content: "cannot remove organizer",
        },
      };
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
      return {
        type: 4,
        data: {
          content: "player does not exist",
        },
      };
    }

    await model.entities.PlayerEntity.remove({ playerId }).go();

    return {
      type: 4,
      data: {
        content: "removed player",
      },
    };
  },
};
