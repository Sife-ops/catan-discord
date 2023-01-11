import * as Entity from "@catan-discord/core/entity";
import { z } from "zod";
import { OptionSchema } from "./common";

export interface CtxCfg {
  channelId: string;
  env: {
    PUBLIC_KEY: string;
    ONBOARD_QUEUE: string;
    WEB_URL: string;
  };
  flatOptions: OptionSchema[][];
  gameCollection:
    | {
        BuildingEntity: Entity.BuildingEntityType[];
        ChitEntity: Entity.ChitEntityType[];
        GameEntity: Entity.GameEntityType[];
        HarborEntity: Entity.HarborEntityType[];
        PlayerEntity: Entity.PlayerEntityType[];
        RoadEntity: Entity.RoadEntityType[];
        TerrainEntity: Entity.TerrainEntityType[];
      }
    | undefined;
  userId: string;
}

export class Ctx {
  private ctxCfg;
  channelId;
  env;
  flatOptions;
  userId;

  constructor(c: CtxCfg) {
    this.ctxCfg = c;
    this.channelId = c.channelId;
    this.env = c.env;
    this.flatOptions = c.flatOptions;
    this.userId = c.userId;
  }

  private missingGameCollectionErr = Error("missing gameCollection");

  getGameCollection() {
    if (!this.ctxCfg.gameCollection) throw this.missingGameCollectionErr;
    return this.ctxCfg.gameCollection;
  }

  getGame() {
    return this.getGameCollection().GameEntity[0];
  }

  hasGame() {
    return !!this.ctxCfg.gameCollection;
  }

  getMap() {
    // todo: explicit any
    return JSON.parse(this.getGame().map) as any[][];
  }

  getFlatMap() {
    return this.getMap()
      .map((row, iRow) =>
        row.map((col, iCol) => ({
          ...col,
          x: iCol,
          y: iRow,
        }))
      )
      .reduce((a, c) => {
        return [...a, ...c];
      }, []);
  }
}

export type CommandHandler = (body: any, ctx: Ctx) => Promise<any>;

export interface Command {
  schema?: z.AnyZodObject | undefined;
  handler: CommandHandler;
}

export const runner = async (
  commands: Record<string, Command>,
  commandName: string,
  body: any,
  ctx: Ctx
) => {
  const command = commands[commandName];

  if (command.schema) {
    command.schema.parse(body);
  }

  return command.handler(body, ctx);
};
