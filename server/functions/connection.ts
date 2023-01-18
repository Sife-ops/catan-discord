import { APIGatewayProxyHandler } from "aws-lambda";
import { model } from "@catan-discord/core/model";

export const handler: APIGatewayProxyHandler = async (event) => {
  switch (event.requestContext.routeKey!) {
    case "$connect": {
      return { statusCode: 200, body: "connected" };
    }

    case "$disconnect": {
      await model.entities.ConnectionEntity.remove({
        connectionId: event.requestContext.connectionId!,
      }).go();

      return { statusCode: 200, body: "disconnected" };
    }

    case "$default": {
      const parsedBody = JSON.parse(event.body!);

      switch (parsedBody.action) {
        case "sendGameId": {
          await model.entities.ConnectionEntity.create({
            connectionId: event.requestContext.connectionId!,
            gameId: parsedBody.gameId,
          }).go();

          return { statusCode: 200, body: "connected to game" };
        }

        default:
          return { statusCode: 404, body: "unknown action" };
      }
    }

    default: {
      return { statusCode: 404, body: "unknown route" };
    }
  }
};
