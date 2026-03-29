import express from "express";
import dotenv from "dotenv";
import cors from  "cors";
import "./config/db.js";
import authRouter from "./routes/authRouter.js"
import roomRouter from "./routes/room.js";
dotenv.config();

const app=new express();

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRouter);
app.use('/api/rooms',roomRouter);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

app.listen(process.env.PORT,()=>{
    console.log(`server is live on: http://localhost:8080`);
})