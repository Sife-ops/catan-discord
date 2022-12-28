import { useEffect, useState } from "react";
import "./App.css";
import map from "./map.json";

function App() {
  const [hexes, setHexes] = useState<any[]>();

  useEffect(() => {
    let hexes: any[] = [];

    for (let iRow = 0; iRow < map.length; iRow++) {
      for (let iCol = 0; iCol < map[iRow].length; iCol++) {
        const col = map[iRow][iCol];
        if (col.type === "none" || col.type === "intersection") {
          continue;
        } else {
          let x = 11;
          x = x + (iCol * 30) / 3;
          if (iRow % 2 !== 0) {
            x = x + 5;
          }

          let y = 10;
          y = y + iRow * 9;

          hexes = [
            ...hexes,
            <use
              key={`${x},${y}`}
              xlinkHref="#pod"
              transform={`translate(${x}, ${y})`}
              style={col.type === "pasture" ? pasture : hills}
            />,
          ];
        }
      }
    }

    setHexes(hexes);
  }, []);

  return (
    <div>
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

        <g className="pod-wrap">{hexes && hexes}</g>
      </svg>

      <svg viewBox="0 0 100 100">
        <defs>
          <g id="pod">
            <polygon
              stroke="#000000"
              strokeWidth="0.5"
              points="5,-9 -5,-9 -10,0 -5,9 5,9 10,0"
            />
          </g>
        </defs>

        <g className="pod-wrap">
          {/* <g> */}
          <use
            xlinkHref="#pod"
            transform="translate(40, 10)"
            style={mountains}
          />
          <use xlinkHref="#pod" transform="translate(25, 19)" style={hills} />
          <use xlinkHref="#pod" transform="translate(55, 19)" style={pasture} />
          <use xlinkHref="#pod" transform="translate(10, 28)" style={forest} />
          <use xlinkHref="#pod" transform="translate(40, 28)" style={forest} />
          <use xlinkHref="#pod" transform="translate(70, 28)" style={pasture} />
          <use xlinkHref="#pod" transform="translate(25, 37)" style={pasture} />
          <use xlinkHref="#pod" transform="translate(55, 37)" style={fields} />
          <use xlinkHref="#pod" transform="translate(10, 46)" style={pasture} />
          <use xlinkHref="#pod" transform="translate(40, 46)" style={desert} />
          <use xlinkHref="#pod" transform="translate(70, 46)" style={fields} />
          <use xlinkHref="#pod" transform="translate(25, 55)" style={hills} />
          <use
            xlinkHref="#pod"
            transform="translate(55, 55)"
            style={mountains}
          />
          <use
            xlinkHref="#pod"
            transform="translate(10, 64)"
            style={mountains}
          />
          <use xlinkHref="#pod" transform="translate(40, 64)" style={forest} />
          <use xlinkHref="#pod" transform="translate(70, 64)" style={hills} />
          <use xlinkHref="#pod" transform="translate(25, 73)" style={fields} />
          <use xlinkHref="#pod" transform="translate(55, 73)" style={forest} />
          <use xlinkHref="#pod" transform="translate(40, 82)" style={fields} />
        </g>
      </svg>
    </div>
  );
}

const fields: React.CSSProperties = {
  fill: "wheat",
};

const pasture: React.CSSProperties = {
  fill: "springgreen",
};

const desert: React.CSSProperties = {
  fill: "sandybrown",
};

const hills: React.CSSProperties = {
  fill: "firebrick",
};

const forest: React.CSSProperties = {
  fill: "forestgreen",
};

const mountains: React.CSSProperties = {
  fill: "slategray",
};

export default App;
