import { genericResponse } from "@catan-discord/bot/common";

export const foo = {
  schema: undefined,
  handler: async () => {
    return genericResponse("bar");
  },
};
