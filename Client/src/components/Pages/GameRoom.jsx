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
    
    const [players, setPlayers] = useState([]);
    const [gameState, setGameState] = useState('waiting');
    const [timer, setTimer] = useState(0);
    
    // NEW ONES FOR ROUND LOGIC:
    const [word, setWord] = useState('');
    const [artistId, setArtistId] = useState(null);
    const [wordOptions, setWordOptions] = useState([]);
    const [round, setRound] = useState(1);
    
    // Super powerful boolean we can use to flip UI elements based on whose turn it is!
    const isDrawer = socket?.id === artistId; 

    const copyRoomCode = () => {
        navigator.clipboard.writeText(code);
        alert("Code has been Copied");
    }

    useEffect(() => {
        if (!socket) return;

        const userStr = sessionStorage.getItem('doodle_user');
        if (!userStr) {
            navigate('/');
            return;
        }

        const { username, color } = JSON.parse(userStr);
        socket.emit("room:join", { code, username, color });

        // 1. Initial Load (Protected by backend)
        socket.on("room:state", (roomState) => {
            console.log("Joined Room:", roomState);
            setPlayers(roomState.players);
            setGameState(roomState.state);
            setTimer(roomState.timer || 0);
            setWord(roomState.currentWord || '');
            setArtistId(roomState.currentArtist || null);
            setWordOptions(roomState.wordOptions || []);
            setRound(roomState.round || 1);
        });

        // 2. Someone Joined/Left
        socket.on("room:player_joined", (newPlayer) => {
            setPlayers((prev) => [...prev, newPlayer]);
        });

        socket.on("room:player_left", ({ playerId, username }) => {
            setPlayers((prev) => prev.filter(p => p.id !== playerId));
        });

        // 3. Game Flow Listeners
        socket.on("game:state_changed", (newState) => {
            setGameState(newState);
            // If we revert to waiting, clear legacy text
            if (newState === 'waiting' || newState === 'intermission') {
                setWord('');
            }
        });
        
        socket.on("game:word_selection", (data) => {
            setArtistId(data.artist);
            setWordOptions(data.options || []);
        });
        
        socket.on("game:round_started", ({ state, artist, word }) => {
            setGameState(state);
            setArtistId(artist);
            setWord(word);
        });
        
        socket.on("timer:update", (timeLeft) => setTimer(timeLeft));
        
        // Kick them out if the server says the room crashed or no longer exists
        socket.on("error", ({ message }) => {
            alert("Error: " + message);
            navigate('/');
        }); 
        
        socket.on("game:scores_update", (updatedPlayers) => {
            setPlayers(updatedPlayers);
        });

        socket.on("game:round_update", (newRound) => setRound(newRound));
        
        socket.on("game:hint_update", (newHint) => {
            // Only update if we aren't the drawer (the drawer shouldn't have their word overwritten by underscores!)
            if (socket.id !== artistId) {
                setWord(newHint);
            }
        });

        return () => {
             socket.emit("room:leave", { code });
             socket.off("room:state");
            socket.off("room:player_joined");
            socket.off("room:player_left");
            socket.off("game:state_changed");
            socket.off("timer:update");
            socket.off("game:word_selection");
            socket.off("game:round_started");
            socket.off("game:score_update");
            socket.off("game:hint_update");
        }
    }, [socket, code, navigate, artistId]);

    return (
        <div className="game-page-wrapper">
            
            {/* THE ROOM CODE BADGE */}
            <div className="room-code-badge">
                <span style={{ fontWeight: 'bold' }}>Code :&emsp; <span style={{ letterSpacing: '1px', fontSize: '1.2rem', color: '#ff5722', fontWeight: 'bold' }}>{code}</span></span>
                <button onClick={copyRoomCode} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '10px', padding: '6px 10px', cursor: 'pointer', backgroundColor: '#f0f0f0', border: '2px solid #000', borderRadius: '8px', fontWeight: 'bold' }}>
                    Copy
                </button>
            </div>

            <div className="game-room-container">
                
                {/* Left Column: Players */}
                <Players players={players} currentArtist={artistId} />
                
                {/* --- MIDDLE COLUMN: GAME AREA --- */}
                <div className="game-center-col">

                    {/* THE GAME HEADER (Timer & Notifications) */}
                    <div className="game-header glass-panel">
                        <div className={`timer-box ${timer <= 10 ? 'urgent' : ''}`}>
                            <span style={{fontSize: '1.8rem'}}>⏱️</span> {timer}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, textAlign: 'center' }}>
                            {gameState === 'intermission' ? (
                                <span style={{ color: 'purple', fontSize: '1.5rem' }}>Round Over. Get Ready...</span>
                            ) : gameState === 'waiting' ? (
                                <span style={{ color: '#ff5722', fontSize: '1.2rem' }}>🧍 Waiting for at least 2 players...</span>
                            ) : gameState === 'word_selection' ? (
                                <span style={{ color: '#000', fontSize: '1.5rem' }}>Selecting Word...</span>
                            ) : (
                                <div className="word-box">{word}</div>
                            )}
                            {gameState !== 'waiting' && <div className="round-info">Round {round} / 3</div>}
                        </div>

                        <div style={{ width: '80px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: isDrawer ? 'green' : 'blue' }}>
                            {isDrawer ? '🖌️ Draw' : '🤔 Guess'}
                        </div>
                    </div>

                    {/* MID-COLUMN DYNAMIC AREA */}
                    {gameState === 'game_over' ? (
                        <div className="glass-panel" style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                            <h1 style={{ fontSize: '3rem', marginBottom: '10px' }}>🏆 PODIUM 🏆</h1>
                            <h3 style={{ color: '#666', marginBottom: '30px' }}>Final Standings</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '80%' }}>
                                {players.sort((a,b) => b.score - a.score).map((p, index) => (
                                    <div key={p.id} style={{
                                        padding: '15px 30px', border: '3px solid #000', borderRadius: '8px',
                                        backgroundColor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#cd7f32' : '#f0f0f0',
                                        fontWeight: 'bold', fontSize: '1.5rem', display: 'flex', justifyContent: 'space-between'
                                    }}>
                                        <span>#{index + 1} {p.username}</span>
                                        <span>{p.score} pts</span>
                                    </div>
                                ))}
                            </div>
                            <button 
                                onClick={() => navigate('/')}
                                className="btn-primary"
                                style={{ marginTop: '40px' }}>
                                Exit to Lobby
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* CANVAS WRAPPER (Includes Overlay) */}
                            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', width: '100%', flex: 1 }}>
                                
                                {gameState === 'word_selection' && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                                        backgroundColor: 'rgba(255,255,255,0.85)', zIndex: 10, borderRadius: '16px',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {isDrawer ? (
                                            <>
                                                <h2 style={{ marginBottom: '20px', fontFamily: 'sans-serif' }}>Select a Word</h2>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    {wordOptions.map(opt => (
                                                        <button key={opt} 
                                                            onClick={() => socket.emit("game:word_select", { code, word: opt })}
                                                            className="btn-primary">
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </>
                                        ) : (
                                            <h2>The Artist is picking a word...</h2>
                                        )}
                                    </div>
                                )}

                                <DrawingCanvas color={color} brushSize={brushSize} isDrawer={isDrawer} />
                            </div>

                            {/* The Tool Panel */}
                            {isDrawer && gameState === 'playing' && (
                                <div className="glass-panel" style={{ padding: '10px 15px', display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center' }}>
                                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ cursor: 'pointer', width: '40px', height: '40px', border: 'none', borderRadius: '5px' }}/>
                                    <input type="range" min="1" max="50" value={brushSize} onChange={(e) => setBrushSize(e.target.value)} style={{ cursor: 'pointer', flex: 1, maxWidth: '200px' }}/>
                                </div>
                            )}
                        </>
                    )}
                </div>
                
                {/* Right Column: Chat */}
                <Chat/>
            </div>
        </div>
    )
}

export default Board;
