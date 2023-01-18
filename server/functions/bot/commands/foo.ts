import { Command } from "../runner";
import { genericResponse } from "@catan-discord/bot/common";

export const foo: Command = {
  handler: async (ctx) => {
    return genericResponse("bar");
  },
};
