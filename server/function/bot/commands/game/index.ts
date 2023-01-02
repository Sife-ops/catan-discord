import * as subcommands from "./subcommands";
import { runner } from "@catan-discord/bot/runner";

export const game = {
  schema: undefined,
  handler: async (body: any) => {
    return await runner(subcommands, body.data.options[0].name, body);
  },
};
