const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const { addRoom, writeLastMove, getRooms, clearLastMove } = require('./utils/rooms');

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

    // action when socket 'join' to websocket
    socket.on('join', (options, callback) => {
    // if options has room property
    // join user to room
      if (options.room) {
        socket.join(options.room);

        // add user to list
        const user = addUser({ id: socket.id, room: options.room });

        // if there is 2 user in room -> start the game
        if (getUsersInRoom(user.room).length === 2) {
          io.to(user.room).emit('start the game', getUsersInRoom(`${user.room}`));
        }
      } else {
        // if options hasn't room property
        // send back join link
        socket.join(lastRoom);
        // add room to list
        addRoom(lastRoom);

        // add user to list
        addUser({ id: socket.id, room: `${lastRoom}` });
        socket.emit('return room', lastRoom);

        // if there is 2 user in room -> start the game
        if (getUsersInRoom(`${lastRoom}`).length === 2) {
          io.to(lastRoom).emit('start the game', getUsersInRoom(`${lastRoom}`));
        }

        // increment lastRoom number
        lastRoom += 1;
      }
      callback();
  });

  socket.on('send move', ({ move }) => {
    const user = getUser(socket.id);
    if (user) {

      // write user's move to room
      const room = writeLastMove(user, move);

      // if there are 2 move, start to find winner
      if (room && room.lastMove.length === 2) {
        const winnerId = findWinner(room.lastMove);
        io.to(room.room).emit('return result', { winnerId, lastMove: room.lastMove });

        // clear moves in room
        clearLastMove(room.room);
      }
    }
  });

  socket.on('make-offer', ({ offer, to }) => {
    console.log(offer);
    console.log(to);
    socket.to(to).emit('offer-made', {
      offer: offer,
      socket: socket.id
    });
  });

  socket.on('make-answer', function (data) {
    socket.to(data.to).emit('answer-made', {
      socket: socket.id,
      answer: data.answer
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('return room', user.room);
    }
  });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
