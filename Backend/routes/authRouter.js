import express from "express";
import jwt from 'jsonwebtoken';
import {v4 as uuidv4} from "uuid";

const authRouter=express.Router();

//POST /api/auth/guest 

authRouter.post("/guest",(req,res)=>{
    const{username,color}=req.body;

    if(!username ||!color ){
        return res.status(400).json({
            error:"Username and color are required"
        });
    }

    const payload={
        userId:uuidv4(),
        username:username,
        color:color
    };

    const token=jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:'24h'//tokens expires in 24 hours
    });
    res.status(200).json({
        message:"Guest session started",
        token:token,
        user:payload
    })


})


export default authRouter;
