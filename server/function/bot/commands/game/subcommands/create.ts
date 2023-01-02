import {
  getOptionValue,
  getNestedOptions,
  optionSchema,
  memberSchema,
} from "@catan-discord/bot/commands/common";

import { model } from "@catan-discord/core/model";
import { z } from "zod";

const schema = z.object({
  channel_id: z.string(),
  member: memberSchema,
  data: z.object({
    options: z.array(optionSchema),
  }),
});
type Schema = z.infer<typeof schema>;

export const create = {
  schema,
  handler: async (body: Schema) => {
    /**
     * 1) only one active game per channel_id
     * 2) map must exist
     * 3) create game
     */

    // 1) only one active game per channel_id
    const gameQuery = await model.entities.GameEntity.query
      .channel_({ channelId: body.channel_id })
      .where(({ winner }, { notExists }) => notExists(winner))
      .go();

    if (gameQuery.data.length > 0) {
      return {
        type: 4,
        data: {
          content: "unfinished game",
        },
      };
    }

    // 2) map must exist
    const mapId = getOptionValue(
      getNestedOptions(body.data.options, "create"),
      "map"
    );

    const mapQuery = await model.entities.MapEntity.query.map({ mapId }).go();

    if (mapQuery.data.length < 1) {
      return {
        type: 4,
        data: {
          content: "map doesn't exist",
        },
      };
    }

    // 3) create game
    const gameMutation = await model.entities.GameEntity.create({
      channelId: body.channel_id,
      organizer: body.member.user.id,
      mapId,
    }).go();

    await model.entities.PlayerEntity.create({
      gameId: gameMutation.data.gameId,
      userId: body.member.user.id,
    }).go();

    return {
      type: 4,
      data: {
        content: "game created",
      },
    };
  },
};
