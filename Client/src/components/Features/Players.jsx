import React from "react";
import PlayerCard from "./PlayerCard";

const Players = () => {
  const samplePlayers = [
    {
      id: 1,
      username: "Doodler99",
      score: 450,
      rank: 1,
      color: "#ff5722",
      isDrawing: true,
      hasGuessed: false,
    },
    {
      id: 2,
      username: "ArtMaster",
      score: 320,
      rank: 2,
      color: "#4caf50",
      isDrawing: false,
      hasGuessed: true,
    },
    {
      id: 3,
      username: "Noobz",
      score: 100,
      rank: 3,
      color: "#2196f3",
      isDrawing: false,
      hasGuessed: false,
    },
    {
      id: 4,
      username: "GuessWho",
      score: 80,
      rank: 4,
      color: "#9c27b0",
      isDrawing: false,
      hasGuessed: false,
    },
    {
      id: 5,
      username: "Doodler99",
      score: 450,
      rank: 1,
      color: "#ff5722",
      isDrawing: true,
      hasGuessed: false,
    },
    {
      id: 6,
      username: "ArtMaster",
      score: 320,
      rank: 2,
      color: "#4caf50",
      isDrawing: false,
      hasGuessed: true,
    },
    {
      id: 7,
      username: "Noobz",
      score: 100,
      rank: 3,
      color: "#2196f3",
      isDrawing: false,
      hasGuessed: false,
    },
    {
      id: 8,
      username: "GuessWho",
      score: 80,
      rank: 4,
      color: "#9c27b0",
      isDrawing: false,
      hasGuessed: false,
    },
  ];

  return (
    <div
      className="glass-panel"
      style={{
        width: "auto",
        maxWidth: "300px",
        height: "auto",
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
        {samplePlayers.map((player, index) => (
          <PlayerCard
            key={player.id}
            username={player.username}
            score={player.score}
            rank={player.rank}
            color={player.color}
            isDrawing={player.isDrawing}
            hasGuessed={player.hasGuessed}
          />
        ))}
      </div>
    </div>
  );
};

export default Players;
