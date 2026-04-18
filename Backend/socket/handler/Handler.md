# Backend Sockets (Handler) - Debugging & Best Practices

> **Folder Purpose:** This `handler/` directory encapsulates all real-time Socket.IO event listeners and emitters. Instead of bloating the main server file, we split networking functions into domains (like `roomHandlers` for lobby logic and `drawHandlers` for canvas sync). It handles listening for client events, interacting with the server RAM (`roomStore`), and broadcasting updates back to clients.

This document chronicles the key lessons learned while building the `roomHandlers` and `drawHandler` logic for the Doodle.io backend.

## 1. The "Silent Crash" (Type Errors in Sockets)

**The Error:** `TypeError: Cannot read properties of undefined (reading 'push')` occurred when trying to execute `roomStore[code].strokes.push(strokeData);`.
**Why it happened:** When `room.js` initially created the room, it forgot to initialize `strokes: []`.
**The Danger:** In Node.js, an unhandled exception inside a Socket.IO handler completely _halts_ that specific function. This means the broadcast line `socket.to(code).emit(...)` never ran, killing real-time collaboration silently!
**The Fix:** Always guarantee your initial data structures match what your handlers expect.

## 2. Event Name Typos

**The Error:** Listening to `"draw:stoke"` instead of `"draw:stroke"`.
**Why it happened:** A simple typo on the frontend or backend.
**The Fix:** Sockets rely strictly on strings. A 1-letter typo means the event goes into the void. It is often helpful to type your socket event names as Constants (e.g., `const DRAW_STROKE = 'draw:stroke'`) to prevent this.

## 3. Node.js ES Modules Extension Rule

**The Error:** `import roomStore from "../../game/roomStore"` caused the server to crash.
**The Fix:** Unlike React/Vite, pure Node.js using ES Modules (`"type": "module"`) strictly requires you to type the `.js` extension at the end of local file imports.
-> `import roomStore from "../../game/roomStore.js";`

## 4. The "Ghost Town" Reconnect (Nodemon RAM Wipes)

**The Error:** After restarting the server to apply changes, clients couldn't broadcast to each other, even though they were on `/room/ABC`.
**Why it happened:** Our `roomStore` is an in-memory variable (Server RAM). When `nodemon` restarted the server, all existing rooms were permanently deleted. But the browser tabs were still trying to join the old codes!
**The Takeaway:** When testing in development, every time you reboot the backend, you must go back to the front-end Home Page and create a brand new room.

## 5. The "Circular JSON" Crash (Node.js Timers)
*(Date: 2026-04-17)*

**The Error:** `TypeError: Converting circular structure to JSON` and `RangeError: Maximum call stack size exceeded`.
**Why it happened:** We tried to store a Node.js `setInterval` return value (`Timeout` object) directly inside our `room` object (`room.intervalId = setInterval(...)`). When Socket.io tried to broadcast the `room` over the network using `socket.emit("room:state", room)`, it tried to convert the `Timeout` object to JSON. Because `Timeout` objects are infinitely circular, the server choked and instantly crashed.
**The Fix:** We created an entirely separate memory dictionary `const gameIntervals = {}` inside `gameHandler.js`. This keeps the massive `Timeout` machinery isolated on the server and completely out of the simple `room` data that gets sent to clients!

## 6. Auto-Starting & Auto-Stopping the Game
*(Date: 2026-04-17)*

**The System:** Instead of relying on a human clicking a UI button, we enforce start/stop rules natively on the server:
- **Auto-Start:** In `roomHandlers.js`, right after someone joins, we check `if (room.players.length >= 2 && room.state === 'waiting')`. If true, the server automatically fires the timer!
- **Auto-Stop:** In `handlePlayerLeave`, we check `if (room.players.length < 2 && room.state === 'playing')`. If true, we clear the internal loop and safely reset `room.state = 'waiting'`.
