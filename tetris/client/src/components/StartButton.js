import React from "react";

export default function StartButton({ callBack, gameStarted }) {
  return (
    <div
      type="button"
      onClick={callBack}
      style={{ width: "100px", marginTop: "10px", border: "solid black" }}
    >
      {!gameStarted ? "Start" : "Restart"}
    </div>
  );
}
