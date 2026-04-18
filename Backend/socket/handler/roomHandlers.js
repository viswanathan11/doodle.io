import roomStore from "../../game/roomStore.js";
import  {startGame, stopGame } from "./gameHandler.js";
export default function registerRoomHandlers(io, socket) {


    //when server recieve a event room:join from client this is exected
    socket.on("room:join", ({ code, username, color }) => {
        //this gets the sepecific room and its state based on the code
            socket.username=username;
            socket.userColor=color;
        const room = roomStore[code];
        if (!room) {
            //send the error response to clients
            return socket.emit("error", { message: "Room not found" });
        }

        const exisitinPlayer= room.players.find(p=>p.username===username);
        if(exisitinPlayer){
            console.log(`[socket] user reconnected: ${username}`);
            
            // UPDATE their internal ID so they don't get erased by the delayed disconnect!
            const oldId = exisitinPlayer.id;
            exisitinPlayer.id = socket.id;
            
            // If they were drawing, give them the brush back!
            if (room.currentArtist === oldId) {
                room.currentArtist = socket.id;
            }
               
           // 1. Still join the socket room so they get live updates/chat
           socket.join(code);
    
           // 2. Send them the room state so they can see the players!
           // Protect the Word Data (Don't leak the real word or the options to guessers!)
           const safeRoom = {
               ...room,
               currentWord: room.currentArtist === socket.id ? room.currentWord : room.currentWord?.replace(/[a-zA-Z]/g, '_'),
               wordOptions: room.currentArtist === socket.id ? room.wordOptions : null
           };
           return socket.emit("room:state", safeRoom);
        }
        const newPlayer = {
            id: socket.id,
            username,
            color,
            score: 0
        };


        room.players.push(newPlayer);
        //join the internal socket.io room
        socket.join(code);

        //Send current room state to the player who just joined
        // Protect the Word Data (Don't leak the real word or the options to guessers!)
        const safeRoom = {
            ...room,
            currentWord: room.currentArtist === socket.id ? room.currentWord : room.currentWord?.replace(/[a-zA-Z]/g, '_'),
            wordOptions: room.currentArtist === socket.id ? room.wordOptions : null
        };
        socket.emit("room:state", safeRoom);


        //tell ever else in thsi room about the new player

        socket.to(code).emit("room:player_joined", newPlayer);

        console.log(`[socket] (${username}) (${socket.id}) joined room ${code}`);


        //If there are now 2 or more players,atuomatically start the game!

        if(room.players.length>=2 && room.state==='waiting'){
            startGame(io,code,room);
        }
    });


    socket.on("room:leave", ({ code }) => {
        handlePlayerLeave(io, socket, code);
    })

    //It automatically fires whenever a player 
    // suddenly loses their connection to the server.
    socket.on("disconnect", () => {
        //find which room they were in and remove them

        for (const code of Object.keys(roomStore)) {
            handlePlayerLeave(io, socket, code);
        }

        console.log(`[socket] User Disconnected: ${socket.id}`);
    })

}

//Helper function to handle when player wants to leave 
// or disconnects accidentaly

function handlePlayerLeave(io, socket, code) {
    const room = roomStore[code];

    if (room) {
        // Give them a 5-second grace period to reconnect before we officially delete them!
        setTimeout(() => {
            // Check if they are STILL in the array under their OLD socket ID.
            // If they reconnected, our 'room:join' logic updated their ID, so this will be -1!
            const playerIndex = room.players.findIndex(p => p.id === socket.id);

            if (playerIndex !== -1) {
                // They truly left forever. Remove them!
                const player = room.players.splice(playerIndex, 1)[0];

                socket.leave(code);

                io.to(code).emit("room:player_left", {
                    playerId: socket.id, username: player.username
                });

                console.log(`[Socket] ${player.username} (${socket.id}) officially left room ${code}`);

                // If players drop below 2, stop the game!
                if (room.players.length < 2 && room.state === 'playing') {
                    stopGame(io, code, room);
                }
            }
        }, 5000); // 5000ms = 5 seconds
    }
}