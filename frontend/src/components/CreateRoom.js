import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { CREATE_ROOM } from '../graphql/mutation';
import { useNavigate } from 'react-router-dom';

const CreateRoom = () => {
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('')
    const [room, setRoom] = useState('')
    const [err, setError] = useState('')
    const navigate = useNavigate();
    const {data:newChatRoom, loading, error } = useMutation(CREATE_ROOM, {
        onCompleted: (data) => {
            setRoom((prevroom)=>[...prevroom])
            navigate("/welcome")

        },
        onError: () => setError(error.message)
    })

    const handleChange = (e) => {
        setRoomName(e.target.value);
        //setRoomId(e.target.value)
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to create a room (e.g., sending data to backend)
        //alert(`Room Created: ${roomName}`);

        newChatRoom({
            variables: {
                id: roomId,
                name: roomName
            }
        })
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
