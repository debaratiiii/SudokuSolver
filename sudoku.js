"use strict";

// ==========================================
// DOM Elements
// ==========================================

const board = document.getElementById("sudoku-board");
const cells = [...document.querySelectorAll("#sudoku-board td")];

// Buttons
const solveButton = document.getElementById("solve-button");
const clearButton = document.getElementById("clear-button");
const easyButton = document.getElementById("easy-button");
const mediumButton = document.getElementById("medium-button");
const hardButton = document.getElementById("hard-button");

// Status Card
const statusCard = document.getElementById("status-card");
const statusIcon = document.getElementById("status-icon");
const statusTitle = document.getElementById("status-title");
const statusMessage = document.getElementById("status-message");

// Statistics
const difficultyLabel = document.getElementById("difficulty");
const filledCellsLabel = document.getElementById("filled-cells");
const emptyCellsLabel = document.getElementById("empty-cells");
const solveTimeLabel = document.getElementById("solve-time");

// Stores original puzzle
let originalBoard = "";

// ==========================================
// Event Listeners
// ==========================================

board.addEventListener("keyup", handleCellInput);
board.addEventListener("keydown", handleKeyboardNavigation);

solveButton.addEventListener("click", solvePuzzle);
clearButton.addEventListener("click", clearBoard);

easyButton.addEventListener("click", () =>
    loadPuzzle(EASY_PUZZLE, "Easy")
);

mediumButton.addEventListener("click", () =>
    loadPuzzle(MEDIUM_PUZZLE, "Medium")
);

hardButton.addEventListener("click", () =>
    loadPuzzle(HARD_PUZZLE, "Hard")
);

// ==========================================
// Handle Cell Input
// ==========================================

function handleCellInput(event) {

    if (event.target.nodeName !== "TD") return;

    const cell = event.target;

    const validNum = /^[1-9]$/;

    // Keep only one valid digit

    if (cell.innerText.length > 0) {

        cell.innerText = cell.innerText[0];

    }

    if (validNum.test(cell.innerText)) {

        cell.classList.add("given-cell");
        cell.classList.remove("solved-cell");

        // Auto move only after typing a digit

        if (validNum.test(event.key)) {

            const currentIndex = cells.indexOf(cell);

            if (currentIndex < 80) {

                focusCell(cells[currentIndex + 1]);

            }

        }

    } else {

        cell.innerText = "";

        cell.classList.remove("given-cell");
        cell.classList.remove("solved-cell");

    }

    updateStatistics(difficultyLabel.textContent);

    validateBoard();

}

// ==========================================
// Keyboard Navigation
// ==========================================

function handleKeyboardNavigation(event) {

    if (event.target.nodeName !== "TD") return;

    const currentCell = event.target;

    const currentIndex = cells.indexOf(currentCell);

    switch (event.key) {

        case "ArrowRight":

            event.preventDefault();

            if (currentIndex < 80)
               focusCell(cells[currentIndex + 1]);

            break;

        case "ArrowLeft":

            event.preventDefault();

            if (currentIndex > 0)
                focusCell(cells[currentIndex - 1]);

            break;

        case "ArrowUp":

            event.preventDefault();

            if (currentIndex >= 9)
                focusCell(cells[currentIndex - 9]);

            break;

        case "ArrowDown":

            event.preventDefault();

            if (currentIndex <= 71)
                focusCell(cells[currentIndex + 9]);

            break;

        case "Backspace":

        case "Delete":

            event.preventDefault();

            currentCell.innerText = "";

            currentCell.classList.remove("given-cell");
            currentCell.classList.remove("solved-cell");
            currentCell.classList.remove("invalid-cell");

            updateStatistics(difficultyLabel.textContent);

            validateBoard();

            break;

    }

}

// ==========================================
// Focus Cell (Places Cursor at End)
// ==========================================

function focusCell(cell) {

    cell.focus();

    const range = document.createRange();

    range.selectNodeContents(cell);

    range.collapse(false);

    const selection = window.getSelection();

    selection.removeAllRanges();

    selection.addRange(range);

}

// ==========================================
// Board Validation
// ==========================================

function validateBoard() {

    cells.forEach(cell =>
        cell.classList.remove("invalid-cell")
    );

    checkRows();
    checkColumns();
    checkBoxes();

}

// ==========================================
// Row Validation
// ==========================================

function checkRows() {

    for (let row = 0; row < 9; row++) {

        const seen = {};

        for (let col = 0; col < 9; col++) {

            const index = row * 9 + col;

            const value = cells[index].innerText.trim();

            if (value === "") continue;

            if (seen[value] !== undefined) {

                cells[index].classList.add("invalid-cell");
                cells[seen[value]].classList.add("invalid-cell");

            } else {

                seen[value] = index;

            }

        }

    }

}

// ==========================================
// Column Validation
// ==========================================

function checkColumns() {

    for (let col = 0; col < 9; col++) {

        const seen = {};

        for (let row = 0; row < 9; row++) {

            const index = row * 9 + col;

            const value = cells[index].innerText.trim();

            if (value === "") continue;

            if (seen[value] !== undefined) {

                cells[index].classList.add("invalid-cell");
                cells[seen[value]].classList.add("invalid-cell");

            } else {

                seen[value] = index;

            }

        }

    }

}

