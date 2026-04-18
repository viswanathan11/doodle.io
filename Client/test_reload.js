import { io } from "socket.io-client";
import axios from "axios";

async function runTest() {
  const res = await axios.post("http://localhost:8080/api/rooms");
  const code = res.data.room.code;
  
  let socket1 = io("http://localhost:8080");
  socket1.on("connect", () => {
    socket1.emit("room:join", { code, username: "Sanji", color: "#f00" });
  });

  setTimeout(() => {
    let socket2 = io("http://localhost:8080");
    socket2.on("connect", () => {
      socket2.emit("room:join", { code, username: "Zoro", color: "#0f0" });
    });
    
    setTimeout(() => {
      console.log("Tab 1 reconnecting...");
      socket1.disconnect();
      setTimeout(() => {
        let socket1_reconnect = io("http://localhost:8080");
        socket1_reconnect.on("connect", () => {
          socket1_reconnect.emit("room:join", { code, username: "Sanji", color: "#f00" });
        });
        
        socket1_reconnect.on("room:state", (state) => {
          console.log("Tab 1 (reconnected) received room:state. Players:", state.players.length);
          console.log("State:", state);
          process.exit(0);
        });
      }, 500);
    }, 1000);
  }, 500);
}
runTest();
