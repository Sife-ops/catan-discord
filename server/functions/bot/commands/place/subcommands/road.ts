import { Command } from "@catan-discord/bot/runner";
import { compareXY, Coords, genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const road: Command = {
  handler: async (ctx) => {
    const from = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind1") as number) - 1
    );
    const to = ctx.getMapIndexOrThrow<Coords>(
      "intersection",
      (ctx.getOptionValue("ind2") as number) - 1
    );

    if (
      // exceeds first-two-round limit
      (ctx.getRound() < 2 && ctx.getPlayerRoads().length > ctx.getRound()) ||
      // road not connected to player's building or road
      ![
        ...ctx.getPlayerBuildings(),
        ...ctx.getPlayerRoads().reduce<Coords[]>((a, c) => {
          return [...a, { ...c.from }, { ...c.to }];
        }, []),
      ].some((coords) => !![from, to].find((c) => compareXY(c, coords))) ||
      // coords not adjacent
      !ctx
        .getMapAdjacent("intersection", from)
        .find((adj) => compareXY(adj, to)) ||
      // road already exists
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