// ==========================================
// 3×3 Box Validation
// ==========================================

function checkBoxes() {

    for (let boxRow = 0; boxRow < 3; boxRow++) {

        for (let boxCol = 0; boxCol < 3; boxCol++) {

            const seen = {};

            for (let r = 0; r < 3; r++) {

                for (let c = 0; c < 3; c++) {

                    const row = boxRow * 3 + r;
                    const col = boxCol * 3 + c;

                    const index = row * 9 + col;

                    const value = cells[index].innerText.trim();

                    if (value === "") continue;

                    if (seen[value] !== undefined) {

                        cells[index].classList.add("invalid-cell");
                        cells[seen[value]].classList.add("invalid-cell");

                    } else {

                        seen[value] = index;

                    }

                }

            }

        }

    }

}

// ==========================================
// Solve Puzzle
// ==========================================

function solvePuzzle() {

    // Don't solve invalid boards

    if (document.querySelector(".invalid-cell")) {

        showStatus(
            "error",
            "⚠",
            "Invalid Input",
            "Please remove duplicate numbers before solving."
        );

        return;

    }

    const boardString = boardToString();

    originalBoard = boardString;

    const startTime = performance.now();

    const solution = SudokuSolver.solve(boardString);

    const endTime = performance.now();

    if (!solution) {

        showStatus(
            "error",
            "❌",
            "Invalid Puzzle",
            "This Sudoku puzzle cannot be solved."
        );

        return;

    }

    stringToBoard(solution);

    highlightSolvedCells();

    updateStatistics(difficultyLabel.textContent);

    solveTimeLabel.textContent =
        `${(endTime - startTime).toFixed(2)} ms`;

    showStatus(
        "success",
        "✅",
        "Puzzle Solved",
        `Solved successfully in ${(endTime - startTime).toFixed(2)} ms`
    );

}

// ==========================================
// Status Card
// ==========================================

function showStatus(type, icon, title, message) {

    statusCard.className = `status-card ${type}`;

    statusCard.classList.remove("hidden");

    statusIcon.textContent = icon;

    statusTitle.textContent = title;

    statusMessage.innerHTML = message;

}

// ==========================================
// Clear Board
// ==========================================

function clearBoard() {

    cells.forEach(cell => {

        cell.innerText = "";

        cell.classList.remove(
            "given-cell",
            "solved-cell",
            "invalid-cell"
        );

    });

    originalBoard = "";

    difficultyLabel.textContent = "-";
    filledCellsLabel.textContent = "0";
    emptyCellsLabel.textContent = "81";
    solveTimeLabel.textContent = "-";

    statusCard.className = "status-card hidden";

}

// ==========================================
// Load Puzzle
// ==========================================

function loadPuzzle(puzzle, difficulty) {

    clearBoard();

    cells.forEach((cell, index) => {

        if (puzzle[index] !== "-") {

            cell.innerText = puzzle[index];

            cell.classList.add("given-cell");

        }

    });

    updateStatistics(difficulty);

    validateBoard();

}

// ==========================================
// Highlight Solver Generated Cells
// ==========================================

function highlightSolvedCells() {

    cells.forEach((cell, index) => {

        if (originalBoard[index] === "-") {

            cell.classList.remove("given-cell");

            cell.classList.add("solved-cell");

        } else {

            cell.classList.remove("solved-cell");

            cell.classList.add("given-cell");

        }

    });

}

// ==========================================
// Statistics
// ==========================================

function updateStatistics(difficulty = "-") {

    let filled = 0;

    cells.forEach(cell => {

        if (cell.innerText.trim() !== "") {

            filled++;

        }

    });

    difficultyLabel.textContent = difficulty;

    filledCellsLabel.textContent = filled;

    emptyCellsLabel.textContent = 81 - filled;

}

// ==========================================
// Board -> String
// ==========================================

function boardToString() {

    return cells.map(cell => {

        const value = cell.innerText.trim();

        return /^[1-9]$/.test(value) ? value : "-";

    }).join("");

}

// ==========================================
// String -> Board
// ==========================================

function stringToBoard(solution) {

    cells.forEach((cell, index) => {

        cell.innerText = solution[index];

    });

}

// ==========================================
// Utility Functions
// ==========================================

function getFilledCellCount() {

    return cells.filter(cell =>

        cell.innerText.trim() !== ""

    ).length;

}

function getEmptyCellCount() {

    return 81 - getFilledCellCount();

}

// ==========================================
// Random Puzzle Loader
// ==========================================

function loadRandomPuzzle() {

    const puzzles = [

        {
            board: EASY_PUZZLE,
            difficulty: "Easy"
        },

        {
            board: MEDIUM_PUZZLE,
            difficulty: "Medium"
        },

        {
            board: HARD_PUZZLE,
            difficulty: "Hard"
        }

    ];

    const randomPuzzle = puzzles[
        Math.floor(Math.random() * puzzles.length)
    ];

    loadPuzzle(
        randomPuzzle.board,
        randomPuzzle.difficulty
    );

}

// ==========================================
// Initialize
// ==========================================

window.addEventListener("load", () => {

    clearBoard();

});