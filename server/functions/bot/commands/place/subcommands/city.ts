import { Command } from "@catan-discord/bot/runner";
import { building } from "./building";

export const city: Command = {
  handler: building("city"),
};
