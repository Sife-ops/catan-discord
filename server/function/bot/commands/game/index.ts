import * as subcommands from "./subcommands";
import { runner, Command } from "@catan-discord/bot/runner";

export const game: Command = {
  schema: undefined,
  handler: async (body, ctx) => {
    return await runner(subcommands, body.data.options[0].name, body, ctx);
  },
};
