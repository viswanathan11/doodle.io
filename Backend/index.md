# Backend Core & Index (Architecture Notes)

> **Folder Purpose:** The `Backend/` directory contains the core Node.js/Express server. It is responsible for establishing REST API endpoints via Express, mounting standard web middlewares, connecting to the PostgreSQL database, instantiating the in-memory game state (`roomStore`), and simultaneously running both the HTTP Server and the Socket.IO engine.

## 1. Keep `index.js` Clean!
As the application grows, do not put all your `socket.on` logic inside the main `index.js` file.

**Best Practice:**
We successfully abstracted our Socket logic into handler functions inside `/socket/handler/`. 
In `index.js`, we simply import and inject the `(io, socket)` objects into these modules:
```javascript
import registerRoomHandlers from "./socket/handler/roomHandlers.js";
import registerDrawHandlers from "./socket/handler/drawHandler.js";

io.on("connection", (socket) => {
    registerRoomHandlers(io, socket);
    registerDrawHandlers(io, socket);
});
```
This ensures that `index.js` remains the "Command Center" while the heavy lifting happens deep in the logic files.

## 2. Redis vs Native In-Memory Stores
We discussed if Redis was necessary to store Canvas History.
**Lesson:** Redis is only needed for Horizontal Scaling (multiple Node.js instances). Since we have a Monolithic Single Server, storing temporary game state in a constant (`roomStore.js`) is perfectly acceptable, lightning-fast, and naturally "garbage collects" itself when the room key is deleted!