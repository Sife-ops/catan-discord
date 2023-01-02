import { z } from "zod";

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
