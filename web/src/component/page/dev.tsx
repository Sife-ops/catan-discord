// import * as Entity from "@catan-discord/server/core/entity";
// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";

import { useEffect } from "react";
import Sockette from "sockette";

export const Dev = () => {
  useEffect(() => {
    // const ws = new Sockette("ws://localhost:3000", {
    const ws = new Sockette(
      "wss://15hiut6zyb.execute-api.us-east-1.amazonaws.com/wgoettsch",
      {
        timeout: 5e3,
        maxAttempts: 10,
        onopen: (e) => console.log("Connected!", e),
        onmessage: (e) => console.log("Received:", e),
        onreconnect: (e) => console.log("Reconnecting...", e),
        onmaximum: (e) => console.log("Stop Attempting!", e),
        onclose: (e) => console.log("Closed!", e),
        onerror: (e) => console.log("Error:", e),
      }
    );

    //   ws.send("Hello, world!");
    //   ws.json({ type: "ping" });
    //   ws.close(); // graceful shutdown
    // Reconnect 10s later
    // setTimeout(ws.reconnect, 10e3);
  }, []);

  return (
    <div>
      <div>Dev</div>
    </div>
  );
};
