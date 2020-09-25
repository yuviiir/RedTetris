import React, { Fragment } from "react";
import Cell from "./Cell";
import { StyledGrid } from "./styles/StyledGrid";

export default function Grid({ grid, players }) {
  return (
    <Fragment>
      <p>P{players}</p>
      <StyledGrid width={grid[0].length} height={grid.length}>
        {grid.map((row) =>
          row.map((cell, x) => <Cell key={x} type={cell[0]} />)
        )}
      </StyledGrid>
    </Fragment>
  );
}
