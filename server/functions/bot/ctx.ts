import { GameCollection, model } from "@catan-discord/core/model";

import {
  adjXY,
  compareXY,
  compareXYPair,
  Coords,
  CoordsPair,
  envSchema,
  OptionSchema,
} from "./common";

export class Ctx {
  body;

  env;
  gameCollection;

  private constructor(c: {
    body: any;
    gameCollection: GameCollection | undefined;
  }) {
    this.body = c.body;

    this.env = envSchema.parse(process.env);
    this.gameCollection = c.gameCollection;
  }

  static async init(body: any) {
    const gameCollection = await model.entities.GameEntity.query
      .channel({ channelId: body.channel_id })
      .where(({ winner }, { notExists }) => notExists(winner))
      .go()
      .then(({ data }) => data[0])
      .then((game) => {
        if (!game) return undefined;
        return model.collections
          .game({ gameId: game.gameId })
          .go()
          .then((e) => e.data);
      });

    return new Ctx({
      body,
      gameCollection,
    });
  }

  getChannelId(): string {
    return this.body.channel_id;
  }

  getUserId(): string {
    return this.body.member.user.id;
  }

  getFlatOptions(): OptionSchema[][] {
    const recurse = (options: OptionSchema[]): OptionSchema[][] => {
      if (!options || options.length < 1) return [];
      const firstOption = options[0];
      if (firstOption.options && firstOption.options.length > 0) {
        return [[firstOption], ...recurse(firstOption.options)];
      }
      return [options];
    };

    const {
      data: { name, options, type },
    } = this.body;

    return [
      [
        {
          name,
          options,
          type,
        },
      ],
      ...recurse(options),
    ];
  }

  getCommandName(index: number) {
    return this.getFlatOptions()[index][0].name;
  }

  getOptionValue(optionName: string) {
    const flatOptions = this.getFlatOptions();
    const value = flatOptions[flatOptions.length - 1].find(
      (option) => option.name === optionName
    )?.value;
    if (!value) throw new Error(`option not found: "${optionName}"`);
    return value;
  }

  getGameCollection() {
    if (!this.gameCollection) throw new Error("missing gameCollection");
    return this.gameCollection;
  }

  getPlayers() {
    return this.getGameCollection().PlayerEntity;
  }

  getPlayer(index?: number) {
    const player = this.getPlayers().find((player) => {
      if (typeof index === "number") {
        return player.playerIndex === index;
      } else {
        return player.userId === this.getUserId();
      }
    });
    if (!player) throw new Error("missing player");
    return player;
  }

  getGame() {
    return this.getGameCollection().GameEntity[0];
  }

  hasGame() {
    return !!this.gameCollection;
  }

  getMap() {
    // todo: explicit any
    return JSON.parse(this.getGame().map) as any[][];
  }

  getFlatMap() {
    return this.getMap()
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
  }

  getMapAdjacent(type: string, coords: Coords) {
    const adj = adjXY(coords).map((offset) => ({
      x: coords.x + offset.x,
      y: coords.y + offset.y,
    }));

    return this.getFlatMap()
      .filter((c) => adj.find((cc) => compareXY(cc, c)))
      .filter((c) => c.type === type);
  }

  getMapIndex<T>(type: string, index: number): T | undefined {
    return this.getFlatMap().filter((e) => e.type === type)[index];
  }

  getMapIndexOrThrow<T>(type: string, index: number): T {
    const a = this.getMapIndex<T>(type, index);
    if (!a) throw new Error("todo");
    return a;
  }

  getRound() {
    return this.getGame().round;
  }

  getRoads() {
    return this.getGameCollection().RoadEntity.map((road) => ({
      ...road,
      from: { x: road.x1, y: road.y1 },
      to: { x: road.x2, y: road.y2 },
    }));
  }

  getPlayerRoads() {
    return this.getRoads().filter((road) => road.playerId === this.getUserId());
  }

  hasRoad(r: CoordsPair) {
    return !!this.getRoads().find((road) => compareXYPair(road, r));
  }

  getBuildings() {
    return this.getGameCollection().BuildingEntity;
  }

  getPlayerBuildings() {
    return this.getBuildings().filter(
      (building) => building.playerId === this.getUserId()
    );
  }

  hasBuilding(b: Coords) {
    return !!this.getBuildings().find((building) => compareXY(building, b));
  }

  getUserPlayer() {
    const player = this.getGameCollection().PlayerEntity.find(
      (player) => player.userId === this.getUserId()
    );
    if (!player) throw new Error("player not found");
    return player;
  }
}
