import { Dynamo } from "../dynamo";
import { Entity, EntityItem } from "electrodb";
//

export const ConnectionEntity = new Entity(
  {
    indexes: {
      connection: {
        pk: {
          field: "pk",
          composite: ["connectionId"],
        },
        sk: {
          field: "sk",
          composite: [],
        },
      },
    },

    attributes: {
      connectionId: {
        type: "string",
        required: true,
      },
    },

    model: {
      version: "1",
      entity: "Connection",
      service: "catan-discord",
    },
  },
  Dynamo.Configuration
);

export type ConnectionEntityType = EntityItem<typeof ConnectionEntity>;
