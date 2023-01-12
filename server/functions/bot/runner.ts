import { GameCollection } from "@catan-discord/core/model";
import { OptionSchema } from "./common";
import { z } from "zod";

export interface CtxCfg {
  body: any;
  channelId: string;
  env: {
    PUBLIC_KEY: string;
    ONBOARD_QUEUE: string;
    WEB_URL: string;
  };
  flatOptions: OptionSchema[][];
  gameCollection: GameCollection | undefined;
  userId: string;
}

export class Ctx {
  private ctxCfg;
  body;
  channelId;
  env;
  flatOptions;
  userId;

  constructor(c: CtxCfg) {
    this.ctxCfg = c;
    this.body = c.body;
    this.channelId = c.channelId;
    this.env = c.env;
    this.flatOptions = c.flatOptions;
    this.userId = c.userId;
  }

  getGameCollection() {
    if (!this.ctxCfg.gameCollection) throw new Error("missing gameCollection");
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

export type CommandHandler = (ctx: Ctx) => Promise<any>;

export interface Command {
  schema?: z.AnyZodObject | undefined;
  handler: CommandHandler;
}

export const runner = async (
  commands: Record<string, Command>,
  commandName: string,
  ctx: Ctx
) => {
  const command = commands[commandName];

  if (command.schema) {
    command.schema.parse(ctx.body);
  }

  return command.handler(ctx);
};
