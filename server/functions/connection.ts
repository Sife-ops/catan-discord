import { APIGatewayProxyHandler } from "aws-lambda";
import { model } from "@catan-discord/core/model";

export const handler: APIGatewayProxyHandler = async (event) => {
  await model.entities.ConnectionEntity.create({
    connectionId: event.requestContext.connectionId!,
  }).go();

  return { statusCode: 200, body: "Connected" };
};
