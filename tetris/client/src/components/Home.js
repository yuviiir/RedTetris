import React from "react";

export default function Home({ ws, clientId, gameFull, playerLeft }) {
  const createGame = () => {
    const payLoad = {
      method: "create",
      clientId: clientId,
    };
    ws.send(JSON.stringify(payLoad));
  };

  return (
    <div style={{ margin: "20px" }}>
      {playerLeft ? (
        <p>Opponent has left the game.</p>
      ) : gameFull ? (
        <p>The Game was full.</p>
      ) : (
        <p>Welcome to Red Tetris.</p>
      )}
      {!playerLeft && !gameFull ? (
        <div>
          <button type="button" onClick={createGame}>
            Create Game
          </button>
        </div>
      ) : null}
    </div>
  );
}
