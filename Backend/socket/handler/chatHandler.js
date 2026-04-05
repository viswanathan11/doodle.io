// CHat Logic
import roomStore from "../../game/roomStore.js";

export default function registerChatHandler(io,socket){
    socket.on("chat:message",({code,message})=>{
        const room=roomStore[code];

        if(room){
            if(socket.username){
                io.to(code).emit("chat:message",{
                    username:socket.username,
                    color:socket.userColor,
                    message:message
                });

                console.log(`[chat] (${socket.username}) in ${code}: ${message}`);
            }
        }
    })
}