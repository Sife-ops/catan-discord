/**
 * undefined can be used to represent a non-resource tile
 */
type Resource = "Gold" | "Spice" | "Wood" | "Lizard" | undefined

/**
 * Player team colors
 */
type Colors = "White" | "Green" | "Black" | "Yellow"

type Board = {
  tiles: TileGraph,
  roads: RoadGraph,
}

type RoadGraph = {
  vertices: RoadVertex[],
  edges: RoadEdge[],
}

/**
 * The spot where a player can build a town or city
 */
type RoadVertex = {
  building: undefined | "Town" | "City",
  color: Colors | undefined,
  adjacentTiles: [TileNode | undefined, TileNode | undefined, TileNode | undefined]
}

type RoadEdge = {
  road: boolean,
  color: Colors | undefined
}

type TileGraph = {
  tiles: TileNode[],
  edges: TileEdge[],
}

type TileNode = {
  id: string,
  resource: Resource,
  roll: number,
  robber: boolean,
}

type TileEdge = {
  from: TileNode, to: TileNode
}
