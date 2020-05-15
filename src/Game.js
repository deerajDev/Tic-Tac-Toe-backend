class Game {
  constructor(host_player) {
    this.__id = this.generateGameID();
    this.__players = [host_player, undefined];
    this.__game_status = this.createInitialState();
    this.__num_moves = 0;
    this.won = false;
  }
  //creates 5 digits random id
  generateGameID() {
    // const uniqueId = Math.random() * 90000 + 10000;
    // return parseInt(uniqueId);
    return 2222;
  }

  //creates initialState  matrix with all undefined
  createInitialState() {
    const matrix = [
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
      [undefined, undefined, undefined],
    ];
    return matrix;
  }

  getGameID() {
    return this.__id;
  }

  //adds the player if second player is still not added
  addPlayer(new_player) {
    if (this.__players[1]) {
      return new Error("Number of player cannot be more than 2");
    } else {
      this.__players[1] = new_player;
    }
  }

  //sending message when game starts
  notifyGameStarted() {
    this.__players[0].send(
      JSON.stringify({
        action: "game_settings",
        myTurn: true,
        userType: 0,
      })
    );
    this.__players[1].send(
      JSON.stringify({
        action: "game_settings",
        gameID: this.getGameID(),
        myTurn: false,
        userType: 1,
      })
    );
  }
  switchTurn(user_id, cell_num) {
    this.sendTo(user_id, { my_turn: false, action: "opponent_turn" });
    this.sendTo((user_id + 1) % 2, {
      action: "opponent_move",
      cell_num: cell_num,
    });
  }

  sendUpdate(user_id, row_num, col_num) {
    const data = {
      myTurn: false,
      action: "update_matrix",
      cell_num: [row_num, col_num],
      value: user_id,
    };
    this.sendTo(user_id, data);
    //toggling the value
    data["myTurn"] = true;
    this.sendTo((user_id + 1) % 2, data);
  }
  //sends the message to the user_id supplied
  sendTo(user_id, msg) {
    const connection = this.__players[user_id];
    connection.send(JSON.stringify(msg));
  }
  //sends the message to both the players
  sendAll(msg) {
    for (let index = 0; index < 2; index++) {
      this.__players[index].send(JSON.stringify(msg));
    }
  }
  //updates the cell
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

  //checks if all the values of a row are same
  checkRow(row_num, value) {
    for (let cur_index = 0; cur_index < 3; cur_index++) {
      const game_value = this.__game_status[row_num][cur_index];
      if (game_value === undefined || game_value !== value) {
        return false;
      }
    }
    return true;
  }
  //checks if all the values of a column are same
  checkColumn(col_num, value) {
    for (let cur_index = 0; cur_index < 3; cur_index++) {
      const game_value = this.__game_status[cur_index][col_num];
      if (game_value === undefined || game_value !== value) {
        return false;
      }
    }
    return true;
  }
  //checks if the left or right diagonal elements are same
  checkDiagonal(value) {
    let row_num = 0;
    let left = true;
    let right = true;
    while (row_num < 3 && (left || right)) {
      if (left) {
        const left_diagonal_value = this.__game_status[row_num][row_num];
        if (
          left_diagonal_value === undefined ||
          left_diagonal_value !== value
        ) {
          left = false;
        }
      }
      if (right) {
        const right_diagonal_value = this.__game_status[row_num][2 - row_num];
        if (
          right_diagonal_value === undefined ||
          right_diagonal_value !== value
        ) {
          right = false;
        }
      }
      row_num++;
    }
    return left || right;
  }

  //checks if the latest user input was winning move or not
  isUserWon(row_num, col_num, value) {
    const won =
      this.checkRow(row_num, value) ||
      this.checkColumn(col_num, value) ||
      this.checkDiagonal(value);

    if (won) {
      this.won = true;
      this.reset();
    }
  }

  checkGameStatus(user_id) {
    if (this.won) {
      
      // send the message to the players that user has won
      this.sendTo(user_id, { action: "you_won" });
      this.sendTo((user_id + 1) % 2, { action: "you_lost" });
    } else if (this.__num_moves >= 9) {
      //send message to the user that game has finished
      this.sendAll({ action: "draw" });
      this.reset();
    }
    // else do nothing
  }

  update(data) {
    const temp = data["cell_num"].split("_");
    const row_num = parseInt(temp[0]);
    const col_num = parseInt(temp[1]);
    const userID = data["userType"];
    //sending update to the user
    this.sendUpdate(userID, row_num, col_num);

    //updating the cell at the server
    this.updateCell(row_num, col_num, userID);
    this.isUserWon(row_num, col_num, userID);
    this.checkGameStatus(userID);
  }

  reset() {
    this.__game_status = this.createInitialState();
  }
}

module.exports = Game;
