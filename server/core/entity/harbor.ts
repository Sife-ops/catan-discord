import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const HarborEntity = new Entity(
  {
    indexes: {
      harbor: {
        pk: {
          field: "pk",
          composite: ["harborId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },

      game_: {
        collection: "game",
        index: "gsi1",
        pk: {
          field: "gsi1pk",
          composite: ["gameId"],
        },
        sk: {
          field: "gsi1sk",
          composite: ["x", "y"],
        },
      },
    },

    model: {
      version: "1",
      entity: "Harbor",
      service: "catan-discord",
    },

    attributes: {
      harborId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      gameId: {
        type: "string",
        required: true,
      },

      x: {
        type: "number",
        required: true,
      },

      y: {
        type: "number",
        required: true,
      },

      resource: {
        type: ["wool", "wheat", "ore", "brick", "lumber"] as const,
        required: true,
      },

      ratio: {
        type: "string",
        required: true,
      },
    },
  },
  Dynamo.Configuration
);

export type HarborEntityType = EntityItem<typeof HarborEntity>;
