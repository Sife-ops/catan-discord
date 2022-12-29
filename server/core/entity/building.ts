import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const BuildingEntity = new Entity(
  {
    indexes: {
      building: {
        pk: {
          field: "pk",
          composite: ["buildingId"],
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

      game_player_: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["gameId", "userId"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["x", "y"],
        },
      },
    },

    model: {
      version: "1",
      entity: "Building",
      service: "catan-discord",
    },

    attributes: {
      buildingId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      gameId: {
        type: "string",
        required: true,
      },

      userId: {
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

      building: {
        type: ["settlement", "city"],
        required: true,
      },
    },
  },
  Dynamo.Configuration
);

export type BuildingEntityType = EntityItem<typeof BuildingEntity>;
