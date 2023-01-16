import { Command } from "@catan-discord/bot/runner";
import { compareXY, Coords, genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const road: Command = {
  handler: async (ctx) => {
    if (
      ctx.getRound() < 2 && //
      ctx.getPlayerRoads().length > ctx.getRound()
    ) {
      return genericResponse("illegal move");
    }

    const from = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("fromIndex") as number) - 1
    );
    const to = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("toIndex") as number) - 1
    );

    if (
      !ctx
        .getMapAdjacent("intersection", from)
        .find((adj) => compareXY(adj, to)) ||
      ctx.hasRoad({ from, to })
    ) {
      return genericResponse("illegal move");
    }

    await model.entities.RoadEntity.create({
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      gameId: ctx.getGame().gameId,
      playerId: ctx.getUserId(),
    }).go();

    return genericResponse("place road");
  },
};
