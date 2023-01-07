import * as subcommands from "./subcommands";
import { genericResponse } from "@catan-discord/bot/common";
import { runner, Command } from "@catan-discord/bot/runner";

export const game: Command = {
  schema: undefined,
  handler: async (body, ctx) => {
    const subcommandName = ctx.commandNames[1];

    if (["add", "remove", "start", "cancel"].includes(subcommandName)) {
      if (!ctx.game) {
        return genericResponse("game does not exist");
      } else if (ctx.game.userId !== ctx.userId) {
        return genericResponse("you are not the organizer");
      } else if (
        ["add", "remove", "start"].includes(subcommandName) &&
        ctx.game.started
      ) {
        return genericResponse("game already started");
      }
    }

    return await runner(subcommands, subcommandName, body, ctx);
  },
};
