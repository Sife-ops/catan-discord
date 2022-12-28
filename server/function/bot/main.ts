import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";

import * as commands from "./commands";
import nacl from "tweetnacl";
import { runner } from "./runner";
import { z } from "zod";

const envSchema = z.object({
  PUBLIC_KEY: z.string(),
});

const eventSchema = z.object({
  body: z.string(),
  headers: z.object({
    "x-signature-ed25519": z.string(),
    "x-signature-timestamp": z.string(),
  }),
});

const bodySchema = z.object({
  type: z.number(),
  data: z.object({
    name: z.string(),
  }),
});

export const handler: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const parsedEnv = envSchema.parse(process.env);
    const parsedEvent = eventSchema.parse(event);
    const parsedBody = bodySchema.parse(JSON.parse(parsedEvent.body));

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
        return await runner(commands, parsedBody.data.name, parsedBody);
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
