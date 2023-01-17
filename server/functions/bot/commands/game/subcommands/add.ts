import {
  genericResponse,
  getResolvedUser,
  usersSchema,
} from "@catan-discord/bot/common";

import AWS from "aws-sdk";
import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";
import { z } from "zod";

const sqs = new AWS.SQS();

const schema = z.object({
  data: z.object({
    resolved: z.object({
      users: usersSchema,
    }),
  }),
});
type Schema = z.infer<typeof schema>;

export const add: Command = {
  schema,
  handler: async (ctx) => {
    const body: Schema = ctx.body;
    const { gameId } = ctx.getGame();
    const userId = ctx.getOptionValue("player") as string;

    // todo: refer to ctx.gameCollection
    const player = await model.entities.PlayerEntity.query
      .game_({ gameId, userId })
      .go()
      .then(({ data }) => data[0]);
    if (player) {
      return genericResponse("already added");
    }

    await Promise.all([
      sqs
        .sendMessage({
          QueueUrl: ctx.env.ONBOARD_QUEUE,
          MessageBody: JSON.stringify(
            getResolvedUser(body.data.resolved.users, userId)
          ),
        })
        .promise(),

      model.entities.PlayerEntity.create({ gameId, userId }).go(),
    ]);

    return genericResponse("added player");
  },
};
