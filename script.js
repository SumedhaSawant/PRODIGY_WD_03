const board = document.getElementById("game-board");
const status = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const scoreX = document.getElementById("scoreX");
const scoreO = document.getElementById("scoreO");
const modeRadios = document.querySelectorAll('input[name="mode"]');
const celebrationMsg = document.getElementById("celebration");

let currentPlayer = "X";
let gameActive = true;
let gameState = Array(9).fill("");
let scores = { X: 0, O: 0 };
let vsAI = false;

const winConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

const emojis = { X: "❌", O: "⭕" };

function init() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-index", i);
    cell.setAttribute("tabindex", 0);
    board.appendChild(cell);
  }
  
  board.addEventListener("click", handleCellClick);
  board.addEventListener("keydown", handleKeyDown);
  resetBtn.addEventListener("click", resetGame);
  modeRadios.forEach(radio => radio.addEventListener("change", onModeChange));

  resetGame();
}

function onModeChange() {
  vsAI = this.value === "ai";
  resetGame();
}

function handleCellClick(e) {
  if (!gameActive) return;
  const cell = e.target;
  if (!cell.classList.contains("cell")) return;
  const index = cell.getAttribute("data-index");
  if (gameState[index] !== "") return;
  if (vsAI && currentPlayer !== "X") return;

  makeMove(index);
}

function handleKeyDown(e) {
  if (!gameActive) return;
  if (e.key !== "Enter" && e.key !== " ") return;
  const cell = e.target;
  if (!cell.classList.contains("cell")) return;
  const index = cell.getAttribute("data-index");
  if (gameState[index] !== "") return;
  if (vsAI && currentPlayer !== "X") return;

  makeMove(index);
}

function makeMove(index) {
  gameState[index] = currentPlayer;
  updateCell(index, currentPlayer);

  if (checkGameOver()) return;

  togglePlayer();

  if (vsAI && gameActive && currentPlayer === "O") {
    status.textContent = "AI is thinking...";
    setTimeout(aiMove, 500);
  }
}

function updateCell(index, player) {
  const cell = document.querySelector(`.cell[data-index='${index}']`);
  cell.textContent = emojis[player];
  cell.classList.add(player.toLowerCase());

  cell.style.transform = "scale(1.2)";
  setTimeout(() => {
    cell.style.transform = "scale(1)";
  }, 150);
}

function aiMove() {
  if (!gameActive) return;

  const bestMove = getBestMove(gameState, "O").index;
  gameState[bestMove] = "O";
  updateCell(bestMove, "O");

  if (checkGameOver()) return;

  togglePlayer();
  status.textContent = `Player ${emojis[currentPlayer]}'s turn`;
}

function getBestMove(state, player) {
  const opponent = player === "X" ? "O" : "X";
  const winner = getWinner(state);
  if (winner === player) return { score: 1 };
  if (winner === opponent) return { score: -1 };
  if (winner === "draw") return { score: 0 };

  const moves = [];

  for (let i = 0; i < state.length; i++) {
    if (state[i] === "") {
      const newState = [...state];
      newState[i] = player;
      const result = getBestMove(newState, opponent);
      moves.push({ index: i, score: -result.score });
    }
  }

  return moves.reduce((best, move) =>
    move.score > best.score ? move : best
  );
}

function checkGameOver() {
  const winner = getWinner(gameState);

  if (winner === "draw") {
    status.textContent = "It's a draw!";
    celebrationMsg.classList.remove("show");
    gameActive = false;
    return true;
  } else if (winner) {
    highlightWinningCells(winner);
    scores[winner]++;
    updateScores();
    status.textContent = `Player ${emojis[winner]} wins!`;
    showCelebration();
    gameActive = false;
    return true;
  }

  status.textContent = `Player ${emojis[currentPlayer]}'s turn`;
  return false;
}

function getWinner(boardState) {
  for (const condition of winConditions) {
    const [a,b,c] = condition;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      return boardState[a];
    }
  }
  if (!boardState.includes("")) return "draw";
  return null;
}

function highlightWinningCells(winner) {
  for (const condition of winConditions) {
    const [a,b,c] = condition;
    if (gameState[a] === winner && gameState[b] === winner && gameState[c] === winner) {
      [a,b,c].forEach(idx => {
        document.querySelector(`.cell[data-index='${idx}']`).classList.add("win");
      });
      break;
    }
  }
}

function updateScores() {
  scoreX.textContent = `X: ${scores.X}`;
  scoreO.textContent = `O: ${scores.O}`;

  scoreX.parentElement.classList.toggle("active", currentPlayer === "X");
  scoreO.parentElement.classList.toggle("active", currentPlayer === "O");
}

function togglePlayer() {
  currentPlayer = currentPlayer === "X" ? "O" : "X";
}

function resetGame() {
  gameState = Array(9).fill("");
  currentPlayer = "X";
  gameActive = true;
  status.textContent = `Player ${emojis[currentPlayer]}'s turn`;
  celebrationMsg.classList.remove("show");

  document.querySelectorAll(".cell").forEach(cell => {
    cell.textContent = "";
    cell.classList.remove("x", "o", "win");
    cell.style.transform = "scale(1)";
  });
}

function showCelebration() {
  celebrationMsg.textContent = "🎉 Congratulations! 🎉";
  celebrationMsg.classList.add("show");
}

init();
