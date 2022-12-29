import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";

export const PlayerEntity = new Entity(
  {
    indexes: {
      player: {
        pk: {
          field: "pk",
          composite: ["userId"],
        },
        sk: {
          field: "sk",
          composite: ["gameId"],
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
          composite: ["userId"],
        },
      },
    },

    model: {
      version: "1",
      entity: "Player",
      service: "catan-discord",
    },

    attributes: {
      userId: {
        type: "string",
        required: true,
      },

      gameId: {
        type: "string",
        required: true,
      },
    },
  },
  Dynamo.Configuration
);

export type PlayerEntityType = EntityItem<typeof PlayerEntity>;
