import React from "react";
import PlayerCard from "./PlayerCard";

const Players = ({players}) => {

  return (
    <div
      className="glass-panel side-panel"
      style={{
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        backgroundColor: "#f5f5f5",
        border: "2px solid #000",
      }}
    >
      <h3
        style={{
          textTransform: "uppercase",
          fontSize: "1.2rem",
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
          margin: "0 0 10px 0",
        }}
      >
        Players
      </h3>

      {/* scrolabble list of players */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          padding: "5px",
        }}
      >
        {/* Sample player chard */}
        {players.map((player, index) => (
          <PlayerCard
            key={player.id}
            username={player.username}
            score={player.score}
            rank={index+1}
            color={player.color}
            isDrawing={false}
            hasGuessed={false}
          />
        ))}
      </div>
    </div>
  );
};

export default Players;
