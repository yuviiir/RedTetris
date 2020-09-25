export const grid_width = 10;
export const grid_height = 20;

export const createGrid = () =>
  Array.from(Array(grid_height), () =>
    new Array(grid_width).fill([0, "clear"])
  );

export const checkCollision = (tetro, grid, { x: moveX, y: moveY }) => {
  for (let y = 0; y < tetro.tetromino.length; y++) {
    for (let x = 0; x < tetro.tetromino[y].length; x++) {
      if (tetro.tetromino[y][x] !== 0) {
        if (
          !grid[y + tetro.pos.y + moveY] ||
          !grid[y + tetro.pos.y + moveY][x + tetro.pos.x + moveX] ||
          grid[y + tetro.pos.y + moveY][x + tetro.pos.x + moveX][1] !== "clear"
        ) {
          return true;
        }
      }
    }
  }
};
