import { useReducer } from "react";
import roomStore from "../../game/roomStore.js";

export default function registerRoomHandlers(io, socket) {
    //when server recieve a event room:join from client this is exected
    socket.on("room:join", ({ code, username, color }) => {
        //this gets the sepecific room and its state based on the code
        const room = roomStore[code];
        if (!room) {
            //send the error response to clients
            return socket.emit("error", { message: "Room not found" });
        }

        const exisitinPlayer= room.players.find(p=>p.username===username);
        if(exisitinPlayer){
            return console.lof(`[socket] rejected duplicate user: ${username}`);
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
        socket.emit("room:state", room);


        //tell ever else in thsi room about the new player

        socket.to(code).emit("room:player_joined", newPlayer);

        console.log(`[socket] (${username}) (${socket.id}) joined room ${code}`);
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
        const playerIndex = room.players.findIndex(p => p.id === socket.id);

        if (playerIndex !== -1) {
            const player = room.players.splice(playerIndex, 1)[0];

            socket.leave(code);

            io.to(code).emit("room:player_left", {
                playerId: socket.id, username: player.username
            });

            console.log(`[Socket] ${player.username} (${socket.id}) left room ${code}`);
        }
    }
}