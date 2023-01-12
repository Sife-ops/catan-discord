import * as subcommands from "./subcommands";
import { runner, Command } from "@catan-discord/bot/runner";

export const build: Command = {
  handler: async (ctx) => {
    // const subcommandName = ctx.getFlatOptions()[1][0].name;

    return await runner(subcommands, ctx.getFlatOptions()[1][0].name, ctx);
  },
};
