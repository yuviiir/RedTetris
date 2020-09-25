const {v4 : randomId} = require("uuid");
const {Tetro, Game, Piece} = require("./objClass");

const clients = {};
const games = {};

exports.socket = (wsServer) =>{
	wsServer.on("request", request => {
		const connection = request.accept(null, request.origin);

		connection.on("message", message => {
			const result = JSON.parse(message.utf8Data)

			if(result.method === "pong"){
				const clientId = result.clientId;
				clients[clientId].tetro.pong()
			}

			if (result.method === "create"){
				const clientId = result.clientId;
				const gameId = randomId();
				const url = `http://localhost:3000/?game=${gameId}`
				games[gameId] = {
					id: gameId,
					host: {clientId: clientId},
					clients: [{clientId: clientId, grid: []}],
				};

				const payLoad = {
					method: "create",
					url: url,
					game: games[gameId],
				};

				const con = clients[clientId].tetro.connection;
				con.send(JSON.stringify(payLoad));
			}

			if (result.method === "join"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const game = games[gameId];
				if(!game)
					return

				if (game.clients.length >= 2){
					const payLoad = {
						method: "gameFull",
						game: game,
					}
					clients[clientId].tetro.connection.send(JSON.stringify(payLoad));
					return;
				}

				game.clients.push({
					clientId: clientId,
					grid: result.grid
				});

				const payLoad = {
					method: "join",
					game: game,
				}

				game.clients.forEach(c => {
					clients[c.clientId].tetro.connection.send(JSON.stringify(payLoad));
				});

				clients[clientId].tetro.opponent = clients[game.host.clientId].tetro;
				clients[game.host.clientId].tetro.opponent = clients[clientId].tetro;
			}

			if (result.method === "start"){
				const gameId = result.gameId;
				const game = games[gameId];
				const grid = result.grid;

				game.clients.forEach(c => {
					c.grid = grid;
				});
				updateGameState(game);

				const payLoad = {
					method: "startGame",
					game: game,
				}
				game.clients.forEach(c => {
					clients[c.clientId].tetro.connection.send(JSON.stringify(payLoad));
				});
			}

			if (result.method === "updateGrid"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const grid = result.grid;
				const game = games[gameId];
				if(!game)
					return

				game.clients.forEach(c => {
					if (c.clientId == clientId){
						c.grid = grid;
					}
				});
				games[gameId] = game;
			}

			if (result.method === "gameOver"){
				const clientId = result.clientId;
				const gameId = result.gameId;
				const game = games[gameId];

				
				const payLoad = {
					method: "gameEnded",
					loser: clientId,
				}
				
				game.clients.forEach(c => {
					clients[c.clientId].tetro.connection.send(JSON.stringify(payLoad));
				});
			}

		});
		
		const clientId = randomId();
		const tetro = new Tetro(clientId, connection)

		clients[clientId] = {
			tetro: tetro,
		};

		const payLoad = {
			method: "connect",
			clientId: clientId,
		};

		connection.send(JSON.stringify(payLoad));
	});

	function updateGameState(game){
		const payLoad = {
			method: "update",
			game: game,
		}
		game.clients.forEach(c => {
			clients[c.clientId].tetro.connection.send(JSON.stringify(payLoad));
		})
		setTimeout(() => updateGameState(game), 500)
	}
}