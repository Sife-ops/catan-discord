import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import * as commands from "./commands";
import AWS from "aws-sdk";
import nacl from "tweetnacl";
import { memberSchema, envSchema } from "./common";
import { model } from "@catan-discord/core/model";
import { runner } from "@catan-discord/bot/runner";
import { z } from "zod";

// todo: add to ctx?
const sqs = new AWS.SQS();

const eventSchema = z.object({
  body: z.string(),
  headers: z.object({
    "x-signature-ed25519": z.string(),
    "x-signature-timestamp": z.string(),
  }),
});

const bodySchema = z.object({
  channel_id: z.string(),
  data: z.object({
    name: z.string(),
  }),
  member: memberSchema,
  type: z.number(),
});

export const handler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const parsedEnv = envSchema.parse(process.env);
    const parsedEvent = eventSchema.parse(event);
    const body = JSON.parse(parsedEvent.body);
    const parsedBody = bodySchema.parse(body);

    switch (parsedBody.type) {
      case 1: {
        const verified = nacl.sign.detached.verify(
          Buffer.from(
            parsedEvent.headers["x-signature-ed25519"] + parsedEvent.body
          ),
          Buffer.from(parsedEvent.headers["x-signature-timestamp"], "hex"),
          Buffer.from(parsedEnv.PUBLIC_KEY, "hex")
        );

        if (!verified) {
          throw new Error("verification failed");
        } else {
          return {
            statusCode: 200,
            body: parsedEvent.body,
          };
        }
      }

      case 2: {
        await sqs
          .sendMessage({
            QueueUrl: parsedEnv.ONBOARD_QUEUE,
            MessageBody: JSON.stringify(body.member.user),
          })
          .promise();

        return await runner(commands, parsedBody.data.name, body, {
          game: await model.entities.GameEntity.query
            .channel({ channelId: parsedBody.channel_id })
            .where(({ winner }, { notExists }) => notExists(winner))
            .go()
            .then(({ data }) => data[0]),
          userId: parsedBody.member.user.id,
          env: parsedEnv,
          channelId: parsedBody.channel_id,
        });
      }

      default: {
        throw new Error("unknown request type");
      }
    }
  } catch (e) {
    console.log(e);
    return {
      statusCode: 401,
    };
  }
};