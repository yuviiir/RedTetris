import React, { Fragment } from "react";

export default function Display({ gameOver, text }) {
  return (
    <Fragment>
      {!gameOver ? (
        <div style={{ width: "250px", marginTop: "20px" }}>{text}</div>
      ) : (
        <div style={{ width: "250px", marginTop: "20px", background: "red" }}>
          {text}
        </div>
      )}
    </Fragment>
  );
}
