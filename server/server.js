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

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log("Socket server on", HOST + ":" + PORT);
});
