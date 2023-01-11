import * as subcommands from "./subcommands";
import { genericResponse } from "@catan-discord/bot/common";
import { runner, Command } from "@catan-discord/bot/runner";

export const game: Command = {
  handler: async (body, ctx) => {
    const subcommandName = ctx.flatOptions[1][0].name;

    if (["add", "remove", "start", "cancel"].includes(subcommandName)) {
      if (!ctx.hasGame()) {
        return genericResponse("game does not exist");
      } else if (ctx.getGame().userId !== ctx.userId) {
        return genericResponse("you are not the organizer");
      } else if (
        ["add", "remove", "start"].includes(subcommandName) &&
        ctx.getGame().started
      ) {
        return genericResponse("game already started");
      }
    }

    return await runner(subcommands, subcommandName, body, ctx);
  },
};
