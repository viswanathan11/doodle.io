# Skribbl.io Clone — My Implementation Plan

> Player picks a username + color → gets an invite link → hops in → plays.
> No signup. No friction. Just the game.

---

## What I Am Building (MVP)

- Player enters username + picks a color
- Creates or joins a private room via invite code
- Real-time multiplayer drawing and guessing game
- Scores tracked during the game session
- Game ends → leaderboard shown → room closes

**Phase 2 (later):** Persistent accounts, save stats, Google OAuth

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js + Express |
| Real-Time | Socket.IO |
| Frontend | React |
| Database | PostgreSQL (Neon.tech) |
| Live Game State | In-memory JS object |
| Auth | JWT (guest session only for MVP) |

---

## How It Works (Simple Flow)

```
1. Player opens app
2. Enters username + picks a color
3. Server creates a guest JWT with { userId, username, color }
4. Player creates a room → gets an invite code
5. Shares invite code with friends
6. Friends join via code → all land in lobby
7. Host starts game → game loop begins
8. Game ends → leaderboard → room destroyed
```

---

## What Gets Stored Where

### Neon PostgreSQL (permanent)
```
rooms     → room code, settings, status
words     → word bank for the game
scores    → final scores after game ends (optional for MVP)
```

### In-Memory JS Object (temporary, lives only during server session)
```js
// game/roomStore.js
const rooms = {}

// rooms['ABC123'] = {
//   players: [...],
//   state: 'drawing',
//   currentWord: 'elephant',
//   timer: null
// }
```
Dies when server restarts. Perfect for MVP.

### Socket.IO (no storage, just transport)
```
draw strokes → sent directly from drawer to all players, never stored
chat messages → sent directly to room, never stored
```

### Not stored anywhere (MVP)
```
player accounts → just a guest JWT, dies when they close the tab
```

---

## Database Schema

```sql
-- rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(8) NOT NULL UNIQUE,
  max_players SMALLINT DEFAULT 8,
  rounds SMALLINT DEFAULT 3,
  draw_time SMALLINT DEFAULT 80,
  status VARCHAR(16) DEFAULT 'waiting',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- words table
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word VARCHAR(100) NOT NULL,
  difficulty SMALLINT DEFAULT 1
);
```

That's it for MVP. No users table — players are guest sessions.

---

## Project Structure

```
backend/
├── config/
│   └── db.js              # PostgreSQL pool (pg library)
├── game/
│   └── roomStore.js       # In-memory rooms object
├── routes/
│   ├── auth.js            # POST /api/auth/guest
│   └── rooms.js           # POST /api/rooms, GET /api/rooms/:code
├── middleware/
│   └── authMiddleware.js  # Verify JWT on requests
├── db/
│   └── queries/
│       ├── rooms.js       # All room SQL queries
│       └── words.js       # Word bank queries
├── socket/
│   └── handlers/
│       ├── roomHandlers.js   # join, leave
│       ├── drawHandlers.js   # strokes, fill, undo, clear
│       ├── chatHandlers.js   # messages, guess detection
│       └── gameHandlers.js   # start, round, timer, scores
├── game/
│   ├── GameRoom.js        # Room state class
│   ├── RoundManager.js    # Turn logic + timers
│   ├── ScoreCalc.js       # Points formula
│   └── HintGenerator.js  # Letter reveal logic
└── index.js

frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx       # Username + color picker
│   │   ├── Lobby.jsx      # Room waiting screen
│   │   └── Game.jsx       # Active game
│   ├── components/
│   │   ├── canvas/
│   │   │   ├── DrawingCanvas.jsx
│   │   │   └── DrawingToolbar.jsx
│   │   ├── chat/
│   │   │   └── ChatPanel.jsx
│   │   └── game/
│   │       ├── PlayerList.jsx
│   │       ├── HintDisplay.jsx
│   │       ├── RoundTimer.jsx
│   │       └── Leaderboard.jsx
│   ├── socket/
│   │   └── socket.js      # Socket.IO client singleton
│   └── App.jsx
└── package.json
```

---

## REST API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/guest` | Submit username + color → get JWT |
| POST | `/api/rooms` | Create a new private room |
| GET | `/api/rooms/:code` | Get room info by invite code |

