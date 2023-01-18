import { APIGatewayProxyHandler } from "aws-lambda";
import { model } from "@catan-discord/core/model";

export const handler: APIGatewayProxyHandler = async (event) => {
  switch (event.requestContext.routeKey!) {
    case "$connect": {
      // console.log("RECONNECTING", event);
      return { statusCode: 200, body: "connected" };
    }

    case "$disconnect": {
      await model.entities.ConnectionEntity.delete({
        connectionId: event.requestContext.connectionId!,
      }).go();

      return { statusCode: 200, body: "disconnected" };
    }

    case "$default": {
      const parsedBody = JSON.parse(event.body!);

      switch (parsedBody.action) {
        case "gameConnection": {
          await model.entities.ConnectionEntity.query
            .game_({
              clientId: parsedBody.data.clientId,
              gameId: parsedBody.data.gameId,
            })
            .go()
            .then((e) => e.data[0])
            .then((connection) =>
              !!connection
                ? model.entities.ConnectionEntity.delete({
                    connectionId: connection.connectionId,
                  }).go()
                : undefined
            );

          await model.entities.ConnectionEntity.create({
            clientId: parsedBody.data.clientId,
            connectionId: event.requestContext.connectionId!,
            gameId: parsedBody.data.gameId,
          }).go();

          return { statusCode: 200, body: "connected to game" };
        }

        default: {
          return { statusCode: 404, body: "unknown action" };
        }
      }
    }

    default: {
      return { statusCode: 404, body: "unknown route" };
    }
  }
};
