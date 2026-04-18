// CHat Logic
import roomStore from "../../game/roomStore.js";
import {checkRoundEndEarly} from "./gameHandler.js"

export default function registerChatHandler(io,socket){
    socket.on("chat:message",({code,message})=>{
        const room=roomStore[code];

        if(!room || !socket.username) return;

        const player=room.players.find(p=>p.id===socket.id);
        if(!player) return;

        // ----WORD VERIFICATION LOGIC----

        if(room.state==='playing' && room.currentWord){
            if(socket.id===room.currentArtist){


                //If artist tried to reveal the word
                if(message.toLowerCase().includes(room.currentWord.toLowerCase())){
                    return socket.emit("chat:system",{
                        message:"shhh! you cnnot type the word while drawing!🤫",
                        color:'#f44336'
                    })
                }else{

                    //Did the Guess guess it Exactly?
                    if(message.toLowerCase().trim()===room.currentWord.toLowerCase()){
                        if(player.hasGuessed) return;

                        player.hasGuessed=true;

                        
                        // ---Point Distribution---

                        const timeRatio=room.timer/60;

                        const points=Math.floor(timerRatio*500);
                        player.score+=points;


                        const artist=room

                    }
                }
            }
        }
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