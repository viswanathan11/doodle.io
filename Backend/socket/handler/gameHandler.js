

// Backend/socket/handler/gameHandler.js

const gameIntervals = {};

export default function startGame(io, code, room) {
    if (room && room.state === 'waiting') {
        room.state = 'playing';
        
        // Broadcast the new game state
        io.to(code).emit("game:state_changed", room.state);
        
        // Start the Clock
        let timeLeft = 60;
        room.timer = timeLeft;
        io.to(code).emit("timer:update", timeLeft);
        
        if (gameIntervals[code]) clearInterval(gameIntervals[code]);
        
        gameIntervals[code] = setInterval(() => {
            timeLeft--;
            room.timer = timeLeft;
            io.to(code).emit("timer:update", timeLeft);
            
            if (timeLeft <= 0) {
                clearInterval(gameIntervals[code]);
                delete gameIntervals[code];
                room.timer = null;
                room.state = 'waiting'; 
                io.to(code).emit("game:state_changed", room.state);
            }
        }, 1000);
        
        console.log(`[Game] Auto-Started in room ${code}`);
    }
}

export function stopGame(io, code, room) {
    if (gameIntervals[code]) {
        clearInterval(gameIntervals[code]);
        delete gameIntervals[code];
    }
    room.timer = null;
    room.state = 'waiting';
    io.to(code).emit("game:state_changed", room.state);
    console.log(`[Game] Stopped because not enough players`);
}

