import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const TerrainEntity = new Entity(
  {
    indexes: {
      terrain: {
        pk: {
          field: "pk",
          composite: ["terrainId"],
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
      entity: "Terrain",
      service: "catan-discord",
    },

    attributes: {
      terrainId: {
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

      terrain: {
        type: ["pasture", "fields", "mountains", "hills", "forest"] as const,
        required: true,
      },
    },
  },
  Dynamo.Configuration
);

export type TerrainEntityType = EntityItem<typeof TerrainEntity>;
