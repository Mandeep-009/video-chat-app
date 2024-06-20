import React, { useEffect, useState } from 'react'
import { useSocket } from '../providers/Socket'
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const {socket} = useSocket();
    console.log(socket)
    const [email,setEmail] = useState('');
    const [roomID,setRoomID] = useState('');
    const navigate = useNavigate();

    const handleRoomJoined = ({ roomID }) => {
      console.log('room joined: ', roomID);
      navigate(`/room/${roomID}`);
    }

    useEffect(()=>{
      socket.on("joined-room", handleRoomJoined);
      return () => {
        socket.off("joined-room", handleRoomJoined);
      }
    }, [socket,handleRoomJoined])

    const handleJoinRoom = () => {
      socket.emit("join-room", { roomID , emailID: email })
    }
  return (
    <div>
        <div className="homepage-container">
            <div className="input-container">
                <input type="email" onChange={e => setEmail(e.target.value)} placeholder='Enter your email here' />
                <input type="text" onChange={e => setRoomID(e.target.value)} placeholder='Enter room code' />
                <button onClick={handleJoinRoom}>Enter Room</button>
            </div>
        </div>
    </div>
  )
}

export default Home