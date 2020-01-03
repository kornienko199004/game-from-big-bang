const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { addRoom, writeLastMove, getRooms } = require('./utils/rooms');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require('./utils/users');

const { findWinner } = require('./utils/game');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

let lastRoom = 1;

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
    console.log('New websocket connection');

    socket.on('join', (options, callback) => {
      console.log(options);
      console.log(options.room);

      if (options.room) {
        // start the game
        socket.join(options.room);
        addUser({ id: socket.id, room: options.room });
        io.to(options.room).emit('start the game');
      } else {
        // return url
        socket.join(lastRoom);
        addRoom(lastRoom);
        addUser({ id: socket.id, room: lastRoom });
        socket.emit('return room', lastRoom);
        lastRoom += 1;
      }
      callback();
  });

  
  socket.on('send move', ({ move }) => {
    console.log(move);
    const user = getUser(socket.id);
    console.log(user);
    if (user) {
      const room = writeLastMove(user, move);
      console.log(room);

      if (room && room.lastMove.length === 2) {
        // find winner
        console.log(room.lastMove);
        const winnerId = findWinner(room.lastMove);
        console.log(winnerId);

      }
    }
    // write move to room 
    // [room]: {
      // lastMove: [{ id: String, move: string }]
    // }
  });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
