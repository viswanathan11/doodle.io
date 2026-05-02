import React from "react";
import { useSocket } from "../socket/SocketContext";
import { useParams } from "react-router-dom";
import { useState,useRef} from "react";
import { useEffect } from "react";



const Chat = () => {
  const socket = useSocket();
  const{code}=useParams();
  const messageEndRef=useRef(null);//Reference for auto-scrolling


  const[message,setMessage]=useState([]);
  const[inputValue,setIntpuVlaue]=useState("");

  useEffect(()=>{
    messageEndRef.current?.scrollIntoView({behavior:'smooth'});
  },[message]);
  
  useEffect(()=>{
    if(!socket) return;

    socket.on("chat:message", (newMessage) => setMessage((prev) => [...prev, newMessage]));
    
    // NEW: Listen for System Messages (like "Sanji guessed the word!" or "Shhh!")
    socket.on("chat:system", (sysMsg) => setMessage((prev) => [...prev, { isSystem: true, ...sysMsg }]));

    return ()=>{
      socket.off("chat:message");
      socket.off("chat:system");
    }
  },[socket]);


  const handleMessage=(e)=>{
    if(e.key==="Enter" && inputValue.trim()!==""){
      socket.emit("chat:message",{
        code,
        message:inputValue,
      });
      setIntpuVlaue("");
    }
  }
  return (
    <div
      className="glass-panel side-panel"
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "15px",
      }}
    >
      <h3
        style={{
          textTransform: "uppercase",
          fontSize: "1.2rem",
          textAlign: "center",
          borderBottom: "2px solid #000",
          paddingBottom: "10px",
          marginBottom: "10px",
        }}
      >
        Chat
      </h3>

      {/* messge History Area */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f9f9f9",
          borderRadius: "10px",
          padding: "10px",
          overflowY: "auto",
          border: "1px solid #ddd",
        }}
      >
        <p
          style={{
            color: "green",
            margin: "5px 0",
          }}
        >
          <strong>System: </strong>Welcome to the room
        </p>

        {/* loop through your chat array and show each message!  */}
        {message.map((msg,index) => {
          // If it's a Server System Message
          if (msg.isSystem) {
            return (
              <div key={index} style={{ padding: '5px', color: msg.color || '#4CAF50', fontWeight: 'bold', textAlign: 'center', backgroundColor: 'rgba(0,0,0,0.05)', margin: '5px 0', borderRadius: '5px' }}>
                {msg.message}
              </div>
            );
          }
          
          // If it's a Winner's Ghost Message (completely green)
          if (msg.isGhost) {
             return (
              <div key={index} style={{ borderBottom: '1px solid #eee', padding: '5px', color: '#4CAF50', fontWeight: 'bold' }}>
                <span>{msg.username}: </span>
                <span style={{ marginLeft: '8px', wordBreak: 'break-word' }}>{msg.message}</span>
              </div>
            );
          }
          
          // Otherwise, Normal Chat Message
          return (
            <div key={index} style={{borderBottom:'1px solid #eee',padding:'5px'}}>
              <span style={{fontWeight:'bold',color:msg.color ||'#000'}}>{msg.username}:</span>
              <span style={{marginLeft:'8px',wordBreak:'break-word'}}>{msg.message}</span>
            </div>
          );
        })}

        {/* This invisible div is what we scroll to into view */}
        <div ref={messageEndRef}/>
      </div>

      {/* chat Input */}
      <div style={{ marginTop: "10px", display: "flex" }}>
        <input
          type="text"
          placeholder="Type your guess here..."
          value={inputValue}
          onChange={(e)=>setIntpuVlaue(e.target.value)}
          onKeyDown={handleMessage}
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ccc",
            outline: "none"
          }}
        ></input>
      </div>
    </div>
  );
};

export default Chat;
