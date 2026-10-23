import { BrowserRouter as Router, Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Profile from "../pages/Profile";
import Chat from "../pages/Chat";

const AppRoutes = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

export default AppRoutes;
