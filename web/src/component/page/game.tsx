import * as Entity from "@catan-discord/server/core/entity";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Game = () => {
  const { gameId } = useParams();
  const [hexes, setHexes] = useState<JSX.Element[]>();
  const [chits, setChits] = useState<JSX.Element[]>();

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
            .map(mapHex("blue")),
          ...data.gameCollection.TerrainEntity.map((e) =>
            mapHex(terrainColor(e.terrain))(e)
          ),
        ]);

        setChits(data.gameCollection.ChitEntity.map(mapChit));

        console.log(flatMap);
      });
  }, []);

  return (
    <div>
      {hexes && (
        <svg viewBox="0 0 120 150">
          <defs>
            <g id="hex">
              <polygon
                stroke="#000000"
                strokeWidth="0.5"
                points="5,-9 -5,-9 -10,0 -5,9 5,9 10,0"
              />
            </g>
          </defs>
          <g transform="translate(10, 10)">
            {hexes}
            {chits}
          </g>
        </svg>
      )}
    </div>
  );
};

interface Coords {
  x: number;
  y: number;
}

const translol = (c: Coords) => {
  let x = c.x * 10;
  if (c.y % 2 !== 0) {
    x = x + 5;
  }

  return {
    x,
    y: c.y * 9,
  };
};

const mapChit = (e: Entity.ChitEntityType) => {
  const { x, y } = translol(e);
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx={0} cy={0} r={3} style={{ fill: "black" }} />
      <text fill="white" fontSize={4} x={-1} y={1}>
        {e.value}
      </text>
    </g>
  );
};

const mapHex = (color: string) => (e: Coords) => {
  const { x, y } = translol(e);
  return (
    <use
      key={`${x}, ${y}`}
      xlinkHref="#hex"
      transform={`translate(${x}, ${y})`}
      style={{ fill: color }}
    />
  );
};

const terrainColor = (t: string) => {
  switch (t) {
    case "fields":
      return "wheat";
    case "pasture":
      return "springgreen";
    case "desert":
      return "sandybrown";
    case "hills":
      return "firebrick";
    case "forest":
      return "forestgreen";
    case "mountains":
      return "slategray";
    default:
      return "azure";
  }
};
