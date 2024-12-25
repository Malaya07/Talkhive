import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EDIT_ROOM } from "../graphql/mutation"; // Replace with your actual mutation
import { useMutation } from "@apollo/client";

const EditRoom = ({ onUpdate }) => {
  const [roomname, setRoomname] = useState("");
  const [updatedRoomname, setUpdatedRoomname] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const [editRoom, { loading }] = useMutation(EDIT_ROOM, {
    onError: (error) => setErrorMessage(error.message),
    onCompleted: () => {
      setRoomname("");
      setUpdatedRoomname("");
      onUpdate();
      navigate("/welcome");
    },
  });

  const handleEditRoom = () => {
    const trimmedRoomname = roomname.trim();
    const trimmedUpdatedRoomname = updatedRoomname.trim();

    if (!trimmedRoomname || !trimmedUpdatedRoomname) {
      setErrorMessage("Both fields are required.");
      return;
    }

    setErrorMessage(""); // Clear previous errors

    editRoom({
      variables: {
        chatroomname: trimmedRoomname,
        updatedname: trimmedUpdatedRoomname,
      },
    });
  };

  const handleGoBack = () => {
    navigate("/welcome");
  };

  return (
    <div
      className="join-container"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        backgroundImage: "url('/back.gif')", // Replace with the path to your GIF
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="card">
        <h1>Edit Chatroom</h1>
        <input
          type="text"
          placeholder="Room name"
          value={roomname}
          onChange={(e) => setRoomname(e.target.value)}
        />
        <input
          type="text"
          placeholder="Updated Room Name"
          value={updatedRoomname}
          onChange={(e) => setUpdatedRoomname(e.target.value)}
        />
        <button onClick={handleEditRoom} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          style={{ marginTop: "10px" }}
          onClick={handleGoBack} // Corrected to use a function reference
        >
          Go Back
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      </div>
    </div>
  );
};

export default EditRoom;
