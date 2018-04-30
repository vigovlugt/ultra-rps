const express = require('express')
const http = require('http')
const socketIO = require('socket.io')
const path = require('path')

const port = process.env.PORT || 3001

const app = express()

const server = http.createServer(app)

app.use('/static', express.static(path.join(__dirname, 'build','static')))

app.get('/', function(req, res) {  
    res.sendFile(path.join( __dirname, './build/index.html'));
});

const io = socketIO(server)

let lobbys = [];//{}
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

    let game = {players:[data.lobbyOwner,socket.id], stage: 0, choices:{},winner:null, gameStart: Date.now()}
    games.push(game)

    lobbys = lobbys.filter((lobby)=>{return data.lobbyOwner != lobby.owner && socket.id != data.lobbyOwner})
    io.emit('lobbys',lobbys);

    io.to(data.lobbyOwner).emit("game",game);
    io.to(socket.id).emit("game",game);
  })

  //GAME CODE
  socket.on('chooseItem',(data)=>{
    const gameIndex = games.findIndex((game)=>{
        return game.players.indexOf(socket.id) != -1
    });
    if(gameIndex == -1 || games[gameIndex].choices[socket.id] !== undefined)
        return;
    games[gameIndex].choices[socket.id] = data;
    if(Object.keys(games[gameIndex].choices).length >= 2){
        games[gameIndex].stage = 1;

        let choices = Object.values( games[gameIndex].choices);
        if(choices[0] == choices[1]){
            games[gameIndex].winner = "none";
        }
        const winMatrix = [
            [0,-1,1],
            [1,0,-1],
            [-1,1,0]
        ]
        games[gameIndex].winner = Object.keys(games[gameIndex].choices)[ (winMatrix[choices[0]][choices[1]] === 1) ? 0 : 1 ];

        io.to(games[gameIndex].players[0]).emit("game",games[gameIndex]);
        io.to(games[gameIndex].players[1]).emit("game",games[gameIndex]);
        games = games.splice(gameIndex,1);
    }
    console.log(games);
  });
  
  socket.on('disconnect', () => {
    console.log('user disconnected')
    lobbys = lobbys.filter((lobby)=>{return lobby.owner != socket.id})
    io.emit('lobbys',lobbys);
  });
})

server.listen(port, () => console.log(`Listening on port ${port}`))
