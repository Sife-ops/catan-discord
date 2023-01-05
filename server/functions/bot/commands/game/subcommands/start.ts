import { Command } from "@catan-discord/bot/runner";
import { TerrainEntityType } from "@catan-discord/core/entity";
import { genericResponse } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";
import { randomNoRepeat } from "./common";

export const start: Command = {
  schema: undefined,
  handler: async (_, { game, channelId, env: { WEB_URL } }) => {
    /**
     * ) count players
     * ) initialize game
     *   ) resources
     *   ) chits
     *   ) harbors
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
    // ) parse map data
    const map = JSON.parse(game.map) as { type: string }[][];
    const flatMap = map
      .map((row, iRow) =>
        row.map((col, iCol) => ({
          ...col,
          x: iCol,
          y: iRow,
        }))
      )
      .reduce((a, c) => {
        return [...a, ...c];
      }, []);

    const terrains = flatMap.filter((e) => e.type === "terrain");
    const harbors = flatMap.filter((e) => e.type === "harbor");

    // ) constants

    /**
     * this determines the ratio of resource tiles
     */

    const nDeserts = Math.floor(terrains.length / 19);
    const nNonDeserts = terrains.length - nDeserts;
    const nAbundantResource = Math.floor((nNonDeserts * 2) / 9);
    const nSparceResource = Math.floor(nNonDeserts / 6);
    const nRemainingResource =
      nNonDeserts - nAbundantResource * 3 - nSparceResource * 2;

    // ) resources
    const resourceValues = [
      ...Array(nDeserts).fill("desert"),
      ...Array(nAbundantResource).fill("pasture"),
      ...Array(nAbundantResource).fill("forest"),
      ...Array(nAbundantResource).fill("fields"),
      ...Array(nSparceResource).fill("mountains"),
      ...Array(nSparceResource).fill("hills"),
      ...Array(nRemainingResource)
        .fill(null)
        .map(() => {
          return ["pasture", "fields", "mountains", "hills", "forest"][
            Math.floor(Math.random() * 5)
          ];
        }),
    ];

    const resourceChooser = randomNoRepeat<string>(resourceValues);

    const resources = terrains.map(
      ({ x, y }): TerrainEntityType => ({
        gameId: game.gameId,
        // @ts-ignore
        terrain: resourceChooser(),
        x,
        y,
      })
    );

    // ) chits
    const nRareChit = nNonDeserts / 18;
    const nCommonChit = nNonDeserts / 9;

    let chitValues = [
      ...Array(Math.floor(nRareChit)).fill(2),
      ...Array(Math.floor(nCommonChit)).fill(3),
      ...Array(Math.floor(nCommonChit)).fill(4),
      ...Array(Math.floor(nCommonChit)).fill(5),
      ...Array(Math.floor(nCommonChit)).fill(6),
      ...Array(Math.floor(nCommonChit)).fill(8),
      ...Array(Math.floor(nCommonChit)).fill(9),
      ...Array(Math.floor(nCommonChit)).fill(10),
      ...Array(Math.floor(nCommonChit)).fill(11),
      ...Array(Math.floor(nRareChit)).fill(12),
    ];

    const nRemainingChit = nNonDeserts - chitValues.length;

    if (nRemainingChit > 0) {
      chitValues = [
        ...chitValues,
        ...Array(nRemainingChit)
          .fill(null)
          .map(() => {
            return [2, 3, 4, 5, 6, 8, 9, 10, 11, 12][
              Math.floor(Math.random() * 10)
            ];
          }),
      ];
    }

    const chitChooser = randomNoRepeat<number>(chitValues);

    // ) harbors

    // ) create entities
    await Promise.all([
      ...resources.map((e) => model.entities.TerrainEntity.create(e).go()),
      ...resources
        .filter((e) => e.terrain !== "desert")
        .map(({ x, y }) =>
          model.entities.ChitEntity.create({
            gameId: game.gameId,
            value: chitChooser(),
            x,
            y,
          }).go()
        ),
      ...harbors.map(({ x, y }) =>
        model.entities.HarborEntity.create({
          gameId: game.gameId,
          resource: "brick",
          ratio: "2:1",
          x,
          y,
        }).go()
      ),
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
