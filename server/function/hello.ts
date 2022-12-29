import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { model } from "@catan-discord/core/model";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  await model.entities.MapEntity.create({
    mapId: "a",
    data: "b",
  }).go();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Go Serverless v3.0! Your function executed successfully!",
        input: event,
      },
      null,
      2
    ),
  };
};
