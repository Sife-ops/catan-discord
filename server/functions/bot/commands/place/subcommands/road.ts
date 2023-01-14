import { Command } from "@catan-discord/bot/runner";
import { Coords, genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const road: Command = {
  handler: async (ctx) => {
    if (
      ctx.getRound() < 2 && //
      ctx.getPlayerRoads().length > ctx.getRound()
    ) {
      throw new Error("todo");
    }

    const from = ctx.getTypeIndexOrThrow<Coords>(
      "intersection",
      ctx.getOptionValue("fromIndex") as number
    );
    const to = ctx.getTypeIndexOrThrow<Coords>(
      "intersection",
      ctx.getOptionValue("toIndex") as number
    );

    if (ctx.hasRoad({ from, to })) {
      throw new Error("todo");
    }

    await model.entities.RoadEntity.create({
      x1: from.x,
      y1: from.y,
      x2: to.x,
      y2: to.y,
      gameId: ctx.getGame().gameId,
      playerId: ctx.userId,
    }).go();

    return genericResponse("place road");
  },
};
