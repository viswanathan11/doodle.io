import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DrawingCanvas from '../Drawing/DrawingCanvas';
import { useSocket } from '../socket/SocketContext';

const Board = () => {
    const [color, setColor] = useState("#000000");
    const [brushSize, setBrushSize] = useState(5);
    
    const socket = useSocket();
    const { code } = useParams();
    const navigate = useNavigate();

    // THIS IS THE MISSING MAGIC!
    useEffect(() => {
        if (!socket) return;

        // 1. Grab their identity from localStorage so the server knows who is joining
        const userStr = localStorage.getItem('doodle_user');
        if (!userStr) {
            navigate('/'); // Kick them out if they bypassed the Home page!
            return;
        }

        const { username, color } = JSON.parse(userStr);

        // 2. TELL THE SERVER TO PUT THEM IN THE ROOM!
        socket.emit("room:join", { code, username, color });

        // Listen for the confirmation message
        socket.on("room:state", (roomState) => {
            console.log("Successfully joined the socket room!", roomState);
        });

        // 3. Cleanup when they close the browser or leave the page
        return () => {
            socket.emit("room:leave", { code });
            socket.off("room:state");
        }
    }, [socket, code, navigate]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            {/* The Drawing Area */}
            {/* Note: we pass isDrawer=true just to test drawing! In the future this will depend on the game state */}
            <DrawingCanvas color={color} brushSize={brushSize} isDrawer={true} />

            {/* The Tool Panel */}
            <div className="glass-panel" style={{ marginTop: '20px', padding: '15px', display: 'flex', gap: '20px' }}>
                <input 
                    type="color" 
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    style={{ cursor: 'pointer' }}
                />

                <input 
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(e.target.value)}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </div>
    )
}

export default Board;