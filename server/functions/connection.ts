import { APIGatewayProxyHandler } from "aws-lambda";
import { model } from "@catan-discord/core/model";

export const handler: APIGatewayProxyHandler = async (event) => {
  switch (event.requestContext.routeKey!) {
    case "$connect":
      await model.entities.ConnectionEntity.create({
        connectionId: event.requestContext.connectionId!,
      }).go();
      return { statusCode: 200, body: "Connected" };

    case "$disconnect":
      await model.entities.ConnectionEntity.remove({
        connectionId: event.requestContext.connectionId!,
      }).go();
      return { statusCode: 200, body: "Disconnected" };

    default:
      return { statusCode: 500, body: "Unknown route" };
  }
};
