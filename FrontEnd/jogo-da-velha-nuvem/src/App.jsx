import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext'; // Atualizado para o novo GameProvider
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CreateRooms from './pages/CreateRoom';
import Home from './pages/Home';
import JogoVelha from './pages/JogoVelha';


function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/criar-sala" element={<CreateRooms />} />
          <Route path="/jogoVelha/:idSala" element={<JogoVelha />} />       
          <Route path="/" element={<Home />} />
          
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;