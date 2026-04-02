# Project Doodle.io - Global Insights & Debugging

> **Folder Purpose:** This root directory is the absolute top-level workspace of the project. It outlines the overarching monolithic connection between the `Client/` (Vite, React, DOM UI) and the `Backend/` (Express, Node, Postgres), and holds unified project roadmaps like `implementation-v3.md`.

## Sockets: The Golden Path
Establishing real-time multiplayer drawing consists of 3 distinct hurdles. We solved them all today:

**1. The Auth & Connection**
- The user uses HTTP (`localhost:3000/api/rooms`) to instantiate the room database entry.
- The user transitions to WebSockets (`io`) on the Game Page.
- They MUST manually announce their presence: `socket.emit("room:join", ...)`.

**2. The Real-Time Broadcast**
- Client A emits the drawing metadata `socket.emit("draw:stroke", strokeData)`.
- Server catches it and acts as a megaphone using `socket.to(code).emit`. (Crucial: `.to(code)` guarantees Client A doesn't get their own line bounced back to them!).
- Client B hears it and does `setLines((prev) => [...prev, stroke])`. 

**3. The Late-Joiner Problem (State Synchronization)**
- Real-time broadcasts only work for people *currently* in the room. 
- If someone joins late, they need the history. By adding `strokes: []` to the `roomStore` RAM cache, we allow the socket server to send the Full Canvas History into the `room:state` payload when they join. 

## Mental Model to Remember:
**"The Frontend renders what the Backend commands."**
If something goes wrong (e.g., strokes aren't appearing):
1. **Did I emit?** (Check `Network Tab > WS messages` to see if Client A sent the payload).
2. **Did the server crash silently?** (Backend `TypeError`s will stop the `socket.to().emit` from running. Server terminal reading is your best friend).
3. **Is Client B listening?** (Check the `useEffect` on Client B to ensure it has `.on` registered).
4. **Is Client B actually in the Socket.IO room?** (Always log the `socket.join(code)` on the Node side to prove the room exists!).

Stay vigilant with Node file Extensions (`.js`) and separating logic Domains (NEVER cross paths between React/Vite logic and Node/Express logic).
