import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

export default function Home() {
  const [username, setUsername] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  
  // Controls whether we are showing the Join Code input or not
  const [isJoinMode, setIsJoinMode] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper function: Used by both Create and Join
  const loginGuest = async () => {
    const authRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/guest`, { username, color });
    sessionStorage.setItem('doodle_token', authRes.data.token);
    sessionStorage.setItem('doodle_user', JSON.stringify({ username, color }));
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter a username!");
    
    setLoading(true);
    try {
      await loginGuest();
      const roomRes = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/rooms`);
      navigate(`/room/${roomRes.data.inviteCode}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create room.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return alert("Please enter a username!");
    if (!joinCode.trim()) return alert("Please enter a room code!");
    
    setLoading(true);
    try {
      // Check if room exists
      await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rooms/${joinCode}`);
      await loginGuest();
      navigate(`/room/${joinCode}`);
    } catch (err) {
      console.error(err);
      alert("Room not found or invalid code!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div className="glass-panel" style={{ padding: '40px', width: '100%', maxWidth: '420px', textAlign: 'center' }}>
        
        <h1 style={{ marginTop: 0, marginBottom: '10px', fontSize: '3rem' }}>
          Doodle<span style={{ color: 'var(--primary)' }}>.io</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Draw, guess, and win.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* USERNAME & COLOR (Always visible) */}
          <input 
            type="text" 
            placeholder="Enter your username..." 
            className="input-premium"
            style={{ width: '100%', textAlign: 'center', fontSize: '1.2rem' }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={15}
          />

          <div>
            <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)' }}>Choose your marker</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {COLORS.map(c => (
                <div 
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '36px', height: '36px', backgroundColor: c, borderRadius: '50%', cursor: 'pointer',
                    border: '3px solid #1f2937',
                    boxShadow: color === c ? '4px 4px 0px #1f2937' : '2px 2px 0px #1f2937',
                    transition: 'all 0.1s',
                    transform: color === c ? 'translate(-2px, -2px)' : 'translate(0, 0)'
                  }}
                />
              ))}
            </div>
          </div>

          <hr style={{ borderTop: '2px dashed #e5e7eb', borderBottom: 'none', margin: '5px 0' }} />

          {/* DYNAMIC BUTTON AREA */}
          {!isJoinMode ? (
            // DEFAULT MODE
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <button onClick={handleCreateRoom} className="btn-primary" disabled={loading}>
                {loading ? 'Working...' : 'Create Private Room'}
              </button>
              
              <button 
                onClick={() => setIsJoinMode(true)} 
                className="btn-primary" 
                style={{ background: '#f5f5f5', color: '#1f2937' }}
              >
                Join Existing Room
              </button>
            </div>
          ) : (
            // JOIN MODE
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input 
                type="text" 
                placeholder="Paste Invite Code" 
                className="input-premium"
                style={{ textAlign: 'center', textTransform: 'uppercase', fontSize: '1.2rem' }}
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsJoinMode(false)} className="btn-primary" style={{ flex: 1, background: '#f5f5f5', color: '#1f2937' }}>
                   Back
                </button>
                <button onClick={handleJoinSubmit} className="btn-primary" style={{ flex: 2 }} disabled={loading}>
                   {loading ? 'Joining...' : 'Join Now'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
