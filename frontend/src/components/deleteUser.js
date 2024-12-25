import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DELETE_USER } from "../graphql/mutation"; // Replace with your actual mutation
import { useMutation } from "@apollo/client";

const DeleteUser = ({ onDelete }) => {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [yourname, setyourname] = useState("")
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // GraphQL mutation to delete a user
  const [deleteUserMutation, { loading, error }] = useMutation(DELETE_USER, {
    onError: (error) => setErrorMessage(error.message),
    onCompleted: () => {
      setUsername("");
      setRoom("");
      if (onDelete) onDelete();
      navigate("/welcome");
    },
  });

  const handleDeleteUser = () => {
    const trimmedUsername = username.trim();
    const trimmedRoom = room.trim();
    const trimmedyourname = yourname.trim()

    if (!trimmedUsername || !trimmedRoom || !trimmedyourname) {
      setErrorMessage("Both fields are required.");
      return;
    }

    setErrorMessage(""); // Clear previous errors

    deleteUserMutation({
      variables: {
        username: trimmedUsername,
        chatroomname: trimmedRoom,
        yourname: trimmedyourname,
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
        <h1>Delete a User</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Room Name"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />
        <input
          type="text"
          placeholder="your user name"
          value={yourname}
          onChange={(e) => setyourname(e.target.value)}
        />
        <button onClick={handleDeleteUser} disabled={loading}>
          {loading ? "Deleting..." : "Delete User"}
        </button>
        <button
          style={{ marginTop: "10px" }}
          onClick={handleGoBack} // Corrected to use a function reference
        >
          Go Back
        </button>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </div>
    </div>
  );
};

export default DeleteUser;
