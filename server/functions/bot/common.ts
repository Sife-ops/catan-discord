import { z } from "zod";

export const envSchema = z.object({
  PUBLIC_KEY: z.string(),
  ONBOARD_QUEUE: z.string(),
});

export const memberSchema = z.object({
  user: z.object({
    id: z.string(),
  }),
});

export const optionSchema = z.object({
  name: z.string(),
  type: z.number(),
  value: z.string().optional(),
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
