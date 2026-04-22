import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import "./config/db.js";
import authRouter from "./routes/authRouter.js"
import roomRouter from "./routes/room.js";
import { createServer } from "http";
import { Server } from "socket.io";
import registerRoomHandlers from "./socket/handler/roomHandlers.js";
import regsisterDrawHadler from "./socket/handler/drawHandler.js";
import registerChatHandler from "./socket/handler/chatHandler.js";
import { registerGameHandler } from "./socket/handler/gameHandler.js";
dotenv.config();

const app = new express();
//create an http server frin exoress app
const server = createServer(app);
//Intialize socket.io on top of the HTTP Server
const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "*",
        methods: ["GET", "POST"],
        credentials: true
    }
})



app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRouter);
app.use('/api/rooms', roomRouter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});


io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    //Register room event handler for this specific socket connection to the specific 
    //room code
    registerRoomHandlers(io,socket);
    regsisterDrawHadler(io,socket);
    registerChatHandler(io,socket);
    registerGameHandler(io,socket);
})

//NOTE: Using the server object we are sharring the same port number to 
//express and socket.io
server.listen(process.env.PORT, () => {
    console.log(`server is live on: http://localhost:${process.env.PORT}`);
})