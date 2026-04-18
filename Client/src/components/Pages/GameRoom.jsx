import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DrawingCanvas from '../Drawing/DrawingCanvas';
import { useSocket } from '../socket/SocketContext';
import Players from '../Features/Players';
import Chat from '../Features/Chat';
const Board = () => {
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    
    const socket = useSocket();
    const { code } = useParams();
    const navigate = useNavigate();
    const[players,setPlayers]=useState([]);
    const[gameState,setGameState]=useState('waiting');
    const[timer,setTimer]=useState(0);

    const copyRoomCode=()=>{
        navigator.clipboard.writeText(code);
        alert("Code has been Copied");
    }
    // THIS IS THE MISSING MAGIC!
    useEffect(() => {
        if (!socket) return;

        // 1. Grab their identity from sessionStorage so the server knows who is joining
        const userStr = sessionStorage.getItem('doodle_user');
        if (!userStr) {
            navigate('/'); // Kick them out if they bypassed the Home page!
            return;
        }

        const { username, color } = JSON.parse(userStr);

        // 2. TELL THE SERVER TO PUT THEM IN THE ROOM!
        socket.emit("room:join", { code, username, color });

        //3 RECIEVE THE INITIAL ROOM STATE (ALL CURRENT PLAYERS)
        socket.on("room:state", (roomState) => {
            console.log("Successfully joined the socket room!", roomState);
            //add the new guy to out existing list
            setPlayers(roomState.players);
            setGameState(roomState.state);
            setTimer(roomState.timer||0);
        });


        //4. LISTEN FOR PLAYERS JOINED

        socket.on("room:player_joined",(newPlayer)=>{
            //ADD THE NEW PLAYER TO THE LIST
            setPlayers((prevPlayers)=>[...prevPlayers,newPlayer]);
    });

        //5. LISTEN FOR PLAYE LEFT
        
        socket.on("room:player_left",({playerId,username})=>{
            console.log(`${username} left`);
            setPlayers((prevPlayers)=>prevPlayers.filter(p=>p.id!=playerId));
    });


        //listening to catch the live timer updates

        socket.on("game:state_changed",(newState)=>setGameState(newState));
        socket.on("timer:update",(timeLeft)=>setTimer(timeLeft));

        // 6. Cleanup when they close the browser or leave the page
        return () => {
            socket.emit("room:leave", { code });
            socket.off("room:state");
            socket.off("room:player_joined");
            socket.off("room:player_left")
            socket.off("game:state_changed");
            socket.off("timer:update");
        }
    }, [socket, code, navigate]);

    return (
        <div style={{display:'flex',
            alignItems:'center',
            justifyContent:'center',
            height:'100vh'
        }}>
        {/* THE ROOM CODE BADGE */}

        <div style={{
            position:'absolute',
            top:'20px',
            right:'20px',
            display:'flex',
            alignItems:'center',
            gap:'10px',
            backgroundColor:'#fff',
            padding:'6px 15px',
            borderRadius:'5px',
            border:'2px solid #000',
            boxShadow:'3px 3px 0px #000'
        }}>
            <span style={{
                fontWeight:'bold',
            }}>Code :&emsp; <span style={{ 
                letterSpacing: '1px', 
                fontSize: '1.2rem', 
                color : '#ff5722', 
                fontWeight: 'bold' }}>
                      {code}
                </span>
            </span>
            <button onClick={copyRoomCode}
            style={{
                display:'flex',
                alignItems:'center',
                justifyContent:'center',
                marginLeft:'10px',
                padding:'6px 10px',
                cursor:'pointer',
                backgroundColor:'#f0f0f0',
                border:'2px solid #000',
                borderRadius:'8px',
                fontWeight:'bold'
            }}>
                <svg 
                    version="1.1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 111.07 122.88" 
                    style={{ width: '16px', height: '16px', fill: '#000' }} 
                >
                    <g>
                        <path 
                            fillRule="evenodd" 
                            clipRule="evenodd" 
                            d="M97.67,20.81L97.67,20.81l0.01,0.02c3.7,0.01,7.04,1.51,9.46,3.93c2.4,2.41,3.9,5.74,3.9,9.42h0.02v0.02v75.28 v0.01h-0.02c-0.01,3.68-1.51,7.03-3.93,9.46c-2.41,2.4-5.74,3.9-9.42,3.9v0.02h-0.02H38.48h-0.01v-0.02 c-3.69-0.01-7.04-1.5-9.46-3.93c-2.4-2.41-3.9-5.74-3.91-9.42H25.1c0-25.96,0-49.34,0-75.3v-0.01h0.02 c0.01-3.69,1.52-7.04,3.94-9.46c2.41-2.4,5.73-3.9,9.42-3.91v-0.02h0.02C58.22,20.81,77.95,20.81,97.67,20.81L97.67,20.81z M0.02,75.38L0,13.39v-0.01h0.02c0.01-3.69,1.52-7.04,3.93-9.46c2.41-2.4,5.74-3.9,9.42-3.91V0h0.02h59.19 c7.69,0,8.9,9.96,0.01,10.16H13.4h-0.02v-0.02c-0.88,0-1.68,0.37-2.27,0.97c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v3.17 c0,19.61,0,39.21,0,58.81C10.17,83.63,0.02,84.09,0.02,75.38L0.02,75.38z M100.91,109.49V34.2v-0.02h0.02 c0-0.87-0.37-1.68-0.97-2.27c-0.59-0.58-1.4-0.96-2.28-0.96v0.02h-0.01H38.48h-0.02v-0.02c-0.88,0-1.68,0.38-2.27,0.97 c-0.59,0.58-0.96,1.4-0.96,2.27h0.02v0.01v75.28v0.02h-0.02c0,0.88,0.38,1.68,0.97,2.27c0.59,0.59,1.4,0.96,2.27,0.96v-0.02h0.01 h59.19h0.02v0.02c0.87,0,1.68-0.38,2.27-0.97c0.59-0.58,0.96-1.4,0.96-2.27L100.91,109.49L100.91,109.49L100.91,109.49 L100.91,109.49z"/>
                    </g>
                </svg>
            </button>
        </div>
        <div style={{ display: 'flex',
            justifyContent:'center',
            alignItems: 'flex-start',
            marginTop: '20px' 
            ,padding:'0 20px',
            width:'100%',
            gap:'30px'
        }}>
                {/* Left Column: Players */}
            <Players players={players}/>
            
            {/* --- MIDDLE COLUMN: GAME AREA --- */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: '0' }}>

                {/* THE GAME HEADER (Timer & Notifications) */}
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    width: '100%', marginBottom: '15px'
                }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                        {gameState === 'waiting' ? 'Waiting for Players...' : 'Drawing Phase!'}
                    </span>

                    {/* Auto-Start UI Logic */}
                    {gameState === 'waiting' ? (
                        <span style={{ fontWeight: 'bold', color: '#ff5722', fontSize: '0.9rem' }}>
                            🧍 Waiting for at least 2 players to start...
                        </span>
                    ) : (
                        <div style={{
                            padding: '5px 15px', border: '2px solid #000', borderRadius: '8px',
                            backgroundColor: '#fff', fontWeight: 'bold', fontSize: '1.5rem',
                            color: timer <= 10 ? '#f44336' : '#000', // Turns red in last 10s!
                            boxShadow: '3px 3px 0px #000'
                        }}>
                            ⏳ {timer}s
                        </div>
                    )}
                </div>

                <DrawingCanvas color={color} brushSize={brushSize} isDrawer={true} />

                {/* The Tool Panel */}
                <div className="glass-panel" style={{ marginTop: '20px', padding: '15px', display: 'flex', gap: '20px' }}>
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer' }}/>
                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ cursor: 'pointer' }}/>
                </div>
            </div>
            {/* ---------------------------------- */}
                
            {/* Right Column: Chat */}
            <Chat/>
        </div>
    </div>
    )
}

export default Board;