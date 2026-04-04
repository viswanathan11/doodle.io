import "./App.css";
import { SocketProvider } from "./components/socket/SocketContext";
import Home from "./components/Pages/Home";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Board from "./components/Pages/GameRoom";
function App() {
  return (
    <>
      <BrowserRouter>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/room/:code" element={<Board />}></Route>
          </Routes>
        </SocketProvider>
      </BrowserRouter>
    </>
  );
}

export default App;
