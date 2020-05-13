class Game {
  constructor(host_player) {
    this.__id = 59;
    this.__players = [host_player, undefined];
    this.__game_status = this.createInitialState();
    this.__num_moves = 0;
  }

  addPlayer(new_player) {
    if (this.__players[1]) {
      return new Error("Number of player cannot be more than 2");
    } else {
      this.__players[1] = new_player;
    }
  }

  sendMessage(to) {
    if (to > 2) {
      return new Error("to index cannot be greater than 2");
    } else {
      //implement send  the message
      console.log("sending the message");
    }
  }

  updateCell(row, col, value) {
    if (this.__num_moves >= 9) {
      return new Error("No more update possible");
    }
    try {
      this.__game_status[row][col] = value;
      this.__num_moves++;
    } catch (err) {
      return new Error("bad input ");
    }
  }

  createInitialState() {
    const row = Array(3).fill(undefined);
    const matrix = Array(3).fill(row);
    return matrix;
  }
}
