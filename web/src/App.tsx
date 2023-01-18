import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Game } from "./component/page/game";
import { Dev } from "./component/page/dev";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/dev" element={<Dev />} /> */}
        <Route path="/game/:gameId" element={<Game />} />
        <Route path="/error" element={<div>404</div>} />
        <Route path="*" element={<Navigate to="/error" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
