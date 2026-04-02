import express from "express"
import pool from "../config/db.js"
import roomStore from "../game/roomStore.js"
import {randomBytes} from "crypto";
const roomRouter = express.Router();

const generateRoomCode = () => {
    return randomBytes(3).toString("hex").toUpperCase();
}

//POST /api/rooms-> Create a new Room
roomRouter.post('/', async (req, res) => {
    const code = generateRoomCode();

    try {
        const querry = `
        INSERT INTO rooms(code,status)
        values($1,'waiting')
        RETURNING id,code,status,created_at;`
        const result = await pool.query(querry, [code]);
        console.log(result);
        const dbRoom = result.rows[0];

        //Intialize temproary in-memory store for this room

        roomStore[code] = {
            players: [],
            state: 'waiting',
            currentWord: null,
            timer: null,
            strokes:[]
        };

        res.status(201).json({
            message: "Room created successfully",
            room: dbRoom,
            inviteCode: code
        });


    } catch (err) {
        return res.status(500).json({ error: "Failed to create Room" });
        console.log(err);
    }
})


//Get api/rooms/:Code -> Get room info using the invite code

roomRouter.get("/:code", async (req, res) => {
    const { code } = req.params;

    try {
        const query = "SELECT * FROM rooms WHERE code =$1";
        const result = await pool.query(query, [code]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.status(200).json({
            room: result.rows[0],
            liveState: roomStore[code] || null
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Failed to fetch room details" });
    }
})

export default roomRouter;