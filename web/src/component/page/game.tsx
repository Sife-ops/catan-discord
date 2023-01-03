import { useEffect } from "react";
import { useParams } from "react-router-dom";

export const Game = () => {
  const { gameId } = useParams();

  // const map = JSON.parse(gameCollectionData.GameEntity[0].map) as {
  //   type: string;
  // }[][];

  // const flatMap = map
  //   .map((row, iRow) =>
  //     row.map((col, iCol) => ({
  //       ...col,
  //       coords: {
  //         x: iCol,
  //         y: iRow,
  //       },
  //     }))
  //   )
  //   .reduce((a, c) => {
  //     return [...a, ...c];
  //   }, []);

  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/game", {
      method: "POST",
      body: JSON.stringify({ gameId }),
    })
      .then((e) => e.json())
      .then((e) => {
        console.log(e);
      });
  }, []);

  return (
    <div>
      <div>{gameId}</div>
    </div>
  );
};
