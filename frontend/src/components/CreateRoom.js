import React, { useState, useEffect } from 'react';
import { useMutation, useSubscription } from '@apollo/client';
import { CREATE_ROOM } from '../graphql/mutation';
import { useNavigate } from 'react-router-dom';
import { ROOM_CREATED_SUBSCRIPTION } from '../graphql/subscriptions';
const CreateRoom = ({onCreate}) => {
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('')
    const [room, setRoom] = useState('')
    const [rooms, setRooms] = useState([])
    const [err, setError] = useState('')
    const navigate = useNavigate();
    const [newChatRoom, { loading, error }] = useMutation(CREATE_ROOM, {
        onCompleted: (data) => {
            console.log("Mutation completed with data:", data);
            if (data && data.createChatRoom) {
                console.log(data.createChatRoom)
                setRoom((prevroom) => [...prevroom, data.createChatRoom]);
                navigate("/welcome")
            } else {
                console.log("Data is incomplete or missing createRoom");
            }
        },
        onError: (err) => {
            console.log("Mutation error",err)
            setError(err.message)
        }
    });
   
    const {data:newRoomData } = useSubscription(ROOM_CREATED_SUBSCRIPTION,{
        onData: ({ data }) => {
            console.log("Received data from subscription:", data);
          },
          onError: (error) => {
            console.error("Subscription error:", error);
          },
    })
  

    const handleChange = (e) => {
        setRoomName(e.target.value);
        //setRoomId(e.target.value)
    };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Variables:", { id: roomId, name: roomName });
    newChatRoom({
        variables: {
            id: roomId,
            name: roomName,
        },
    }).then(()=>{
        onCreate()
    })
    console.log("done")
};


    return (
        <div className="create-room-container"  style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            overflow: "hidden",
            backgroundImage: "url('/back.gif')", // Replace with the path to your GIF
            backgroundSize: "cover",
            backgroundPosition: "center",
        }}>
            <div className="card">
                <h2>Create a Room</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-box">
                        <input
                            type="text"
                            value={roomName}
                            onChange={handleChange}
                            placeholder="Enter room name"
                            required
                        />
                    </div>
                    <div className="input-box">
                        <input
                            type="text"
                            value={roomId}
                            onChange={(e) => setRoomId(e.target.value)} // Use parentheses to call the function
                            placeholder="Enter room id"
                            required
                        />
                    </div>
                    <button type="submit" className="create-btn">Create Room</button>
                </form>
            </div>
        </div>
    );
};

export default CreateRoom;
