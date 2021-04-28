const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMessage }= require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// let count = 0;

//  server (emit) -> client (recieve) - countUpdated
// client (emit) -> server (recieve) - increment

io.on("connection", (socket) => {
  console.log("New web socket connection");

  // socket.emit("message", "Welcome");

  // socket.emit('message', {
  //   text: 'Welcome!',
  //   createdAt: new Date().getTime()
  // })

  socket.emit('message', generateMessage('Welcome!'))

  socket.broadcast.emit("message", generateMessage("A new user has joined!"));

  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed");
    }
    // io.emit("message", message);
    io.emit("message", generateMessage(message));
    callback();
  });

  socket.on("sendLocation", (coords, callback) => {
    io.emit(
      "locationMessage",
      generateMessage(
        `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
      )
    );
    callback();
  });

  socket.on("disconnect", () => {
    // io.emit("message", "A user has left!");
    io.emit("message", generateMessage("A user has left!"));
  });

  // socket.on('sendLocation', (coords) => {
  //     io.emit('message', `Location:${coords.latitude}, ${coords.longitude}` )
  // })

  // socket.on("sendLocation", (coords, callback) => {
  //   io.emit(
  //     "message",
  //     `https://google.com/maps?q=${coords.latitude},${coords.longitude}`
  //   );
  //   callback()
  // });

  // socket.emit('countUpdated', count)
  // socket.on('increment', () => {
  //     count++;
  //     //socket.emit('countUpdated', count)
  //     io.emit('countUpdated', count)
  // })
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}!`);
});
