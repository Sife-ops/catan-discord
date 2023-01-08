import * as Entity from "@catan-discord/core/entity";
import { z } from "zod";
import { OptionSchema } from "./common";

export interface CommandCtx {
  channelId: string;
  env: {
    PUBLIC_KEY: string;
    ONBOARD_QUEUE: string;
    WEB_URL: string;
  };
  flatOptions: OptionSchema[][];
  game: Entity.GameEntityType | undefined;
  gameCollection:
    | {
        BuildingEntity: Entity.BuildingEntityType[];
        ChitEntity: Entity.ChitEntityType[];
        HarborEntity: Entity.HarborEntityType[];
        PlayerEntity: Entity.PlayerEntityType[];
        RoadEntity: Entity.RoadEntityType[];
        TerrainEntity: Entity.TerrainEntityType[];
      }
    | undefined;
  userId: string;
}

export type CommandHandler = (body: any, ctx: CommandCtx) => Promise<any>;

export interface Command {
  schema?: z.AnyZodObject | undefined;
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
