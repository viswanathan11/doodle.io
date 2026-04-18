// CHat Logic
import roomStore from "../../game/roomStore.js";
import { checkRoundEndEarly } from "./gameHandler.js";

export default function registerChatHandler(io, socket) {
    socket.on("chat:message", ({ code, message }) => {
        const room = roomStore[code];

        if (!room || !socket.username) return;

        const player = room.players.find(p => p.id === socket.id);
        if (!player) return;

        // ----WORD VERIFICATION LOGIC----
        if (room.state === 'playing' && room.currentWord) {
            
            if (socket.id === room.currentArtist) {
                // If artist tried to reveal the word
                if (message.toLowerCase().includes(room.currentWord.toLowerCase())) {
                    return socket.emit("chat:system", {
                        message: "Shhh! You cannot type the word while drawing! 🤫",
                        color: '#f44336'
                    });
                }
            } else {
                // Did the Guesser guess it Exactly?
                if (message.toLowerCase().trim() === room.currentWord.toLowerCase()) {
                    if (player.hasGuessed) return;

                    player.hasGuessed = true;
                        
                    // ---Point Distribution---
                    const timeRatio = room.timer / 60;
                    const points = Math.floor(timeRatio * 500); // Fixed timerRatio typo
                    player.score += points;

                    const artist = room.players.find(p => p.id === room.currentArtist);
                    if (artist) artist.score += 50;

                    io.to(code).emit("chat:system", {
                        message: `🎉 ${player.username} guessed the word!`,
                        color: "#4CAF50"
                    });

                    // Sync the new scores/guessed status to everyone's UI
                    io.to(code).emit("game:scores_update", room.players); // Fixed spelling of event!

                    // check if EVERYONE guessed it to end early
                    // Ensure checkRoundEndEarly exists in gameHandler.js!
                    if (typeof checkRoundEndEarly === "function") {
                        checkRoundEndEarly(io, code, room);
                    }

                    // EXIT! Do not print the actual word into the public chat
                    return;
                }
            }

            // <--- SEGREGATE CHAT (Winner's CHAT) --->
            if (player.hasGuessed) { // Fixed "id" syntax error
                // send message ONLY to the artist and other people who have already guessed the word
                room.players.forEach((p) => { // Fixed room.player to room.players
                    if (p.hasGuessed || p.id === room.currentArtist) { // Fixed hasGuesed
                        io.to(p.id).emit("chat:message", {
                            username: socket.username,
                            color: socket.userColor, // Fixed socket.color
                            message: message,
                            isGhost: true // with this we can make the winner chat look special (like green text)
                        });
                    }
                });

                console.log(`[Winner Chat] ${socket.username}: ${message}`);
                return;
            }
        }
        
        // --- STANDARD Public CHAT ---
        io.to(code).emit("chat:message", {
            username: socket.username,
            color: socket.userColor,
            message: message
        });

        console.log(`[chat] (${socket.username}) in ${code}: ${message}`);
    });
}