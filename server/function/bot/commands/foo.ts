import { z } from "zod";

// const a = z.object({
//   key: z.string(),
// });

// type A = z.infer<typeof a>;

export const foo = {
  schema: undefined,
  handler: async () => {
    return {
      type: 4,
      data: {
        embeds: [
          {
            title: "foo",
            description: "foo",
            color: 0x00ffff,
          },
        ],
      },
    };
  },
};
