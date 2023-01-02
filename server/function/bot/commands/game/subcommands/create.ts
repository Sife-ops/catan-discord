import {
  getOptionValue,
  getNestedOptions,
  optionSchema,
} from "@catan-discord/bot/common";

import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";
import { z } from "zod";

const schema = z.object({
  channel_id: z.string(),
  data: z.object({
    options: z.array(optionSchema),
  }),
});
type Schema = z.infer<typeof schema>;

export const create: Command = {
  schema,
  handler: async (body: Schema, { userId }) => {
    /**
     * 1) map must exist
     * 2) create game
     */

    // 1) map must exist
    const mapId = getOptionValue(
      getNestedOptions(body.data.options, "create"),
      "map"
    );

    const map = await model.entities.MapEntity.query
      .map({ mapId })
      .go()
      .then(({ data }) => data[0]);

    if (!map) {
      return {
        type: 4,
        data: {
          content: "map does not exist",
        },
      };
    }

    // 2) create game
    const gameMutation = await model.entities.GameEntity.create({
      channelId: body.channel_id,
      map: map.data,
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
