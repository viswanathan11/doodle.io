import express from "express";
import dotenv from "dotenv";
import cors from  "cors";
import "./config/db.js";
import authRouter from "./routes/authRouter.js"
import roomRouter from "./routes/room.js";
import{createServer} from "http";
import { Server } from "socket.io";
import { Socket } from "dgram";

dotenv.config();

const app=new express();
//create an http server frin exoress app
const server=createServer(app);
//Intialize socket.io on top of the HTTP Server
const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
})



app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.use('/api/rooms',roomRouter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});


io.on("connection",(Socket)=>{
    console.log(`User Connected: ${Socket.id}`);

    
})

//NOTE: Using the server object we are sharring the same port number to 
//express and socket.io
server.listen(process.env.PORT,()=>{
    console.log(`server is live on: http://localhost:${process.env.PORT}`);
})