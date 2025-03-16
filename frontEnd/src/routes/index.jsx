import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Menu from '../pages/Menu';
import Home from '../pages/Home';
import SignUp from '../pages/SignUp';
import Room from '../pages/Rooms';

function RoutesComponent() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signUp" element={<SignUp />} />
      <Route path="/menu" element={<Menu />} />
      <Route path='/rooms' element={<Room />} />
    </Routes>
  );
}

export default RoutesComponent;
