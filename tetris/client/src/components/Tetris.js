import React, { useState, useEffect, Fragment } from "react";
import { createGrid, checkCollision } from "../helpers/gameHelpers";
import { StyledTetrisWrapper } from "./styles/StyledTetris";
import { StyledTetris } from "./styles/StyledTetris";
import { useInterval } from "../hooks/useInterval";
import { useTetro } from "../hooks/useTetro";
import { useGrid } from "../hooks/useGrid";
import Grid from "./Grid";
import Display from "./Display";
import StartButton from "./StartButton";
import Home from "./Home";

export default function Tetris({ ws }) {
  const [clientId, setclientId] = useState("");
  const [gameId, setgameId] = useState("");
  const [gameUrl, setgameUrl] = useState("");
  const [host, sethost] = useState("");
  const [gameCreated, setgameCreated] = useState(false);
  const [gameStarted, setgameStarted] = useState(false);
  const [players, setplayers] = useState(1);
  const [gameFull, setgameFull] = useState(false);
  const [playerLeft, setplayerLeft] = useState(false);
  const [loser, setloser] = useState("");

  const [dropTime, setDropTime] = useState(null);
  const [gameOver, setGameOver] = useState(false);

  const [
    tetro,
    updateTetroPos,
    resetTetro,
    tetroRotate,
  ] = useTetro();
  const [grid, setGrid] = useGrid(tetro, resetTetro);
  const [rows, setRows] = useState(0);
  const [level, setLevel] = useState(0);

  const [mainGrid, setmainGrid] = useState(grid);
  const [otherGrid, setotherGrid] = useState(grid);

  function moveTetro(dir) {
    if (!checkCollision(tetro, grid, { x: dir, y: 0 }))
      updateTetroPos({ x: dir, y: 0 });
  }

  function startGame(asHost) {
    setGrid(createGrid());
    setDropTime(1000);
    resetTetro();
    setGameOver(false);
    setRows(0);
    setLevel(0);
    setgameStarted(true);

    if (asHost) {
      const payLoad = {
        method: "start",
        clientId: clientId,
        gameId: gameId,
        grid: grid,
      };
      ws.send(JSON.stringify(payLoad));
    }
  }

  function drop() {
    if (rows > (level + 1) * 10) {
      setLevel((prev) => prev + 1);
      setDropTime(1000 / (level + 1) + 200);
    }

    if (!checkCollision(tetro, grid, { x: 0, y: 1 })) {
      updateTetroPos({ x: 0, y: 1, collided: false });
    } else {
      if (tetro.pos.y < 1) {
        setGameOver(true);
        setDropTime(null);
        setgameStarted(false);
        const payLoad = {
          method: "gameOver",
          clientId: clientId,
          gameId: gameId,
        };
        ws.send(JSON.stringify(payLoad));
      }
      updateTetroPos({ x: 0, y: 0, collided: true });
    }
  }

  function keyUp({ keyCode }) {
    if (!gameOver) {
      if (keyCode === 40) {
        setDropTime(1000 / (level + 1) + 200);
      }
    }
  }

  function move({ keyCode }) {
    if (!gameOver) {
      if (keyCode === 37) {
        // left
        moveTetro(-1);
      } else if (keyCode === 39) {
        // right
        moveTetro(1);
      } else if (keyCode === 40) {
        // down
        drop();
      } else if (keyCode === 38) {
        // up
        tetroRotate(grid, 1);
      }
    }
  }

  useInterval(() => {
    drop();
  }, dropTime);

  useEffect(() => {
    ws.onmessage = (message) => {
      const response = JSON.parse(message.data);
      if (response.method === "ping") {
        const payLoad = {
          method: "pong",
          clientId: clientId,
        };
        ws.send(JSON.stringify(payLoad));
      }

      if (response.method === "connect") {
        setclientId(response.clientId);
      }

      if (response.method === "create") {
        setgameId(response.game.id);
        setgameCreated(true);
        setgameUrl(response.url);
        sethost(response.game.host);
      }

      if (response.method === "join") {
        setgameCreated(true);
        setplayers((players) => players + 1);
      }

      if (response.method === "update") {
        const game = response.game;

        if (clientId === host.clientId) {
          game.clients.forEach((c) => {
            if (c.clientId !== clientId) {
              setotherGrid(c.grid);
            }
          });
        } else {
          game.clients.forEach((c) => {
            if (c.clientId !== clientId) {
              setmainGrid(c.grid);
            }
          });
        }
      }

      if (response.method === "startGame" && clientId !== host.clientId) {
        setGrid(createGrid());
        setDropTime(1000);
        resetTetro();
        setGameOver(false);
        setRows(0);
        setLevel(0);
      }

      if (response.method === "gameFull") {
        setgameFull(true);
        setGameOver(true);
        setDropTime(null);
      }

      if (response.method === "gameEnded") {
        setloser(response.loser);
        setGameOver(true);
        setDropTime(null);
      }

      if (response.method === "playerLeft") {
        setplayerLeft(true);
        setGameOver(true);
        setDropTime(null);
      }
    };
  }, [
    ws.onmessage,
    ws.onclose,
    host,
    clientId,
    setGrid,
    setDropTime,
    resetTetro,
    setGameOver,
    setRows,
    setLevel,
    ws,
  ]);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const id = params.get("game");
    setgameId(id);

    if (id && clientId) {
      const payLoad = {
        method: "join",
        clientId: clientId,
        gameId: id,
        grid: createGrid(),
      };
      ws.send(JSON.stringify(payLoad));
    }
  }, [clientId, ws]);

  useEffect(() => {
    if (clientId && gameId) {
      const payLoad = {
        method: "updateGrid",
        clientId: clientId,
        gameId: gameId,
        grid: grid,
      };
      ws.send(JSON.stringify(payLoad));
    }
  }, [grid, clientId, gameId, ws]);

  return (
    <Fragment>
      {!gameCreated || playerLeft ? (
        <Home
          ws={ws}
          clientId={clientId}
          gameFull={gameFull}
          playerLeft={playerLeft}
        />
      ) : (
        <StyledTetrisWrapper
          role="button"
          tabIndex="0"
          onKeyDown={(e) => move(e)}
          onKeyUp={keyUp}
        >
          <div style={{ margin: "10px" }}>
            <StyledTetris>
              <Grid
                grid={clientId === host.clientId ? grid : mainGrid}
                players={1}
              />
              {players > 1 ? (
                <Grid
                  grid={clientId === host.clientId ? otherGrid : grid}
                  players={2}
                />
              ) : (
                <div>
                  <label>2-Player Link</label>
                  <div style={{ margin: "10px" }}>
                    <input
                      type="text"
                      id="name_field"
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      defaultValue={gameUrl}
                    />
                  </div>
                </div>
              )}
              <aside>
                {gameOver ? (
                  <Fragment>
                    <Display gameOver={gameOver} text="Game Over" />
                    {clientId === loser ? "You Lose!" : "You Win!"}
                  </Fragment>
                ) : null}
                {clientId === host.clientId ? (
                  <StartButton
                    gameStarted={gameStarted}
                    callBack={() => startGame(true)}
                  />
                ) : null}
              </aside>
            </StyledTetris>
          </div>
        </StyledTetrisWrapper>
      )}
    </Fragment>
  );
}
