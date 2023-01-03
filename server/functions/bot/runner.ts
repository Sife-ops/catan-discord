import { GameEntityType } from "@catan-discord/core/entity/game";
import { z } from "zod";

export interface CommandCtx {
  game: GameEntityType | undefined;
  userId: string;
  env: {
    PUBLIC_KEY: string;
    ONBOARD_QUEUE: string;
  };
  channelId: string;
}

export type CommandHandler = (body: any, ctx: CommandCtx) => Promise<any>;

export interface Command {
  schema: z.AnyZodObject | undefined;
  handler: CommandHandler;
}

export const runner = async (
  commands: Record<string, Command>,
  commandName: string,
  body: any,
  ctx: CommandCtx
) => {
  const command = commands[commandName];

  if (command.schema) {
    command.schema.parse(body);
  }

  return command.handler(body, ctx);
};
