import { z } from "zod";

export const envSchema = z.object({
  PUBLIC_KEY: z.string(),
  ONBOARD_QUEUE: z.string(),
  WEB_URL: z.string(),
});

export const eventSchema = z.object({
  body: z.string(),
  headers: z.object({
    "x-signature-ed25519": z.string(),
    "x-signature-timestamp": z.string(),
  }),
});

/*
 * body
 */

export const memberSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
});

export const optionSchema = z.object({
  name: z.string(),
  type: z.number(),
  value: z.string().optional(),
  options: z.array(z.any()).optional(),
});
type OptionSchema = z.infer<typeof optionSchema>;

export const usersSchema = z.record(
  z.object({
    avatar: z.string(),
    discriminator: z.string(),
    id: z.string(),
    username: z.string(),
  })
);
type UsersSchema = z.infer<typeof usersSchema>;

export const dataSchema = z.object({
  name: z.string(),
  options: z.array(optionSchema),
});
type DataSchema = z.infer<typeof dataSchema>;

export const bodySchema = z.object({
  channel_id: z.string(),
  data: dataSchema,
  member: memberSchema,
  type: z.number(),
});

/*
 * functions
 */

export const getCommandNames = (data: DataSchema): string[] => {
  let cmds: string[] = [data.name];
  let options = data.options;
  while (true) {
    if (options && options.length > 0) {
      const firstOption = optionSchema.parse(options[0]);
      if (firstOption.options) {
        cmds = [...cmds, firstOption.name];
        options = firstOption.options;
        continue;
      }
      break;
    } else {
      break;
    }
  }
  return cmds;
};

export const genericResponse = (content: string) => {
  return {
    type: 4,
    data: {
      content,
    },
  };
};

// todo: sus
export const getResolvedUser = (users: UsersSchema, userId: string) => {
  const user = users[userId];
  if (!user) throw new Error("missing user");
  return user;
};

export const getNestedOptions = (
  options: Array<OptionSchema & { options?: OptionSchema[] }>,
  optionName: string
): OptionSchema[] => {
  const option = options.find((e) => e.name === optionName);
  if (!option || !option.options) throw new Error("missing option");
  return option.options;
};

export const getOptionValue = (
  options: OptionSchema[],
  optionName: string
): string => {
  const option = options.find((e) => e.name === optionName);
  if (!option || !option.value) throw new Error("missing option");
  return option.value;
};
