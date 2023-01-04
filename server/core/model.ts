import * as Entity from "./entity";
import { Service } from "electrodb";

export const model = new Service({
  UserEntity: Entity.UserEntity,
  BuildingEntity: Entity.BuildingEntity,
  ChitEntity: Entity.ChitEntity,
  GameEntity: Entity.GameEntity,
  HarborEntity: Entity.HarborEntity,
  MapEntity: Entity.MapEntity,
  PlayerEntity: Entity.PlayerEntity,
  RoadEntity: Entity.RoadEntity,
  TerrainEntity: Entity.TerrainEntity,
});
