# React Components & State Management

> **Folder Purpose:** The `components/` directory houses the modular UI building blocks for the frontend React app. It strictly handles what the user sees and interacts with—ranging from macro full-page views inside `Pages/` down to utility wrappers like `SocketContext`—ensuring visual UI code stays totally separate from backend logic.

## 1. Component Naming Conveys Architecture 
**The Evolution:** We initially started with a file named `ToolboxWrapper.jsx` because we just wanted to wrap the Canvas with some HTML inputs.
**The Insight:** Over time, this component took on Socket Auth logic, HTTP Redirection, and full Layout rules. "Toolbox" became a terrible name.
**The Fix:** We renamed and moved it to `Pages/GameRoom.jsx`. A component's name should reflect its true scope in the hierarchy.

## 2. Maintaining User Sessions (The "Poor Man's Auth")
**The Issue:** When you move from the Home Page to the Game Room, React naturally forgets your `username` and `color` because they were stored in local `<Home />` state.
**The Fix:** Using `localStorage.setItem('doodle_user', JSON.stringify({username, color}))`. This allows the newly loaded `<GameRoom/>` to fetch who you are immediately on mount to establish your Socket identity. Note that we store both the identity *and* the Auth Token!

## 3. Dynamic UX using State
**Feature:** Putting the `Create Room` and `Join Room` flow on the exact same page using overlapping states.
**The Method:** By introducing `const [isJoinMode, setIsJoinMode] = useState(false);`, we were able to elegantly hide the "Create" buttons and replace them with "Input Code" fields without having to route the user to an entirely different page, making the app feel like Kahoot! or Skribbl.io.