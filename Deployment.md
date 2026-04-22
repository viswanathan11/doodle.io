# Deployment Guide & Common Mistakes To Avoid

This document explains the most common issues that occurred when deploying the Doodle.io application (React/Vite Frontend on Vercel & Node.js/Express/Socket.io Backend on Render). 

When shifting from your local computer to the cloud (Production), everything changes slightly. Here is a layman’s breakdown of every mistake that happened during deployment and how they were fixed.

---

### 1. The "Invisible Variables" Mistake (The `.env` File Doesn't Upload)

**What went wrong:** 
On your local computer, you have a `.env` file holding all your secret URLs (like `VITE_BACKEND_URL` or `DATABASE_URL`). When you push your code to GitHub, the `.env` file is hidden and completely ignored for security. 
Because of this, when Vercel and Render downloaded your code from GitHub to deploy it, they essentially loaded "blank" variables.

**The Fix:**
You have to manually log in to the Render Dashboard and the Vercel Dashboard, go to their respective "Environment Variables" settings, and paste the keys and values there by hand. The cloud platforms need to be told explicitly what your variables are.

### 2. The "Unbaked Cake" Mistake (Vite Environment Variables)

**What went wrong:** 
In the backend (Render), if you add a new environment variable, the server instantly restarts and begins using it. 
However, the frontend (built with Vite on Vercel) doesn't work like that. Vite builds a static website—think of it like baking a cake. If you forget to add sugar (`VITE_BACKEND_URL`) before baking, injecting sugar into the oven afterward won't fix the cake. 
Because the variable was added to Vercel *after* the initial deployment but the site wasn't rebuilt, the code simply compiled as `undefined`. This is why your browser was trying to search for `undefined/api/auth/guest` and throwing an error.

**The Fix:**
Whenever you add or change an environment variable on the frontend (Vercel, Netlify, etc.), you **MUST trigger a Redeploy**. Redeploying "re-bakes" the code so Vite can successfully embed the new variables directly into the HTML and JavaScript. 

### 3. The Strict "CORS" Bouncer

**What went wrong:**
Browsers have a strict security policy called CORS (Cross-Origin Resource Sharing). It acts like a bouncer at a club. If your backend (Render) doesn't explicitly look at the VIP list and say "Yes, this Vercel website is allowed to talk to me," the browser will block the connection. Initially, the backend was configured to look for the exact `FRONTEND_URL`. If there is a slight mismatch (even a typo), the connection drops entirely.

**The Fix:**
We updated `Backend/index.js` to intelligently fall back to allowing `*` (any origin) if it couldn't perfectly match the URL, and to specifically support sending credentials across different domains, ensuring that Vercel is never instantly rejected when trying to launch a Socket.io bridge.

### 4. The "Double Slash" Typo Attack 

**What went wrong:**
This was the most invisible and annoying mistake! When you added the `VITE_BACKEND_URL` to Vercel, you pasted:
`https://doodle-io-lwev.onrender.com/` (Notice the slash `/` at the very end).

In the frontend React code, we were making requests like this:
`axios.post( import.meta.env.VITE_BACKEND_URL + "/api/rooms" )`

When the computer combined the two together, it created this:
`https://doodle-io-lwev.onrender.com//api/rooms` 
*(Look closely at the `//` before the `api`)*.

Express.js (your backend framework) evaluates routes strictly. It looks at `//api` and says, "I don't have a route called `//api`, I only have `/api`!" and immediately sends a `404 Not Found` error. Surprisingly, Socket.io *does* ignore double slashes, which is why your socket connected successfully but your API requests crashed.

**The Fix:**
We added a smart cleaner directly into your React code:
```javascript
const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/+$/, "");
```
This line automatically scrubs away any accidental slashes at the end of the URL before it interacts with your API.

### 5. The SPA "Refresh" Crash (React Router 404)

**What went wrong:**
React is a "Single Page Application" (SPA). Even when you navigate to URLs like `/room/XYZ`, you are still physically on `index.html`—React just fakes the URL change magically in the browser. 
But when you hit the "Refresh" button while inside `/room/XYZ`, your browser sends a hard request to Vercel asking for a folder called `/room/XYZ/`. Since that folder literally doesn't exist on the server (only `index.html` exists), Vercel panics and returns a generic 404 Not Found error. This only happens in production, not on your local machine, because Vite's local dev server handles this automatically!

**The Fix:**
We created a `vercel.json` file to act as a traffic cop. We gave it a strictly defined "Rewrite Rule": 
*"If a user requests any path, ignore it and just serve them `index.html`."* 
This ensures React is always loaded first, allowing React Router to successfully figure out which room to display without crashing.

---

## 📌 Things To Always Remember (Do Not Make These Mistakes!)

- **Always REDEPLOY Frontends:** If you ever touch an Environment Variable in Vercel, it does absolutely nothing until you hit the "Redeploy" button. Backend changes apply instantly; frontend changes require a completely new build.
- **Never end a Base URL with a slash (`/`):** When declaring `BACKEND_URL` or `FRONTEND_URL` variables anywhere, always format them as `http://domain.com` without the final slash. Double slashes break routing engines.
- **Root Folders Matter in Render:** When deploying a backend on Render, always ensure the Root Directory in the settings points to `Backend/` (or wherever your package.json lives). If it targets the parent folder, it will crash trying to find the server startup file.
- **Local `.env` is Local Only:** Never assume the cloud knows what your local passwords/URLs are. You will always need to manually configure them in the hosting dashboard.
- **SPA's Need Rewrite Rules:** If you ever build a React app with multiple pages using `react-router-dom` and deploy it, you **must** include a `vercel.json` (or equivalent) to rewrite all traffic to `index.html` so refreshing doesn't cause a 404 error.
