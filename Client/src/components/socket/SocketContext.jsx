import { createContext,useState,useEffect, useContext } from "react";

import {io} from "socket.io-client";

const SocketContext=createContext();

//custom hook created
export const useSocket=()=>useContext(SocketContext);

export const SocketProvider=({children})=>{
    const socket=io(import.meta.env.VITE_BACKEND_URL );

    useEffect(()=>{

        //this hits whenever a user logs in the game
        //then automaticly a socket connection is created
        socket.on("connect",()=>{
            console.log("Connected:",socket.id);
        })
        
    },[]);

    return (
        // now all the children will get socket value
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    )
}