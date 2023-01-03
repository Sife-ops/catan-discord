import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const start: Command = {
  schema: undefined,
  handler: async (_, { game }) => {
    if (!game) throw new Error("missing game");
    const playerCount = await model.entities.PlayerEntity.query
      .game_({ gameId: game.gameId })
      .go()
      .then(({ data }) => data.length);

    if (playerCount < 2) {
      return {
        type: 4,
        data: {
          content: "not enough players",
        },
      };
    }

    // todo: "too many players"
    // todo: initialize game

    return {
      type: 4,
      data: {
        content: "game started",
      },
    };
  },
};
