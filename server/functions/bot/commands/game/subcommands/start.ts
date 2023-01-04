import { Command } from "@catan-discord/bot/runner";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";
import { randomNoRepeat } from "./common";

export const start: Command = {
  schema: undefined,
  handler: async (_, { game, channelId, env: { WEB_URL } }) => {
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
        x: iCol,
        y: iRow,
      }))
    );
    const mapCoordsFlat = mapCoords.reduce((a, c) => {
      return [...a, ...c];
    }, []);

    const terrains = mapCoordsFlat.filter((e) => e.type === "terrain");
    const harbors = mapCoordsFlat.filter((e) => e.type === "harbor");

    // todo: no chit on desert

    const deserts = Math.floor(terrains.length / 19);
    const primary = Math.floor(((terrains.length - deserts) * 2) / 9);
    const secondary = Math.floor((terrains.length - deserts) / 6);
    const remaining = terrains.length - deserts - primary * 3 - secondary * 2;

    const resources = [
      ...Array(deserts).fill("desert"),
      ...Array(primary).fill("pasture"),
      ...Array(primary).fill("forest"),
      ...Array(primary).fill("fields"),
      ...Array(secondary).fill("mountains"),
      ...Array(secondary).fill("hills"),
      ...Array(remaining)
        .fill(null)
        .map(() => {
          return ["pasture", "fields", "mountains", "hills", "forest"][
            Math.floor(Math.random() * 5)
          ];
        }),
    ];

    const chooser = randomNoRepeat(resources);

    await Promise.all([
      ...terrains.map(({ x, y }) => {
        model.entities.TerrainEntity.create({
          gameId: game.gameId,
          // @ts-ignore
          terrain: chooser(),
          x,
          y,
        }).go();
      }),
      ...terrains.map(({ x, y }) => {
        model.entities.ChitEntity.create({
          gameId: game.gameId,
          value: 1,
          x,
          y,
        }).go();
      }),
      ...harbors.map(({ x, y }) => {
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

    return {
      type: 4,
      data: {
        content: "game started",
        embeds: [
          {
            title: "game url",
            url: `https://${WEB_URL}/game/${game.gameId}`,
            color: 0xff0000,
          },
        ],
      },
    };
  },
};
