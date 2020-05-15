const http = require("http");
const WebSocket = require("websocket").server;

const Game = require("./Game");

//active games
const activeGames = { 2222: { gameId: 2222, testing: "hai" } };
const httpServer = http.createServer((req, res) => {
  const game_id = parseInt(req.url.split("/")[1]);
  if (game_id && game_id in activeGames) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ valid: true }));
    res.end();
  } else {
    res.writeHead(400, { "Content-Type": "application/json" });
    res.write(JSON.stringify({ error: "invalid game id" }));
    res.end();
  }
});

const wsServer = new WebSocket({
  httpServer,
});

wsServer.on("request", (req) => {
  const connection = req.accept(null, req.origin);

  //on message event emitter
  connection.on("message", (msg) => {
    const data = JSON.parse(msg.utf8Data);
    //creating a new game
    if (data["action"] === "create_game") {
      const game = new Game(connection);
      const gameID = game.getGameID();
      activeGames[gameID] = game;
      game.sendTo(0, { action: "set_game_id", gameID });

      //adding new player to the list
    } else if (data["action"] === "join_game") {
      const gameID = data["game_id"];
      const game = activeGames[gameID];
      try {
        game.addPlayer(connection);
        game.notifyGameStarted();
      } catch (e) {
        connection.send(JSON.stringify({ error: e }));
      }
    } else if (data["action"] === "update") {
      activeGames[2222].update(data);
    }
  });
});

httpServer.listen(9000, () => console.log("server listening at port 9000"));
