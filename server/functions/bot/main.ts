import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import * as commands from "./commands";
import AWS from "aws-sdk";
import nacl from "tweetnacl";
import { envSchema, eventSchema, bodySchema, genericResponse } from "./common";
import { model } from "@catan-discord/core/model";
import { runner, Ctx } from "@catan-discord/bot/runner";

// todo: add to ctx?
const sqs = new AWS.SQS();

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
        // todo: move to constructor?
        const gameCollection = await model.entities.GameEntity.query
          .channel({ channelId: parsedBody.channel_id })
          .where(({ winner }, { notExists }) => notExists(winner))
          .go()
          .then(({ data }) => data[0])
          .then((game) => {
            if (!game) return undefined;
            return model.collections
              .game({ gameId: game.gameId })
              .go()
              .then((e) => e.data);
          });

        const ctx = new Ctx({
          body,
          channelId: parsedBody.channel_id,
          env: parsedEnv,
          gameCollection,
          userId: parsedBody.member.user.id,
        });

        const commandName = ctx.getCommandName(0);
        if (!["game"].includes(commandName)) {
          try {
            const { started, playerIndex } = ctx.getGame();
            if (!started) throw new Error("game not started");
            if (ctx.getUserPlayer().playerIndex !== playerIndex) {
              throw new Error("not your turn");
            }
            if (ctx.getRound() < 2 && !["place"].includes(commandName)) {
              throw new Error("not allowed");
            }
          } catch (e: any) {
            return genericResponse(e.message);
          }
        }

        const [_, run] = await Promise.all([
          sqs
            .sendMessage({
              QueueUrl: parsedEnv.ONBOARD_QUEUE,
              MessageBody: JSON.stringify(parsedBody.member.user),
            })
            .promise(),
          runner(commands, commandName, ctx),
        ]);

        return run;
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
