import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { model } from "@catan-discord/core/model";
import { z } from "zod";

const eventSchema = z.object({
  mapId: z.string(),
  data: z.string(),
});

export const handler = async (event: APIGatewayProxyEvent): Promise<void> => {
  const { data, mapId } = eventSchema.parse(event);

  await model.entities.MapEntity.create({
    mapId,
    data,
  }).go();
};
