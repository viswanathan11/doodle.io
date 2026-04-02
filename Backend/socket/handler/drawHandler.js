import roomStore from "../../game/roomStore.js";
export default function regsisterDrawHadler(io,socket){
    socket.on("draw:stroke",({code,strokeData})=>{
        if(roomStore[code]){
            roomStore[code].strokes.push(strokeData)
        }
        socket.to(code).emit("draw:stroke",strokeData);
    })
}