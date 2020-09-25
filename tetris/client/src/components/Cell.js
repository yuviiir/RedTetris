import React from "react";
import { StyledCell } from "./styles/StyledCell";
import { tetrominos } from "../helpers/tetrominos";

export default function Cell({ type }) {
  return <StyledCell color={tetrominos[type].color}></StyledCell>;
}
