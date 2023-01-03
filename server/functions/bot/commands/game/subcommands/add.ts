import {
  genericResponse,
  getNestedOptions,
  getOptionValue,
  getResolvedUser,
  optionSchema,
  usersSchema,
} from "@catan-discord/bot/common";

import AWS from "aws-sdk";
import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";
import { z } from "zod";

const sqs = new AWS.SQS();

const schema = z.object({
  data: z.object({
    options: z.array(optionSchema),
    resolved: z.object({
      users: usersSchema,
    }),
  }),
});
type Schema = z.infer<typeof schema>;

export const add: Command = {
  schema,
  handler: async (body: Schema, ctx) => {
    const userId = getOptionValue(
      getNestedOptions(body.data.options, "add"),
      "player"
    );

    if (!ctx.game) throw new Error("missing game");
    const player = await model.entities.PlayerEntity.query
      .game_({
        gameId: ctx.game.gameId,
        userId,
      })
      .go()
      .then(({ data }) => data[0]);
    if (player) {
      return genericResponse("already added");
    }

    await sqs
      .sendMessage({
        QueueUrl: ctx.env.ONBOARD_QUEUE,
        MessageBody: JSON.stringify(
          getResolvedUser(body.data.resolved.users, userId)
        ),
      })
      .promise();

    await model.entities.PlayerEntity.create({
      gameId: ctx.game.gameId,
      userId,
    }).go();

    return genericResponse("added player");
  },
};
