import React, { useCallback, useState , useEffect } from 'react'
import { useSocket } from '../providers/Socket'
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const Room = () => {
    const {socket} = useSocket();
    const [remoteSocketId,setRemoteSocketId] = useState(null);
    const [myStream,setMyStream] = useState(null)

    const handleUserJoined = useCallback(({emailID,id})=>{
        console.log('user with email ', emailID, 'joined the room');
        setRemoteSocketId(id);
    },[])

    const handleIncomingCall = useCallback(async({from, offer})=>{
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        setMyStream(stream);
        setRemoteSocketId(from);
        console.log('incoming call ', from, offer);
        const ans = await peer.getAnswer(offer);
        socket.emit("call-accepted",{to: from, ans})
    },[socket])

    const handleCallAccepted = useCallback( async ({from,ans}) => {

    },[])

    const handleCallUser = useCallback( async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true
        });
        const offer = await peer.getOffer();
        socket.emit("user-call", {to: remoteSocketId, offer})

        setMyStream(stream);
    },[remoteSocketId,socket])

    useEffect(()=>{
        socket.on("user-joined", handleUserJoined);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        return () => {
          socket.off("user-joined", handleUserJoined);
          socket.off("incoming-call", handleIncomingCall);
          socket.off("call-accepted", handleCallAccepted);
        }
      }, [socket,handleUserJoined,handleIncomingCall,handleCallAccepted])
  return (
    <div>
        <h1>Room</h1>
        <h2>{remoteSocketId ? ('Connected') : ('You are the only one here')}</h2>
        {remoteSocketId && <button className='call_btn' onClick={handleCallUser}>CALL</button>}
        {myStream && <ReactPlayer playing muted height='200px' width='300px' url={myStream}/>}
    </div>
  )
}

export default Room