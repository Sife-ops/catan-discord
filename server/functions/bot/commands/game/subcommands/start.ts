import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const start: Command = {
  schema: undefined,
  handler: async (_, { game, channelId }) => {
    if (!game) throw new Error("missing game");
    const playerCount = await model.entities.PlayerEntity.query
      .game_({ gameId: game.gameId })
      .go()
      .then(({ data }) => data.length);

    if (playerCount < 2) {
      return genericResponse("not enough players");
    }

    // todo: "too many players"
    // todo: initialize game

    await model.entities.GameEntity.update({
      channelId,
      gameId: game.gameId,
    })
      .set({ started: true })
      .go();

    return genericResponse("game started");
  },
};
