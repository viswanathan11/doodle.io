const { io } = require("socket.io-client");
const socket = io("http://localhost:8080");

socket.on("connect", () => {
  console.log("Connected to server", socket.id);
  // Send the join event
  socket.emit("room:join", { code: "TEST12", username: "Tester", color: "#000" });
});

socket.on("room:state", (state) => {
  console.log("Received room state:", state);
  setTimeout(() => process.exit(0), 1000);
});

socket.on("error", (err) => {
  console.log("Error from server:", err);
  setTimeout(() => process.exit(1), 1000);
});
