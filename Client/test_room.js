import { io } from "socket.io-client";
import axios from "axios";

const socket = io("http://localhost:8080");

async function test() {
  const res = await axios.post("http://localhost:8080/api/rooms");
  const code = res.data.room.code;
  
  socket.on("connect", () => {
    socket.emit("room:join", { code, username: "Tester", color: "#000" });
  });

  socket.on("room:state", (state) => {
    console.log("Joined perfectly, state:", state.players.length);
    process.exit(0);
  });
}
test();
