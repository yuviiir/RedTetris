import { useState, useEffect } from "react";
import { createGrid } from "../helpers/gameHelpers";

export function useGrid(tetro, resetTetro) {
  const [grid, setGrid] = useState(createGrid());

  useEffect(() => {
    const sweepRows = (newGrid) =>
      newGrid.reduce((ack, row) => {
        if (row.findIndex((cell) => cell[0] === 0) === -1) {
          ack.unshift(new Array(newGrid[0].length).fill([0, "clear"]));
          return ack;
        }
        ack.push(row);
        return ack;
      }, []);

    const updateGrid = (prevGrid) => {
      const newGrid = prevGrid.map((row) =>
        row.map((cell) => (cell[1] === "clear" ? [0, "clear"] : cell))
      );

      tetro.tetromino.forEach((row, y) => {
        row.forEach((val, x) => {
          if (val !== 0) {
            newGrid[y + tetro.pos.y][x + tetro.pos.x] = [
              val,
              `${tetro.collided ? "merged" : "clear"}`,
            ];
          }
        });
      });

      if (tetro.collided) {
        resetTetro();
        return sweepRows(newGrid);
      }

      return newGrid;
    };
    setGrid((prev) => updateGrid(prev));
  }, [tetro, resetTetro]);

  return [grid, setGrid];
}
