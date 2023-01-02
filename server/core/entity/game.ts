import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
import { ulid } from "ulid";

export const GameEntity = new Entity(
  {
    indexes: {
      game: {
        pk: {
          field: "pk",
          composite: ["gameId"],
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
          composite: [],
        },
      },

      channel_: {
        index: "gsi2",
        pk: {
          field: "gsi2pk",
          composite: ["channelId"],
        },
        sk: {
          field: "gsi2sk",
          composite: ["gameId"],
        },
      },
    },

    model: {
      version: "1",
      entity: "Game",
      service: "catan-discord",
    },

    attributes: {
      gameId: {
        type: "string",
        required: true,
        default: () => ulid(),
      },

      channelId: {
        type: "string",
        required: true,
      },

      mapId: {
        type: "string",
        required: true,
      },

      organizer: {
        type: "string",
        required: true,
      },

      winner: {
        type: "string",
        required: false,
      },
    },
  },
  Dynamo.Configuration
);

export type GameEntityType = EntityItem<typeof GameEntity>;
