// CHat Logic
import roomStore from "../../game/roomStore.js";

export default function registerChatHandler(io,socket){
    socket.on("chat:message",({code,message})=>{
        const room=roomStore[code];

        if(room){

            //find the sender in the room's players list using their socket ID
            const player=room.players.find(p=>p.id=== socket.id);

            if(player){
                io.to(code).emit("chat:message",{
                    username:player.username,
                    color:player.color,
                    message:message
                });

                console.log(`[chat] (${player.username}) in ${code}: ${message}`);
            }
        }
    })
}