import * as Entity from "@catan-discord/server/core/entity";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Game = () => {
  const { gameId } = useParams();
  const [hexes, setHexes] = useState<JSX.Element[]>();
  const [chits, setChits] = useState<JSX.Element[]>();
  const [harbor, setHarbors] = useState<JSX.Element[]>();

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/game", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) throw new Error("no game data");
        return res.data as {
          gameCollection: {
            GameEntity: Entity.GameEntityType[];
            TerrainEntity: Entity.TerrainEntityType[];
            ChitEntity: Entity.ChitEntityType[];
            HarborEntity: Entity.HarborEntityType[];
          };
          users: Entity.UserEntityType[];
        };
      })
      .then((data) => {
        const map = JSON.parse(data.gameCollection.GameEntity[0].map) as {
          type: string;
        }[][];

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

        setHexes([
          ...flatMap
            .filter((e) => ["ocean", "harbor"].includes(e.type))
            .map(mapHex),
          ...data.gameCollection.TerrainEntity.map(mapHex),
        ]);

        setChits(data.gameCollection.ChitEntity.map(mapChit));
        setHarbors(data.gameCollection.HarborEntity.map(mapHarbor));
      });
  }, []);

  return (
    <div>
      <svg viewBox="0 0 120 150">
        <g transform="translate(10, 10)">
          {hexes}
          {chits}
          {harbor}
        </g>
      </svg>
    </div>
  );
};

interface Coords {
  x: number;
  y: number;
}

const translate = (c: Coords) => {
  let x = c.x * 10;
  if (c.y % 2 !== 0) {
    x = x + 5;
  }

  return {
    x,
    y: c.y * 9,
  };
};

const mapHarbor = (e: Entity.HarborEntityType) => {
  const { x, y } = translate(e);
  return (
    <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
      <polygon
        stroke="#000000"
        strokeWidth="0.5"
        style={{ fill: resourceColor(e.resource) }}
        points="4,-4 -4,-4 -4,4 4,4"
      />
    </g>
  );
};

const mapChit = (e: Entity.ChitEntityType) => {
  const { x, y } = translate(e);
  return (
    <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
      <circle cx={0} cy={0} r={3} style={{ fill: "black" }} />
      <text fill="white" fontSize={4} x={-1} y={1}>
        {e.value}
      </text>
    </g>
  );
};

const mapHex = (e: { x: number; y: number; terrain?: string }) => {
  const { x, y } = translate(e);
  return (
    <g transform={`translate(${x}, ${y})`} key={`x${x}y${y}`}>
      <polygon
        stroke="#000000"
        strokeWidth="0.5"
        style={{ fill: resourceColor(e.terrain) }}
        points="5,-9 -5,-9 -10,0 -5,9 5,9 10,0"
      />
    </g>
  );
};

const resourceColor = (t?: string) => {
  switch (t) {
    case "fields":
    case "grain":
      return "wheat";
    case "pasture":
    case "wool":
      return "springgreen";
    case "desert":
      return "sandybrown";
    case "hills":
    case "brick":
      return "firebrick";
    case "forest":
    case "lumber":
      return "forestgreen";
    case "mountains":
    case "ore":
      return "slategray";
    case "any":
      return "white";
    default:
      return "blue";
  }
};
