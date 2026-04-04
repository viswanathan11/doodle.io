import React from "react";
import { useSocket } from "../socket/SocketContext";
const Chat = () => {
  const socket = useSocket();
  return (
    <div
      className="glass-panel"
      style={{
        width: "280px",
        height: "600px",
        display: "flex",
        flexDirectionL: "column",
        padding: "15px",
      }}
    >
      <h3
        style={{
          textTransform: "uppercase",
          fontSize: "1.2rem",
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
          marginBottom: "10px",
        }}
      >
        Chat
      </h3>

      {/* messge History Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          padding: "10px",
          overflowY: "auto",
          border: "1px solid #ddd",
        }}
      >
        <p
          style={{
            color: "green",
            margin: "5px 0",
          }}
        >
          <strong>System: </strong>Welcome to the room
        </p>
      </div>

      {/* chat Input */}
      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          type="text"
          placeholder="Type your guess here..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            outline: "none",
          }}
        ></input>
      </div>
    </div>
  );
};

export default Chat;
