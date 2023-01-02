import { z } from "zod";

export const runner = async (
  commands: Record<
    string,
    {
      schema: z.AnyZodObject | undefined;
      handler: (body: any) => Promise<any>;
    }
  >,
  commandName: string,
  body: any
) => {
  const command = commands[commandName];

  if (command.schema) {
    command.schema.parse(body);
  }

  return command.handler(body);
};
