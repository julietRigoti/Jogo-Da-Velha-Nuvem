import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import CreateRooms from './pages/CreateRoom';
import Home from './pages/Home';
import JogoVelha from './pages/JogoVelha';
import NotFound from './pages/NotFound.jsx'; // Página 404

function PrivateRoute({ children }) {
  const isAuthenticated = true; // Substitua pela lógica de autenticação
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/criar-sala" element={<PrivateRoute><CreateRooms /></PrivateRoute>} />
          <Route path="/jogoVelha/:idSala" element={<PrivateRoute><JogoVelha /></PrivateRoute>} />
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;