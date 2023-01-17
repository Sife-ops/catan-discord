import { Coords, genericResponse } from "@catan-discord/bot/common";
import { CommandHandler } from "@catan-discord/bot/runner";
import { model } from "@catan-discord/core/model";

export const building =
  (building: "settlement" | "city"): CommandHandler =>
  async (ctx) => {
    const coords = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind") as number) - 1 // todo: 0 start index doesn't work
    );

    // todo: connected to road (unless < 2 rounds), no adj building
    if (
      // exceeds first-two-round limit
      (ctx.getRound() < 2 &&
        ctx.getPlayerBuildings().length > ctx.getRound()) ||
      // building already exists
      ctx.hasBuilding(coords)
    ) {
      return genericResponse("illegal move");
    }

    await model.entities.BuildingEntity.create({
      ...coords,
      building,
      gameId: ctx.getGame().gameId,
      playerId: ctx.getUserId(),
    }).go();

    return genericResponse(`place ${building}`);
  };
