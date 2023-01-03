import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const start: Command = {
  schema: undefined,
  handler: async (_, { game, channelId }) => {
    /**
     * ) count players
     * ) initialize game
     * ) start game
     */

    // ) count players
    if (!game) throw new Error("missing game");
    const playerCount = await model.entities.PlayerEntity.query
      .game_({ gameId: game.gameId })
      .go()
      .then(({ data }) => data.length);

    if (playerCount < 2) {
      return genericResponse("not enough players");
    }

    // todo: "too many players"

    // ) initialize game
    const map = JSON.parse(game.map) as { type: string }[][];
    const mapCoords = map.map((row, iRow) =>
      row.map((col, iCol) => ({
        ...col,
        coords: {
          x: iCol,
          y: iRow,
        },
      }))
    );
    const mapCoordsFlat = mapCoords.reduce((a, c) => {
      return [...a, ...c];
    }, []);

    const terrains = mapCoordsFlat.filter((e) => e.type === "terrain");
    const harbors = mapCoordsFlat.filter((e) => e.type === "harbor");

    // todo: terrain, chit, harbor have a specific ratio based on board size

    await Promise.all([
      ...terrains.map(({ coords: { x, y } }) => {
        model.entities.TerrainEntity.create({
          gameId: game.gameId,
          terrain: ["pasture", "fields", "mountains", "hills", "forest"][
            Math.floor(Math.random() * 5)
          ] as "pasture" | "fields" | "mountains" | "hills" | "forest",
          x,
          y,
        }).go();
      }),
      ...terrains.map(({ coords: { x, y } }) => {
        model.entities.ChitEntity.create({
          gameId: game.gameId,
          value: 1,
          x,
          y,
        }).go();
      }),
      ...harbors.map(({ coords: { x, y } }) => {
        model.entities.HarborEntity.create({
          gameId: game.gameId,
          resource: "brick",
          ratio: "2:1",
          x,
          y,
        }).go();
      }),
    ]);

    // ) start game
    await model.entities.GameEntity.update({
      channelId,
      gameId: game.gameId,
    })
      .set({ started: true })
      .go();

    return genericResponse("game started");
  },
};
