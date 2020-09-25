class Game {
  constructor(gameId, gameUrl, host, clients) {
    this.gameId = gameId;
    this.gameUrl = gameUrl;
    this.host = host;
    this.clients = clients;
  }
}
module.exports.Game = Game;

class Piece {
  constructor() {
    this.tetrominos = {
      0: {
        shape: [[0]],
        color: "#000",
      },
      I: {
        shape: [
          [0, "I", 0, 0],
          [0, "I", 0, 0],
          [0, "I", 0, 0],
          [0, "I", 0, 0],
        ],
        color: "pink",
      },
      J: {
        shape: [
          [0, "J", 0],
          [0, "J", 0],
          ["J", "J", 0],
        ],
        color: "purple",
      },
      L: {
        shape: [
          [0, "L", 0],
          [0, "L", 0],
          [0, "L", "L"],
        ],
        color: "cyan",
      },
      O: {
        shape: [
          ["O", "O"],
          ["O", "O"],
        ],
        color: "red",
      },
      S: {
        shape: [
          [0, "S", "S"],
          ["S", "S", 0],
          [0, 0, 0],
        ],
        color: "white",
      },
      T: {
        shape: [
          [0, 0, 0],
          ["T", "T", "T"],
          [0, "T", 0],
        ],
        color: "teal",
      },
      Z: {
        shape: [
          ["Z", "Z", 0],
          [0, "Z", "Z"],
          [0, 0, 0],
        ],
        color: "blue",
      },
    };
  }
}
module.exports.Piece = Piece;

class Tetro {
  constructor(clientId, connection) {
    this.clientId = clientId;
    this.connection = connection;
    this.gridWidth = 10;
    this.gridHeight = 20;
    this.ti = setInterval(() => this.ping(), 3000);
    this.tm = null;
    this.opponent = null;
    this.grid = Array.from(Array(this.gridHeight), () =>
      new Array(this.gridWidth).fill([0, "clear"])
    );
  }

  ping() {
    const payLoad = {
      method: "ping",
    };

    this.connection.send(JSON.stringify(payLoad));
    this.tm = setTimeout(() => {
      this.clientDC();
    }, 5000);
  }

  clientDC() {
    const payLoad = {
      method: "playerLeft",
    };
    if (this.opponent) {
      this.opponent.connection.send(JSON.stringify(payLoad));
    }
    clearInterval(this.ti);
    clearTimeout(this.tm);
  }

  pong() {
    clearTimeout(this.tm);
  }
}

module.exports.Tetro = Tetro;
