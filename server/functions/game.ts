import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import { model } from "@catan-discord/core/model";
import { z } from "zod";

const eventSchema = z.object({
  body: z.string(),
});

const bodySchema = z.object({
  gameId: z.string(),
});

const fn = (o: { ok: boolean; data?: any }) => {
  return {
    statusCode: 200,
    body: JSON.stringify({ ...o }),
  };
};

export const handler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const parsedBody = bodySchema.parse(
      JSON.parse(eventSchema.parse(event).body)
    );

    const { data: gameCollection } = await model.collections
      .game({ gameId: parsedBody.gameId })
      .go();

    const users = await Promise.all(
      gameCollection.PlayerEntity.map((player) =>
        model.entities.UserEntity.get({
          userId: player.userId,
        }).go()
      )
    );

    return fn({
      ok: true,
      data: {
        gameCollection,
        users
      },
    });
  } catch (e) {
    return fn({ ok: false });
  }
};
