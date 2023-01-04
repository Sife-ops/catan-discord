import * as Entity from "@catan-discord/server/core/entity";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Game = () => {
  const { gameId } = useParams();
  const [hexes, setHexes] = useState<JSX.Element[]>();

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
          };
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
          ...data.gameCollection.TerrainEntity.map((e) =>
            fn(hexColor(e.terrain))(e)
          ),
          ...flatMap
            .filter((e) => ["ocean", "harbor"].includes(e.type))
            .map(fn("blue")),
        ]);

        console.log(flatMap);
      });
  }, []);

  return (
    <div>
      {hexes && (
        <svg viewBox="0 0 120 150">
          <defs>
            <g id="pod">
              <polygon
                stroke="#000000"
                strokeWidth="0.5"
                points="5,-9 -5,-9 -10,0 -5,9 5,9 10,0"
              />
            </g>
          </defs>
          <g className="pod-wrap">{hexes}</g>
        </svg>
      )}
    </div>
  );
};

// const fn = (X: number, Y: number, color: string) => {
const fn = (color: string) => (e: { x: number; y: number }) => {
  let x = 11;
  x = x + (e.x * 30) / 3;
  if (e.y % 2 !== 0) {
    x = x + 5;
  }

  let y = 10;
  y = y + e.y * 9;

  return (
    <use
      key={`${x}, ${y}`}
      xlinkHref="#pod"
      transform={`translate(${x}, ${y})`}
      style={{ fill: color }}
    />
  );
};

const hexColor = (t: string) => {
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
