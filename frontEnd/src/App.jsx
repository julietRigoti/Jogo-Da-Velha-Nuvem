import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Menu from './pages/Menu';
import Rooms from './pages/Rooms';
import Home from './pages/Home';

function App() {
  return (
    <GameProvider>
      <Router>
        <Routes>  
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Router>
    </GameProvider>
  );
}

export default App;
