import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Chatroom from "./components/Chatroom";
import Welcome from "./components/Welcome";
import JoinRoom from "./components/JoinChatroom";
import SideBar from "./components/sidebar";
import Createroom from "./components/CreateRoom";
import LandingPage from "./components/LandingPage";
import EditRoom from "./components/EditRoom";
import DeleteUser from "./components/deleteUser"
import './App.css';

const App = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const location = useLocation();  // Get the current route path

  const handleRefresh = () => setRefreshKey((prev) => prev + 1);

  // Check if the current route is one of the pages where we don't want the sidebar
  const showSidebar = !(
    location.pathname === "/" ||
    location.pathname === "/signin" ||
    location.pathname === "/signup"
  );

  return (
    <div style={{ display: "flex" }}>
      {showSidebar && (
        <div
          className="sidebar"
          style={{
            background: "#cce0f0",
            borderRadius: "15px",
            boxShadow: "8px 8px 15px #b0c4de, -8px -8px 15px #e6f2ff",
            padding: "10px",
          }}
        >
          <SideBar key={refreshKey} />
        </div>
      )}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/Chatroom/:name" element={<Chatroom onLeaveRoom={handleRefresh} />} />
        <Route path="joinroom" element={<JoinRoom onJoin={handleRefresh} />} />
        <Route path="/createroom" element={<Createroom onCreate={handleRefresh} />} />
        <Route path="editroom" element={<EditRoom onUpdate={handleRefresh} />} />
        <Route path="/deleteuser" element={<DeleteUser onDelete={handleRefresh}/>} />
      </Routes>
    </div>
  );
};

export default App;
