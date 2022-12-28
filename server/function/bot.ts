import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Handler,
} from "aws-lambda";
import { z } from "zod";
import nacl from "tweetnacl";

const envSchema = z.object({
  PUBLIC_KEY: z.string(),
});

const eventSchema = z.object({
  body: z.string(),
});

const bodySchema = z.object({
  type: z.number(),
});

export const main: Handler<
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2
> = async (event) => {
  try {
    const parsedEnv = envSchema.parse(process.env);
    const parsedEvent = eventSchema.parse(event);
    const body = bodySchema.parse(JSON.parse(parsedEvent.body));

    switch (body.type) {
      case 1: {
        const signature = event.headers["x-signature-ed25519"];
        const timestamp = event.headers["x-signature-timestamp"];

        const verified = nacl.sign.detached.verify(
          Buffer.from(timestamp + parsedEvent.body),
          Buffer.from(signature!, "hex"),
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
        return {
          type: 4,
          data: {
            embeds: [
              {
                title: "title",
                description: "desc",
                color: 0x00ffff,
              },
            ],
          },
        };
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
