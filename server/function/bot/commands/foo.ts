import { z } from "zod";

// const a = z.object({
//   key: z.string(),
// });

// type A = z.infer<typeof a>;

export const foo = {
  schema: undefined,
  handler: async (event: any) => {
    return {
      type: 4,
      data: {
        content: "foo",
        embeds: [
          {
            title: "foo",
            description: "foo",
            color: 0x00ffff,
            image: {
              // url: "https://cdn.discordapp.com/attachments/431086140972466177/1057296406450286653/erwrewqrewq.jpg",
              // url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Cat_August_2010-4.jpg",
              // url: "https://en.wikipedia.org/wiki/SVG#/media/File:SVG_Logo.svg",
              url: "https://dev.w3.org/SVG/tools/svgweb/samples/svg-files/410.svg",
            },
          },
        ],
      },
    };
  },
};
