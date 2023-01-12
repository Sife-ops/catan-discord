import {
  getOptionValue,
  getNestedOptions,
  genericResponse,
} from "@catan-discord/bot/common";

import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const create: Command = {
  handler: async (ctx) => {
    const userId = ctx.userId;
    const channelId = ctx.channelId;

    /**
     * 1) one game per channel
     * 2) map must exist
     * 3) create game
     */

    // 1) one game per channel
    if (ctx.hasGame()) {
      return genericResponse("game already exists");
    }

    // 2) map must exist
    const mapId = getOptionValue(
      getNestedOptions(ctx.body.data.options, "create"),
      "map"
    );

    const map = await model.entities.MapEntity.query
      .map({ mapId })
      .go()
      .then(({ data }) => data[0]?.data);

    if (!map) {
      return genericResponse("map does not exist");
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

    return genericResponse("game created");
  },
};
