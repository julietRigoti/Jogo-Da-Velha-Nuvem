import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Home from '../pages/Home';
import SignUp from '../pages/SignUp';
import CreateRoom from '../pages/CreateRoom';
import RoomList from '../pages/RoomList';
import JoinRoom from '../pages/JoinRoom';
import Room from '../pages/Room';


function RoutesComponent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path='/create-room' element={<CreateRoom />} />
      <Route path='/roomlist' element={<RoomList />} />
      <Route path='/join-room/:idSala' element={<JoinRoom />} />
      <Route path='/room/:idSala' element={<Room />} />
      
    </Routes>
  );
}

export default RoutesComponent;