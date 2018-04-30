const express = require('express')
const http = require('http')
const socketIO = require('socket.io')

const port = 3001

const app = express()

const server = http.createServer(app)

app.get('*', function(req, res) {  
    res.sendFile(path.join( __dirname, './src/index.html'));
});

const io = socketIO(server)

let lobbys = [{"owner":"test"}];//{}
let games = [];

io.on('connection', socket => {
  console.log('User connected')
  socket.emit('lobbys',lobbys);

  socket.on("createLobby",(data)=>{
    if(lobbys.some((lobby)=>{ return lobby.owner === socket.id }))
        return;
    lobbys.push({"owner":socket.id,"name":data.name});
    io.emit('lobbys',lobbys);
  });

  socket.on("joinLobby",(data)=>{
    if( data.lobbyOwner == socket.id)
        return;

    games.push({players:[data.lobbyOwner,socket.id], stage: "choose", gameStart: Date.now()})

    lobbys = lobbys.filter((lobby)=>{return data.lobbyOwner != lobby.owner || socket.id != data.lobbyOwner})
    io.emit('lobbys',lobbys);
  })

  //GAME CODE
  socket.on('chooseItem',(data)=>{
    console.log(data);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected')
    lobbys = lobbys.filter((lobby)=>{return lobby.owner != socket.id})
    io.emit('lobbys',lobbys);
  });
})

server.listen(port, () => console.log(`Listening on port ${port}`))
