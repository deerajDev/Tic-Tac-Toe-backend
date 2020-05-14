const http = require("http");
const WebSocket = require("websocket").server;

const Game = require("./Game");

const httpServer = http.createServer();

const wsServer = new WebSocket({
  httpServer,
});

wsServer.on("request", (req) => {
  const connection = req.accept(null, req.origin);
  connection.on("message", (msg) => {
    const data = JSON.parse(msg.utf8Data);
    
  });
});

httpServer.listen(9000, () => console.log("server listening at port 9000"));
