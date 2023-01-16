import { genericResponse } from "@catan-discord/bot/common";
import { Command } from "../runner";

export const foo: Command = {
  handler: async () => {
    return genericResponse("bar");
  },
};
