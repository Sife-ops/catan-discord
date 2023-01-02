import { Service } from "electrodb";

import { BuildingEntity } from "./entity/building";
import { ChitEntity } from "./entity/chit";
import { GameEntity } from "./entity/game";
import { HarborEntity } from "./entity/harbor";
import { MapEntity } from "./entity/map";
import { PlayerEntity } from "./entity/player";
import { RoadEntity } from "./entity/road";
import { TerrainEntity } from "./entity/terrain";
import { UserEntity } from "./entity/user";

export const model = new Service({
  UserEntity,
  BuildingEntity,
  ChitEntity,
  GameEntity,
  HarborEntity,
  MapEntity,
  PlayerEntity,
  RoadEntity,
  TerrainEntity,
});
