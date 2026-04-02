# React Drawing & Canvas - Lessons Learned

> **Folder Purpose:** The `Drawing/` folder encapsulates the visual interactive canvas logic using WebGL/HTML5 via `react-konva`. It strictly handles capturing raw high-speed mouse and touch events, pushing `{x,y}` coordinate arrays into local React lines, and serving as the direct transmitter/receiver of live socket payload data without disrupting the rest of the HTML UI.

## 1. NEVER Import Backend Code into the Frontend
**The Error:** `import roomRouter from '../../../../Backend/routes/room';` placed inside `DrawingCanvas.jsx`.
**Why it happened:** Auto-import triggered by the IDE trying to find `roomStore` or `roomState`.
**The Danger:** The frontend (React/Vite) cannot compile Node.js core libraries. If you try to bundle backend code into the client, Vite will throw massive module-resolution errors and the page will blank out.
**The Fix:** Keep a strict mental boundary between `Client/` and `Backend/`. They can only ever speak to each other over HTTP (`axios.get`) or WebSockets (`socket.emit`).

## 2. The Missing "Hello" (`room:join`)
**The Error:** Real-time strokes weren't broadcasting because `ToolboxWrapper.jsx` was never actually telling the backend to put the client in the room.
**The Takeaway:** Just because your browser URL says `/room/XYZ` does *not* mean your Socket is in that room. The frontend MUST trigger an explicit `useEffect` on load to emit `socket.emit("room:join", code)`. Without doing that, the user is sitting alone in the main lobby, and `socket.to(code).emit` transmits to nobody.

## 3. Cleaning Up Socket Listeners
**The Issue:** Inside `useEffect()`, whenever we use `socket.on("event", fn)`, we must return a cleanup function using `socket.off("event", fn)`. 
**Why:** Because of React StrictMode and unmounting, failing to remove a listener causes React to attach *duplicate* listeners. Suddenly, one mouse stroke would draw 5 lines because 5 identical listeners fired at once!

## 4. `useRef` Boolean Evaluation
**The Error:** Writing `if (!isDrawing)` when `isDrawing` is a `useRef(false)`.
**The Lesson:** `useRef` returns an object: `{ current: false }`. An object is always truthy in Javascript, meaning `!isDrawing` always equals `false`. If you want to check the value, you must strictly use `!isDrawing.current`.
