const http = require("http");
const {socket} = require("./socketHandler");
const httpServer = http.createServer();
const webSocketServer = require("websocket").server;

httpServer.listen(4000, () => console.log("Listening on 4000"));

const wsServer = new webSocketServer({
	"httpServer": httpServer,
});

socket(wsServer)