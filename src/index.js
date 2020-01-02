const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

let lastRoom = 0;

app.use(express.static(publicDirectoryPath));

io.on('connection', socket => {
    console.log('New websocket connection');

    socket.on('join', (options, callback) => {
      console.log(options);

      if (options.room) {
        // start the game
      } else {
        // return url
        socket.emit('return room', lastRoom);
        lastRoom += 1;
      }
      // const { error, user } = addUser({ id: socket.id, ...options });

      // if (error) {
      //     return callback(error);
      // }
      // socket.join(user.room);
      // socket.emit('message', generateMessage('Admin', 'Welcome'));
      // socket.broadcast
      //     .to(user.room)
      //     .emit('message', generateMessage('Admin', `${user.username} has joined!`));

      // io.to(user.room).emit('roomData',{
      //     room: user.room,
      //     users: getUsersInRoom(user.room),
      // });

      callback();
  });
});

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
});
