import React, { useEffect, useState } from "react";
import { useQuery, useSubscription, useApolloClient } from "@apollo/client";
import { GET_ALL_ROOMS, GET_USER } from "../graphql/queries";
import { ROOM_CREATED_SUBSCRIPTION, ROOM_UPDATED_SUBSCRIPTION } from "../graphql/subscriptions";
import UserCard from "./UserCard";
import {jwtDecode} from "jwt-decode";
import { useNavigate } from "react-router-dom";

const SideBar = ({ refreshKey }) => {
  const [rooms, setRooms] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [username , setUsername ] = useState("")
  const { loading: roomsLoading, data: roomsData, error: roomsError, refetch } = useQuery(GET_ALL_ROOMS);

  const token = localStorage.getItem("jwt");
  const decode = token ? jwtDecode(token) : null;
  //console.log(decode)
  const client = useApolloClient();
  const navigate = useNavigate();

  const { data: newRoomData } = useSubscription(ROOM_CREATED_SUBSCRIPTION);
  const { data: updatedRoomData } = useSubscription(ROOM_UPDATED_SUBSCRIPTION);

  const { data: userData, loading: userLoading } = useQuery(GET_USER, {
    variables: { userId: decode?.userId }
  });
  //console.log(userData)
  // Update avatar URL once user data is loaded
  useEffect(() => {
    if (userData) {
      const avatarSrc = userData?.user?.profilePicture || "";
      setAvatarUrl(avatarSrc);
      setUsername(decode.profilePicture)
    }
  }, [userData]);

  // Handle new room subscription
  useEffect(() => {
    if (newRoomData?.chatRoomCreated) {
      setRooms((prevRooms) => {
        const existingRoom = prevRooms.find(
          (room) => room.id === newRoomData.chatRoomCreated.id
        );
        if (!existingRoom) {
          return [...prevRooms, newRoomData.chatRoomCreated];
        }
        return prevRooms;
      });
    }
  }, [newRoomData]);

  useEffect(() => {
    refetch();
  }, [refreshKey, refetch]);

  if (!decode) {
    return <p className="sidebar-error">Invalid or missing token.</p>;
  }

  if (roomsLoading || userLoading) {
    return <p className="sidebar-loading">Loading chats...</p>;
  }

  if (roomsError) {
    console.error("Error fetching chat rooms:", roomsError.message);
    return <p className="sidebar-error">Failed to load chats: {roomsError.message}</p>;
  }

  const handleThreeDotsClick = () => {
    
    setDropdownVisible(!dropdownVisible);
  };

  const Welcomepage = () => {
    navigate("/welcome");
  };
  const handleDeleteUser = () => {
         navigate("/deleteuser")
        }
      
 const editRoom=()=>{
  navigate("/editroom");
 }

  return (
    <div
      className="sidebar-container"
      style={{
        background: "#d6e8f7",
        width: "235px",
        borderRadius: "15px",
        boxShadow: "8px 8px 15px #b0c5d9, -8px -8px 15px #ffffff",
        overflow: "auto",
        padding: "10px",
      }}
    >
      <div
        className="sidebar-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2
          className="sidebar-title"
          style={{
            color: "#333",
            margin: 0,
            fontSize: "1.5rem",
            cursor: "pointer",
          }}
          onClick={Welcomepage}
        >
          Talkhive
        </h2>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid #fff",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <img
              src={avatarUrl}
              alt="User Avatar"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
          <h3 style={{ color: "#333", margin: 0 }}>
            {userData?.user?.username || "User"}
          </h3>
        </div>
      </div>
      <hr
        className="sidebar-divider"
        style={{
          border: "none",
          height: "1px",
          background: "rgb(187, 193, 199)",
          marginBottom: "15px",
        }}
      />
      <div
        className="sidebar-users"
        style={{
          maxHeight: "70vh",
          overflowY: "auto",
          width: "75%",
          padding: "10px",
          backgroundImage: "url('/chat_back.jpg')",
          borderRadius: "10px",
          boxShadow: "inset 4px 4px 8px #b0c5d9, inset -4px -4px 8px #ffffff",
          margin: "0 auto",
        }}
      >
        {roomsData.getChatRooms.map((room, index) => (
          <div
            key={index}
            style={{
              background: "#f7faff",
              marginBottom: "10px",
              borderRadius: "10px",
              padding: "10px",
              boxShadow: "4px 4px 8px #b0c5d9, -4px -4px 8px #ffffff",
            }}
          >
            <UserCard roomname={room} />
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            cursor: "pointer",
            fontSize: "1.5rem",
            padding: "10px",
            borderRadius: "50%",
            boxShadow: "4px 4px 8px #a7bdd3, -4px -4px 8px #ffffff",
            backgroundColor: "#fff",
          }}
          onClick={handleThreeDotsClick}
        >
          &#8230;
        </div>
        <button
          className="sidebar-logout"
          style={{
            background: "#ffffff",
            color: "#333",
            border: "none",
            borderRadius: "10px",
            padding: "12px 25px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            boxShadow: "4px 4px 8px #a7bdd3, -4px -4px 8px #ffffff",
            cursor: "pointer",
          }}
          onClick={() => {
            localStorage.removeItem("jwt");
            client.clearStore();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
      {dropdownVisible && (
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            left: "0",
            backgroundColor: "#fff",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            width: "130px",
            padding: "5px",
            zIndex: "1000",
          }}
        >
          <button
            style={{
              background: "#f1f1f1",
              color: "#333",
              border: "none",
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={editRoom}
          >
            Edit room name
          </button>
          <button
            style={{
              background: "#f1f1f1",
              color: "#333",
              border: "none",
              width: "100%",
              padding: "8px",
              margin: "5px 0",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={handleDeleteUser}
          >
            Delete user
          </button>
        </div>
      )}
    </div>
  );
};

export default SideBar;


