import { Command } from "@catan-discord/bot/runner";
import { TerrainEntityType } from "@catan-discord/core/entity";
import { genericResponse, rollTwo } from "@catan-discord/bot/common";
import { model } from "@catan-discord/core/model";

export const start: Command = {
  handler: async (ctx) => {
    const { gameId } = ctx.getGame();
    const flatMap = ctx.getFlatMap();
    const channelId = ctx.getChannelId();
    const WEB_URL = ctx.env.WEB_URL;

    /**
     * 1) count players
     * 2) initialize game
     *   2a) resources
     *   2b) chits
     *   2c) harbors
     * 3) create entities
     * 4) start game
     * 5) player order
     */

    // todo: robber

    // 1) count players
    const playerCount = await model.entities.PlayerEntity.query
      .game_({ gameId })
      .go()
      .then(({ data }) => data.length);

    if (playerCount < 2) {
      return genericResponse("not enough players");
    }

    // todo: "too many players" condition

    // 2) initialize game
    const terrains = flatMap.filter((e) => e.type === "terrain");
    const harbors = flatMap.filter((e) => e.type === "harbor");

    /**
     * todo: everything after this is not very dry, too many constants
     */

    // 2a) resources
    const nDeserts = Math.floor(terrains.length / 19);
    const nNonDeserts = terrains.length - nDeserts;
    const nAbundantResource = Math.floor((nNonDeserts * 2) / 9);
    const nSparceResource = Math.floor(nNonDeserts / 6);

    let resourceValues: string[] = [
      ...Array(nDeserts).fill("desert"),
      ...Array(nAbundantResource).fill("pasture"),
      ...Array(nAbundantResource).fill("forest"),
      ...Array(nAbundantResource).fill("fields"),
      ...Array(nSparceResource).fill("mountains"),
      ...Array(nSparceResource).fill("hills"),
    ];

    const nRemainingResource = nNonDeserts - resourceValues.length;
    if (nRemainingResource > 0) {
      resourceValues = [
        ...resourceValues,
        ...Array(nRemainingResource)
          .fill(null)
          .map(() => {
            return ["pasture", "fields", "mountains", "hills", "forest"][
              Math.floor(Math.random() * 5)
            ];
          }),
      ];
    }

    const resourceChooser = randomNoRepeat<string>(resourceValues);
    const resources = terrains.map(
      ({ x, y }): TerrainEntityType => ({
        gameId,
        // @ts-ignore
        terrain: resourceChooser(),
        x,
        y,
      })
    );

    // 2b) chits
    const nRareChit = nNonDeserts / 18;
    const nCommonChit = nNonDeserts / 9;

    let chitValues: number[] = [
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

    // 2c) harbors
    const nHarbor = harbors.length;
    const nSpecificHarbor = Math.floor(nHarbor / 9);
    const nAnyHarbor = Math.floor((nHarbor * 4) / 9);

    let harborResources: string[] = [
      ...Array(nSpecificHarbor).fill("brick"),
      ...Array(nSpecificHarbor).fill("ore"),
      ...Array(nSpecificHarbor).fill("grain"),
      ...Array(nSpecificHarbor).fill("wool"),
      ...Array(nSpecificHarbor).fill("lumber"),
      ...Array(nAnyHarbor).fill("any"),
    ];

    const nRemainingHarbor = nHarbor - harborResources.length;
    if (nRemainingHarbor > 0) {
      harborResources = [
        ...harborResources,
        ...Array(nRemainingHarbor)
          .fill(null)
          .map(() => {
            return ["brick", "ore", "grain", "wool", "lumber", "any"][
              Math.floor(Math.random() * 6)
            ];
          }),
      ];
    }

    const harborChooser = randomNoRepeat(harborResources);

    // 3) create entities
    await Promise.all([
      ...resources.map((e) => model.entities.TerrainEntity.create(e).go()),
      ...resources
        .filter((e) => e.terrain !== "desert")
        .map(({ x, y }) =>
          model.entities.ChitEntity.create({
            gameId,
            value: chitChooser(),
            x,
            y,
          }).go()
        ),
      ...harbors.map(({ x, y }) => {
        const chosen = harborChooser();
        return model.entities.HarborEntity.create({
          gameId,
          // @ts-ignore
          resource: chosen,
          ratio: chosen === "any" ? "3:1" : "2:1",
          x,
          y,
        }).go();
      }),

      // 4) start game
      model.entities.GameEntity.update({
        channelId,
        gameId,
      })
        .set({ started: true })
        .go(),
    ]);

    // 5) player order
    const players = ctx
      .getGameCollection()
      .PlayerEntity.map((player) => ({
        ...player,
        roll: rollTwo(),
      }))
      .sort((a, b) => b.roll - a.roll);

    await Promise.all(
      players.map((player, i) =>
        model.entities.PlayerEntity.update(player).set({ playerIndex: i }).go()
      )
    );

    return {
      type: 4,
      data: {
        content: `game started, <@${players[0].userId}>'s turn`,
        embeds: [
          {
            title: "game url",
            url: `https://${WEB_URL}/game/${gameId}`,
            color: 0xff0000,
          },
        ],
      },
    };
  },
};

const randomNoRepeat = <T>(array: T[]) => {
  let copy = array.slice(0);
  return () => {
    if (copy.length < 1) {
      copy = array.slice(0);
    }
    let index = Math.floor(Math.random() * copy.length);
    let item = copy[index];
    copy.splice(index, 1);
    return item;
  };
};
