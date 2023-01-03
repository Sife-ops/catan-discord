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
        const map = JSON.parse(res.data.gameCollection.GameEntity[0].map) as {
          type: string;
        }[][];

        const flatMap = map
          .map((row, iRow) =>
            row.map((col, iCol) => ({
              ...col,
              coords: {
                x: iCol,
                y: iRow,
              },
            }))
          )
          .reduce((a, c) => {
            return [...a, ...c];
          }, []);

        setHexes(
          flatMap
            .filter((e) => ["ocean", "harbor", "terrain"].includes(e.type))
            .map((e) => {
              let x = 11;
              x = x + (e.coords.x * 30) / 3;
              if (e.coords.y % 2 !== 0) {
                x = x + 5;
              }

              let y = 10;
              y = y + e.coords.y * 9;

              const fn = () => {
                switch (e.type) {
                  case "ocean":
                  case "harbor":
                    return "azure";

                  case "terrain": {
                    const terrain = res.data.gameCollection.TerrainEntity.find(
                      (t: any) => {
                        if (t.x === e.coords.x && t.y === e.coords.y) {
                          return true;
                        }
                        return false;
                      }
                    );

                    switch (terrain.terrain) {
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
                  }

                  default:
                    return "azure";
                }
              };

              return (
                <use
                  key={`${x},${y}`}
                  xlinkHref="#pod"
                  transform={`translate(${x}, ${y})`}
                  style={{ fill: fn() }}
                />
              );
            })
        );

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
