import React from "react";

function Food({ position, color }) {
  return (
    <div
      style={{
        width: "15px",
        height: "15px",
        backgroundColor: color || "#e74c3c",
        margin: "3px",
        position: "absolute",
        left: `${position.x}%`,
        top: `${position.y}%`,
        zIndex: 0,
      }}
    />
  );
}

export default Food;
