import React, { useCallback, useState , useEffect } from 'react'
import { useSocket } from '../providers/Socket'
import ReactPlayer from 'react-player'
import peer from '../service/peer'

const Room = () => {
    const {socket} = useSocket();
    const [remoteSocketId,setRemoteSocketId] = useState(null);
    const [myStream,setMyStream] = useState(null);
    const [remoteStream,setRemoteStream] = useState(null);

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

    const sendStreams = () => {
        for (const track of myStream.getTracks()) {
            peer.peer.addTrack(track, myStream);
        }
    }

    const handleCallAccepted = useCallback( async ({from,ans}) => {
        peer.setLocalDescription(ans);
        console.log('call accepted');
        // sendStreams();
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

    const handleNegotiationNeeded = useCallback( async () => {
        const offer = await peer.getOffer();
        socket.emit("peer-nego-needed", {offer, to: remoteSocketId});
    },[remoteSocketId,socket])

    const handleNegoNeedIncoming = useCallback( async ({from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit("peer-nego-done", {to: from, ans});
    },[socket])

    const handleNegoNeedFinal = useCallback( async ({ans}) => {
        await peer.setLocalDescription(ans);
    },[])

    useEffect(() => {
        peer.peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
        return () => {
            peer.peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
        }
    },[handleNegotiationNeeded])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const remoteStream = ev.streams;
            console.log('got tracks')
            setRemoteStream(remoteStream[0]);
        })
    },[])

    useEffect(()=>{
        socket.on("user-joined", handleUserJoined);
        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("peer-nego-needed", handleNegoNeedIncoming);
        socket.on("peer-nego-final", handleNegoNeedFinal);

        return () => {
          socket.off("user-joined", handleUserJoined);
          socket.off("incoming-call", handleIncomingCall);
          socket.off("call-accepted", handleCallAccepted);
          socket.off("peer-nego-needed", handleNegoNeedIncoming);
          socket.off("peer-nego-final", handleNegoNeedFinal);
        }
      }, [socket,handleUserJoined,handleIncomingCall,handleCallAccepted,handleNegoNeedIncoming,handleNegoNeedFinal])
  return (
    <div>
        <h1>Room</h1>
        <h2>{remoteSocketId ? ('Connected') : ('You are the only one here')}</h2>
        {myStream && <button onClick={sendStreams}>Send Stream</button>}
        {remoteSocketId && <button className='call_btn' onClick={handleCallUser}>CALL</button>}
        {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
  )
}

export default Room