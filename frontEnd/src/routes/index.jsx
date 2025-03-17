import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import SignUp from '../pages/SignUp';
import CreateRoom from '../pages/CreateRoom';
import JoinRoom from '../pages/JoinRoom';
import JogoDaVelha from '../pages/GameJogoVelha';
function RoutesComponent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path='/create-room' element={<CreateRoom />} />
      <Route path='/join-room/:idSala' element={<JoinRoom />} />
      <Route path="/game" element={<JogoDaVelha />} />
    </Routes>
  );
}

export default RoutesComponent;
