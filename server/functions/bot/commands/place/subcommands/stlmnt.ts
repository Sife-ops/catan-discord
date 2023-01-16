import { Command } from "@catan-discord/bot/runner";
import { building } from "./building";

export const stlmnt: Command = {
  handler: building("settlement"),
};
