import * as subcommands from "./subcommands";
import { optionSchema, genericResponse } from "@catan-discord/bot/common";
import { runner, Command } from "@catan-discord/bot/runner";
import { z } from "zod";

const schema = z.object({
  data: z.object({
    options: z.array(optionSchema),
  }),
});
type Schema = z.infer<typeof schema>;

export const game: Command = {
  schema,
  handler: async (body: Schema, ctx) => {
    const subcommandName = body.data.options[0].name;

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
