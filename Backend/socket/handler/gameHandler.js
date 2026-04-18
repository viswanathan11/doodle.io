import pool from "../../config/db.js";
import roomStore from "../../game/roomStore.js"; 

const gameIntervals = {};

// 1. Listeners
export function registerGameHandler(io, socket) {
    socket.on("game:word_select", ({ code, word }) => {
        const room = roomStore[code];
        // If click is valid, proceed to the drawing phase!
        if (room && room.state === 'word_selection' && socket.id === room.currentArtist) {
            startDrawingPhase(io, code, room, word);
        }
    });
}

// 2. Sequential Start Logic
export async function startGame(io, code, room) {
    if (room && room.state === 'waiting') {
        room.state = 'word_selection';
        
        if (!room.round) room.round = 1; // Start at Round 1
        
        // --- SEQUENTIAL ARTIST LOGIC ---
        // If this is a brand new room, start at index 0.
        if (room.artistIndex === undefined) room.artistIndex = 0;
        
        // If the index goes beyond the player list (e.g. Turn finished, or someone left)
        if (room.artistIndex >= room.players.length) {
            room.artistIndex = 0; // Wrap back to the first player
            room.round++;         // ...and increase the NeonDB Round difficulty!
            
            io.to(code).emit("game:round_update", room.round); // Tell clients!
            
            // TASK 4: END GAME AFTER ROUND 3
            if (room.round > 3) {
                return handleGameOver(io, code, room);
            }
        }
        
        room.currentArtist = room.players[room.artistIndex].id;
        // -------------------------------

        // Fetch 3 random words based on Round difficulty!
        try {
            const query = "SELECT word FROM words WHERE difficulty = $1 ORDER BY RANDOM() LIMIT 3";
            const result = await pool.query(query, [room.round]);
            room.wordOptions = result.rows.map(r => r.word); 
        } catch (err) {
            console.error("DB Error fetching words:", err);
            room.wordOptions = ["EMERGENCY", "DATABASE", "ERROR"]; 
        }

        io.to(code).emit("game:state_changed", room.state);

        room.players.forEach((player) => {
            const isArtist = player.id === room.currentArtist;
            io.to(player.id).emit("game:word_selection", { 
                artist: room.currentArtist, 
                options: isArtist ? room.wordOptions : null 
            });
        });
        
        room.timer = 10;
        io.to(code).emit("timer:update", room.timer);
        
        if (gameIntervals[code]) clearInterval(gameIntervals[code]);
        
        gameIntervals[code] = setInterval(() => {
            room.timer--;
            io.to(code).emit("timer:update", room.timer);
            
            if (room.timer <= 0) {
                // Auto-pick if they take too long!
                startDrawingPhase(io, code, room, room.wordOptions[0]);
            }
        }, 1000);
    }
}

// 3. Drawing Phase
function startDrawingPhase(io, code, room, chosenWord) {
    if (gameIntervals[code]) clearInterval(gameIntervals[code]);
    
    room.state = 'playing';
    room.currentWord = chosenWord;
    
    room.players.forEach((player) => {
        const isArtist = player.id === room.currentArtist;
        const wordPayload = isArtist ? room.currentWord : room.currentWord.replace(/[a-zA-Z]/g, '_');
        io.to(player.id).emit("game:round_started", {
            state: room.state,
            word: wordPayload,
            artist: room.currentArtist
        });
    });
    
    // NEW: Reset the guessing states for the new round!
    room.players.forEach(p => p.hasGuessed = false);
    
    room.timer = 60;
    io.to(code).emit("timer:update", room.timer);
    
    gameIntervals[code] = setInterval(() => {
        room.timer--;
        io.to(code).emit("timer:update", room.timer);
        
        if (room.timer <= 0) {
            clearInterval(gameIntervals[code]);
            
            // --- TURN OVER LOGIC ---
            room.timer = null;
            room.currentArtist = null;
            room.currentWord = null;
            room.strokes = []; // Clear server memory of the drawing!
            
            // Tell all clients to wipe their canvases
            io.to(code).emit("draw:clear_board");
            
            // Prime the index for the NEXT player
            room.artistIndex++;   
            
            // Tell clients we are pausing briefly
            room.state = 'intermission';
            io.to(code).emit("game:state_changed", room.state);
            
            // Wait 3 seconds, then auto-start the next turn!
            setTimeout(() => {
                room.state = 'waiting'; 
                if (room.players.length >= 2) {
                    startGame(io, code, room);
                } else {
                    io.to(code).emit("game:state_changed", room.state);
                }
            }, 3000);

        }
    }, 1000);
}

export function stopGame(io, code, room) {
    if (gameIntervals[code]) clearInterval(gameIntervals[code]);
    room.timer = null;
    room.state = 'waiting';
    room.currentArtist = null;
    room.currentWord = null;
    
    io.to(code).emit("game:state_changed", room.state);
}

export function checkRoundEndEarly(io, code, room) {
    if (room.state !== 'playing') return;
    
    // Are there any guessers who HAVEN'T guessed the word?
    const missingGuessers = room.players.filter(p => p.id !== room.currentArtist && !p.hasGuessed);
    
    if (missingGuessers.length === 0) {
        // Everyone guessed it!
        io.to(code).emit("chat:system", { 
            message: `Everyone guessed the word! It was '${room.currentWord}'`, 
            color: "#FF9800" 
        });
        
        // Force the timer to 0 so the existing logic stops the round instantly!
        room.timer = 0;
    }
}

function handleGameOver(io, code, room) {
    if (gameIntervals[code]) clearInterval(gameIntervals[code]);
    room.state = 'game_over';
    room.timer = null;
    room.currentArtist = null;
    room.currentWord = null;
    
    // Tell clients game is over so they display the Podium
    io.to(code).emit("game:state_changed", room.state);
    
    // Automatically kick everyone back to home in exactly 10 seconds!
    setTimeout(() => {
        io.to(code).emit("error", { message: "The game is complete! Thank you for playing." });
        room.players = [];
    }, 10000);
}

