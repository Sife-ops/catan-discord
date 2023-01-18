import * as Entity from "@catan-discord/server/core/entity";
import { GameCollection } from "@catan-discord/server/core/model";
import Sockette from "sockette";
import { ulid } from "ulid";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export const Game = () => {
  const clientId = ulid();
  const { gameId } = useParams();

  const [ws, setWs] = useState<Sockette>();

  const [gameData, setGameData] = useState<{
    gameCollection: GameCollection;
    users: Entity.UserEntityType[];
  }>();

  const [hexes, setHexes] = useState<JSX.Element[]>();
  const [chits, setChits] = useState<JSX.Element[]>();
  const [harbor, setHarbors] = useState<JSX.Element[]>();

  const updateGameData = () => {
    fetch(import.meta.env.VITE_API_URL + "/game", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.ok) throw new Error("no game data");
        setGameData(res.data);
      });
  };

  useEffect(() => {
    const ws = new Sockette(
      "wss://15hiut6zyb.execute-api.us-east-1.amazonaws.com/wgoettsch",
      {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: (e) => {
          console.log("Connected!", e);
          setWs(ws);
          ws.json({
            action: "gameConnection",
            data: { gameId, clientId },
          });
        },
        onmessage: (e) => {
          console.log("Received:", e);
          const parsedData = JSON.parse(e.data);
          switch (parsedData.action) {
            case "update":
              updateGameData();
              break;

            default:
              break;
          }
        },
        onreconnect: (e) => console.log("Reconnecting...", e),
        onmaximum: (e) => console.log("Stop Attempting!", e),
        onclose: (e) => console.log("Closed!", e),
        onerror: (e) => console.log("Error:", e),
      }
    );

    updateGameData();
  }, []);

  useEffect(() => {
    if (gameData) {
      const map = JSON.parse(gameData.gameCollection.GameEntity[0].map) as {
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
        ...gameData.gameCollection.TerrainEntity.map(mapHex),
      ]);

      setChits(gameData.gameCollection.ChitEntity.map(mapChit));
      setHarbors(gameData.gameCollection.HarborEntity.map(mapHarbor));
    }
  }, [gameData]);

  return (
    <div>
      <div>{gameId}</div>
      <div>
        <svg viewBox="0 0 120 150">
          <g transform="translate(10, 10)">
            {hexes}
            {chits}
            {harbor}
          </g>
        </svg>
      </div>
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
