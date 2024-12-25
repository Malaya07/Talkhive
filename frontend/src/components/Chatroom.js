import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import SideBar from "./sidebar";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { SEND_MSG, LEAVE_ROOM } from "../graphql/mutation";
import { GET_USER, GET_ROOM_MSG } from "../graphql/queries";
import { NEW_MESSAGE_SUBSCRIPTION } from "../graphql/subscriptions";
import MessageCard from "./MessageCard";
import { FaPaperPlane } from "react-icons/fa"; // Importing the send icon

const ChatRoom = ({onLeaveRoom}) => {
  const { name } = useParams();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [err, seterror] = useState({});
  const [isParticipant, setIsParticipant] = useState(true); // New state
  const token = localStorage.getItem("jwt");
  const decoded = jwtDecode(token);
  const senderId = decoded?.userId;

  const bottomRef = useRef(null);

  const navigate = useNavigate();

  // Fetch sender information
  const { data: senderData } = useQuery(GET_USER, {
    variables: { userId: senderId },
  });
  const senderName = senderData?.user?.username;

  // Fetch existing messages
  const { data: getMessage, loading: msgLoad, error: errMsg } = useQuery(GET_ROOM_MSG, {
    variables: { chatroomname: name },
    fetchPolicy: "cache-and-network",
  });

  const [leaveroom] = useMutation(LEAVE_ROOM, {
    onCompleted: () => {
      console.log("Left the room");
      setIsParticipant(false); // Set to false after leaving the room
    },
    onError: (error) => console.error("Mutation error:", error),
  });

  // Mutation to send a new message
  const [sendMessage] = useMutation(SEND_MSG, {
    onCompleted(data) {
      const newMessage = data.createMessage;
      // Optimistically add the new message before mutation completes
      setMessages((prevMessages) => [...prevMessages]);
    },
    onError(err) {
      seterror(err);
    },
  });

  useEffect(() => {
    if (Array.isArray(getMessage?.messageByRoom)) {
      console.log(getMessage.messageByRoom);
      setMessages(getMessage.messageByRoom);
    }
  }, [getMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!text.trim()) return;
    sendMessage({
      variables: {
        text: text,
        chatroomname: name,
        sendername: senderName,
      },
    }).catch((error) => {
      seterror(error);
    });
    setText(""); // Clear the input after sending the message
  };

  const leave = () => {
    console.log("Leave initiated", name);
    leaveroom({
      variables: {
        chatroomname: name,
      },
    }).then(()=>{
      onLeaveRoom(); // Trigger refresh
      navigate("/welcome");
    }).catch((error) => console.error("Mutation error:", error));
  };

  const { data: subData } = useSubscription(NEW_MESSAGE_SUBSCRIPTION, {
    variables: { chatroomname: name },
    onError: (err) => console.error("Subscription error:", err),
  });

  useEffect(() => {
    if (subData?.newMessage) {
      console.log("New message received:", subData.newMessage);
      setMessages((prevMessages) => [...prevMessages, subData.newMessage]);
    }
  }, [subData]);

 
  return (
    <div style={{ display: "flex" , width:"100vw"}}>
      

      {/* Chat Content */}
      <div
        style={{
          flex: 1,
          marginLeft: "20px",
          display: "flex",
          flexDirection: "column",
          borderRadius: "15px",
          boxShadow: "8px 8px 15px #b0c4de, -8px -8px 15px #e6f2ff",
          background: "#eaf4fb",
          overflow: "hidden",
          backgroundImage: "url('/chat_back.jpg')",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "#eaf4fb",
            color: "#333",
            padding: "15px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between", // Align items to space apart
            boxShadow: "inset 4px 4px 8px #bcd1e0, inset -4px -4px 8px #ffffff",
          }}
        >
          {/* Chatroom Icon and Name */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "#cce0f0",
                color: "#333",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginRight: "15px",
                fontWeight: "bold",
                boxShadow: "4px 4px 8px #bcd1e0, -4px -4px 8px #ffffff",
              }}
            >
              {name && name[0].toUpperCase()}
            </div>
            <h2 style={{ margin: 0, fontSize: "1.2rem", color: "#333" }}>{name}</h2>
          </div>

          {/* Leave Room Button */}
          <button
            style={{
              padding: "8px 15px",
              backgroundColor: "#cce0f0",
              color: "#d9534f", // Red color for 'Leave' indication
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "bold",
              boxShadow: "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff",
              transition: "box-shadow 0.3s ease, transform 0.2s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "2px 2px 4px #b0c4de, -2px -2px 4px #ffffff")
            }
            onMouseLeave={(e) =>
              (e.target.style.boxShadow = "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff")
            }
            onMouseDown={(e) =>
              (e.target.style.boxShadow = "inset 4px 4px 8px #bcd1e0, inset -4px -4px 8px #ffffff")
            }
            onMouseUp={(e) =>
              (e.target.style.boxShadow = "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff")
            }
            onClick={leave}
          >
            Leave Room
          </button>
        </header>

        {/* Chat Messages */}
        <div
          style={{
            flex: 1,
            padding: "20px",
            overflowY: "auto",
            maxHeight: "calc(97vh - 200px)", // Adjust based on header/input field heights
            boxShadow: "inset 8px 8px 15px #bcd1e0, inset -8px -8px 15px #ffffff",
          }}
        >
          {msgLoad ? (
            <p>Loading Messages...</p>
          ) : errMsg ? (
            <p>Error in fetching Messages</p>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => (
              <MessageCard
                key={index}
                text={msg.message}
                date={Number(msg.createdAt)}
                sender={msg.sendername}
                direction={msg.sendername === senderName ? "end" : "start"}
                creatorpos={msg.sendername === senderName ? "right" : "left"}
              />
            ))
          ) : (
            <p style={{ textAlign: "center" }}>No messages yet</p>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Field */}
        <div
          style={{
            display: "flex",
            alignItems: "center", // Vertically align textarea and button
            padding: "15px",
            background: "#cce0f0",
            borderRadius: "15px",
            margin: "10px",
            boxShadow: "8px 8px 15px #b0c4de, -8px -8px 15px #e6f2ff",
          }}
        >
          <textarea
            placeholder="Enter a message"
            style={{
              flex: 1, // Allow textarea to take most of the space
              padding: "10px",
              border: "none",
              borderRadius: "10px",
              resize: "none",
              fontSize: "1rem",
              background: "#eaf4fb",
              boxShadow: "inset 4px 4px 8px #bcd1e0, inset -4px -4px 8px #ffffff",
              marginRight: "10px", // Add spacing between textarea and button
              minHeight: "40px", // Consistent height
            }}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            style={{
              padding: "8px 15px",
              backgroundColor: "#cce0f0",
              color: "#333",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "0.9rem",
              height: "40px", // Match textarea height
              boxShadow: "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff",
              transition: "box-shadow 0.3s ease, transform 0.2s ease",
            }}
            onClick={handleSendMessage}
            onMouseEnter={(e) =>
              (e.target.style.boxShadow = "2px 2px 4px #b0c4de, -2px -2px 4px #ffffff")
            }
            onMouseLeave={(e) =>
              (e.target.style.boxShadow = "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff")
            }
            onMouseDown={(e) =>
              (e.target.style.boxShadow = "inset 4px 4px 8px #bcd1e0, inset -4px -4px 8px #ffffff")
            }
            onMouseUp={(e) =>
              (e.target.style.boxShadow = "4px 4px 8px #b0c4de, -4px -4px 8px #ffffff")
            }
          >
            <FaPaperPlane size={20} /> {/* Send Icon */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;