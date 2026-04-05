Here are the **three code snippets** that are doing all the "magic" in your chat panel right now! 

### 1. The "Auto-Scroll" Logic
This is what makes the chat stay at the bottom automatically.

```jsx
// 1. The Reference Box (Like a bookmark)
const messageEndRef = useRef(null); 

// 2. The Auto-Pilot (Like a teleport)
useEffect(() => {
    // Every time a new message is added to your array, 
    // it scrolls the invisible "messageEndRef" into view.
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
}, [message]); 
```

**Why it works:**
The `[message]` inside the `useEffect` tells React to run this code every single time your `message` array changes. This is why you don't have to scroll manually—the browser does the work for you!

---

### 2. The "Box Security" (Layout)
This code prevents your chat from becoming infinite in height and breaking your layout.

```jsx
<div style={{
    flex: 1,              // 1. Fills all available space (pushes input to bottom)
    height: "100%",       // 2. Sets a limit on the total height
    overflowY: "auto",    // 3. MAGIC! Adds the scrollbar ONLY if needed
    padding: "15px",
    display: 'flex',      // 4. Sets up the columns inside 
    flexDirection: 'column',
    gap: '8px'
}}>
```

**Why it works:**
By setting `overflowY: "auto"`, you are telling CSS: "If my messages are taller than 600px, don't let them bleed out—instead, give me a scrollbar and keep them inside this box."

---

### 3. The "Word Wrap" (Text Safety)
This is what keeps long messages from breaking out horizontally and disappearing off-screen.

```jsx
<span style={{ 
    marginLeft: '8px', 
    wordBreak: 'break-word' // THIS IS THE MAGIC
}}>
    {msg.message}
</span>
```

**Why it works:**
`wordBreak: 'break-word'` allows the browser to split a word apart (even if it doesn't have spaces) and push the rest to the next line. Without this, your chat would "leak" out to the right and everything would looks broken! 

**Now that this is working, do you want to tackle the Timer or the round-logic next?**