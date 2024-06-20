const express = require('express')
const bodyParser = require('body-parser')
const {Server} = require('socket.io')

const io = new Server({
    cors: true,
})
const app = express()

app.use(bodyParser.json())

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

io.on('connection', (socket) => {
    console.log('New connection', socket.id);
    socket.on("join-room", (data)=>{
        const { roomID, emailID } = data;
        console.log('user ', emailID, ' joined room ', roomID);
        emailToSocketIdMap.set(emailID,socket.id)
        socketIdToEmailMap.set(socket.id,emailID)
        socket.join(roomID);
        socket.emit("joined-room", { roomID })
        const id = socket.id;
        socket.broadcast.to(roomID).emit('user-joined', { emailID , id});
    })

    socket.on("user-call", ({to,offer}) => {
        io.to(to).emit("incoming-call", {from: socket.id , offer});
    })

    socket.on("call-accepted", ({to,ans}) => {
        io.to(to).emit("call-accpted", {from: socket.id , ans});
    })
})

app.listen(8000,()=>{
    console.log('http server is listening on port 8000')
})

io.listen(8001)
