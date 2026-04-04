import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Chat from './components/Features/Chat.jsx'
import Players from './components/Features/Players.jsx'
import PlayerCard from './components/Features/PlayerCard.jsx'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App/>
  </StrictMode>,
)
