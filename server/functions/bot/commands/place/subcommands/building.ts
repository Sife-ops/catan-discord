import { Command } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";
import { genericResponse, Coords, compareXY } from "@catan-discord/bot/common";

export const building: Command = {
  handler: async (ctx) => {
    if (
      ctx.getRound() < 2 &&
      ctx.getPlayerBuildings().length > ctx.getRound()
    ) {
      throw new Error("todo");
    }

    const terrainCoords = ctx.getTypeIndexOrThrow<Coords>(
      "terrain",
      ctx.getOptionValue("index") as number
    );

    if (ctx.hasBuilding(terrainCoords)) {
      throw new Error("todo");
    }

    await model.entities.BuildingEntity.create({
      ...terrainCoords,
      building: ctx.getOptionValue("building") as "settlement" | "city",
      gameId: ctx.getGame().gameId,
      playerId: ctx.userId,
    }).go();

    return genericResponse("place settlement");
  },
};
