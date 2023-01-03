import { Command } from "@catan-discord/bot/runner";
import { getOptionValue, getNestedOptions } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const create: Command = {
  schema: undefined,
  handler: async (body, { userId, game, channelId }) => {
    /**
     * 1) one game per channel
     * 2) map must exist
     * 3) create game
     */

    // 1) one game per channel
    if (game) {
      return {
        type: 4,
        data: {
          content: "game already exists",
        },
      };
    }

    // 2) map must exist
    const mapId = getOptionValue(
      getNestedOptions(body.data.options, "create"),
      "map"
    );

    const map = await model.entities.MapEntity.query
      .map({ mapId })
      .go()
      .then(({ data }) => data[0]?.data);

    if (!map) {
      return {
        type: 4,
        data: {
          content: "map does not exist",
        },
      };
    }

    // 3) create game
    const gameMutation = await model.entities.GameEntity.create({
      channelId,
      map,
      userId,
    }).go();

    await model.entities.PlayerEntity.create({
      gameId: gameMutation.data.gameId,
      userId,
    }).go();

    return {
      type: 4,
      data: {
        content: "game created",
      },
    };
  },
};
