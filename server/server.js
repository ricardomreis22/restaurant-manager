const express = require("express");

const http = require("http");

const app = express();

const server = http.createServer(app);

const { Server } = require("socket.io");

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("join-table", () => {
    io.emit("do_something");
  });
});

server.listen(3001, () => {
  console.log("Server is running on port 3001");
});
