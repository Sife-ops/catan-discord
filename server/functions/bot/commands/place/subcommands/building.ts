import { Coords, genericResponse } from "@catan-discord/bot/common";
import { CommandHandler } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const building =
  (building: "settlement" | "city"): CommandHandler =>
  async (ctx) => {
    if (
      ctx.getRound() < 2 &&
      ctx.getPlayerBuildings().length > ctx.getRound()
    ) {
      return genericResponse("illegal move");
    }

    const terrainCoords = ctx.getMapIndexOrThrow<Coords>(
      "terrain",
      (ctx.getOptionValue("ind") as number) - 1 // todo: 0 start index doesn't work
    );

    if (ctx.hasBuilding(terrainCoords)) {
      return genericResponse("illegal move");
    }

    await model.entities.BuildingEntity.create({
      ...terrainCoords,
      building,
      gameId: ctx.getGame().gameId,
      playerId: ctx.userId,
    }).go();

    return genericResponse(`place ${building}`);
  };
