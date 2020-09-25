import { useState, useCallback } from "react";
import { tetrominos, randomTetromino } from "../helpers/tetrominos";
import { grid_width, checkCollision } from "../helpers/gameHelpers";

export function useTetro() {
  const [tetro, setTetro] = useState({
    pos: { x: 0, y: 0 },
    tetromino: tetrominos[0].shape,
    collided: false,
  });

  const rotate = (matrix, dir) => {
    const rotatedTetro = matrix.map((_, index) =>
      matrix.map((col) => col[index])
    );
    if (dir > 0) return rotatedTetro.map((row) => row.reverse());
    return rotatedTetro.reverse();
  };

  const tetroRotate = (grid, dir) => {
    const clonedTetro = JSON.parse(JSON.stringify(tetro));
    clonedTetro.tetromino = rotate(clonedTetro.tetromino, dir);

    const pos = clonedTetro.pos.x;
    let offset = 1;

    while (checkCollision(clonedTetro, grid, { x: 0, y: 0 })) {
      clonedTetro.pos.x += offset;
      offset = -(offset + (offset > 0 ? 1 : -1));
      if (offset > clonedTetro.tetromino[0].length) {
        rotate(clonedTetro.tetromino, -dir);
        clonedTetro.pos.x = pos;
        return;
      }
    }

    setTetro(clonedTetro);
  };

  const updateTetroPos = ({ x, y, collided }) => {
    setTetro((prev) => ({
      ...prev,
      pos: {
        x: (prev.pos.x += x),
        y: (prev.pos.y += y),
      },
      collided,
    }));
  };

  const resetTetro = useCallback(() => {
    setTetro({
      pos: {
        x: grid_width / 2 - 2,
        y: 0,
      },
      tetromino: randomTetromino().shape,
      collided: false,
    });
  }, []);

  return [tetro, updateTetroPos, resetTetro, tetroRotate];
}
