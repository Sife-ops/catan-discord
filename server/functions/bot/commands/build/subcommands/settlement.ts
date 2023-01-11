import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";

export const settlement: Command = {
  handler: async (body, { userId, game, channelId }) => {
    return genericResponse("settlement");
  },
};
