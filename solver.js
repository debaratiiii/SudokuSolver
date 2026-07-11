"use strict";

// ==========================================
// Sudoku Solver
// ==========================================

const SudokuSolver = (function () {
  function solve(boardString) {
    const board = boardString.split("");

    if (!boardIsValid(board)) {
      return false;
    }

    return recursiveSolve(boardString);
  }

  function recursiveSolve(boardString) {
    const board = boardString.split("");

    if (boardSolved(board)) {
      return board.join("");
    }

    const next = getNextCell(board);

    const index = next.index;

    const choices = next.choices;

    for (let i = 0; i < choices.length; i++) {
      board[index] = choices[i];

      const solved = recursiveSolve(board.join(""));

      if (solved) {
        return solved;
      }
    }

    return false;
  }

  function boardSolved(board) {
    return board.indexOf("-") === -1;
  }

  function getNextCell(board) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "-") {
        const existing = getIntersections(board, i);

        const choices = ["1", "2", "3", "4", "5", "6", "7", "8", "9"].filter(
          (num) => existing.indexOf(num) === -1,
        );

        return {
          index: i,

          choices: choices,
        };
      }
    }
  }
  // ==========================================
  // Board Validation
  // ==========================================

  function boardIsValid(board) {
    return rowsValid(board) && columnsValid(board) && boxesValid(board);
  }

  function getIntersections(board, index) {
    return getRow(board, index)
      .concat(getColumn(board, index))
      .concat(getBox(board, index));
  }

  // ==========================================
  // Row Functions
  // ==========================================

  function rowsValid(board) {
    for (let i = 0; i < 81; i += 9) {
      if (!collectionValid(getRow(board, i))) {
        return false;
      }
    }

    return true;
  }

  function getRow(board, index) {
    const start = Math.floor(index / 9) * 9;

    return board.slice(start, start + 9);
  }

  // ==========================================
  // Column Functions
  // ==========================================

  function columnsValid(board) {
    for (let i = 0; i < 9; i++) {
      if (!collectionValid(getColumn(board, i))) {
        return false;
      }
    }

    return true;
  }

  function getColumn(board, index) {
    const col = index % 9;

    const values = [];

    for (let i = 0; i < 9; i++) {
      values.push(board[col + i * 9]);
    }

    return values;
  }

  // ==========================================
  // Box Functions
  // ==========================================

  function boxesValid(board) {
    const starts = [0, 3, 6, 27, 30, 33, 54, 57, 60];

    for (let i = 0; i < starts.length; i++) {
      if (!collectionValid(getBox(board, starts[i]))) {
        return false;
      }
    }

    return true;
  }

  function getBox(board, index) {
    const boxCol = Math.floor(index / 3) % 3;

    const boxRow = Math.floor(index / 27);

    const start = boxCol * 3 + boxRow * 27;

    const offsets = [0, 1, 2, 9, 10, 11, 18, 19, 20];

    return offsets.map((offset) => board[start + offset]);
  }
  // ==========================================
  // Collection Validation
  // ==========================================

  function collectionValid(collection) {
    const seen = {};

    for (let i = 0; i < collection.length; i++) {
      const value = collection[i];

      if (value === "-") continue;

      if (seen[value]) {
        return false;
      }

      seen[value] = true;
    }

    return true;
  }

  // ==========================================
  // Public API
  // ==========================================

  return {
    solve: solve,
  };
})();