---

## Socket.IO Events

### Client → Server

| Event | Payload | When |
|---|---|---|
| `room:join` | `{ code, username, color }` | Player joins room |
| `room:leave` | — | Player leaves |
| `game:start` | — | Host starts game |
| `draw:stroke` | `{ points, color, size }` | Drawing |
| `draw:fill` | `{ x, y, color }` | Bucket fill |
| `draw:undo` | — | Undo |
| `draw:clear` | — | Clear canvas |
| `chat:message` | `{ text }` | Guess or chat |
| `word:choose` | `{ word }` | Drawer picks word |

### Server → Client

| Event | Payload | When |
|---|---|---|
| `room:state` | Full room snapshot | On join |
| `room:player_joined` | Player object | Broadcast |
| `room:player_left` | `{ playerId }` | Broadcast |
| `game:round_start` | `{ drawerId, wordLength }` | New round |
| `game:word_choices` | `[word, word, word]` | To drawer only |
| `game:hint` | `{ hint }` | At 50% and 25% time |
| `game:correct_guess` | `{ playerId, points }` | Someone guessed right |
| `game:round_end` | `{ word, scores }` | Round over |
| `game:end` | `{ leaderboard }` | Game over |
| `draw:stroke` | stroke data | To everyone except drawer |
| `chat:message` | `{ username, text }` | To everyone |
| `timer:tick` | `{ remaining }` | Every second |

---

## Game States

```
WAITING → WORD_SELECTION → DRAWING → ROUND_END → GAME_OVER
```

```js
const STATES = {
  WAITING:        'waiting',
  WORD_SELECTION: 'word_selection',
  DRAWING:        'drawing',
  ROUND_END:      'round_end',
  GAME_OVER:      'game_over'
}
```

---

## Score Formula

```js
// Guesser
const points = 500 + Math.floor((remainingSeconds / totalSeconds) * 500)

// Drawer — gets points for each correct guesser
const drawerPoints = correctGuessCount * 50
```

First to guess gets the most points. Late guesses get less.

---

## Hint System

- At 50% of draw time → reveal 1 random letter
- At 25% of draw time → reveal 1 more random letter
- Display: `_ l _ _ h _ _ t`

---

## Environment Variables

```env
PORT=3000
DATABASE_URL=postgresql://...from neon.tech...
JWT_SECRET=any-random-string
NODE_ENV=development
```

---

## Build Order (Step by Step)

### Step 1 — Backend Foundation
- [ ] Express server, `GET /health` returns 200
- [ ] PostgreSQL connected via `pg`
- [ ] In-memory `roomStore.js` created/
- [ ] `GET /api/rooms/:code` → returns room info
- [ ] Socket.IO setup, client connects, server logs it
- [ ] `room:join` handler → player added to room, room state sent back
- [ ] `room:player_joined` broadcast works

**Checkpoint: Two browser tabs join same room and see each other.**

### Step 3 — Canvas
- [ ] React canvas with Konva.js
- [ ] Draw strokes emit `draw:stroke` over Socket.IO
- [ ] Server broadcasts strokes to room
- [ ] Undo, clear, color picker, brush size working

**Checkpoint: Draw in one tab, see it in the other instantly.**

### Step 4 — Game Loop
- [ ] Seed word bank in PostgreSQL
- [ ] `game:start` triggers round manager
- [ ] Drawer receives 3 word choices
- [ ] Timer starts, `timer:tick` broadcasts every second
- [ ] Chat guess detection (server compares to current word)
- [ ] Correct guess → score calculated → broadcast
- [ ] Hints revealed at 50% and 25%
- [ ] Round ends → next drawer → repeat → game over

**Checkpoint: Full game plays start to finish.**

### Step 5 — UI Polish
- [ ] Username + color picker on Home page
- [ ] Lobby screen with player list + invite link
- [ ] Hint display component
- [ ] Score pop-ups
- [ ] Final leaderboard screen
- [ ] Mobile touch support on canvas

### Step 6 — Deploy
- [ ] Backend on Railway
- [ ] Frontend on Vercel
- [ ] Neon PostgreSQL connected in production
- [ ] Test full game in production

-