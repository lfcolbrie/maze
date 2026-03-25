const SIZE = 15;

const state = {
  grid: [],
  player: { x: 1, y: 1 },
  exit: { x: SIZE - 2, y: SIZE - 2 },
  won: false
};

const elements = {
  maze: document.getElementById("maze"),
  mazePlayer: document.getElementById("maze-player"),
  mazeExit: document.getElementById("maze-exit"),
  restartButton: document.getElementById("restart-button"),
  playAgainButton: document.getElementById("play-again-button"),
  overlay: document.getElementById("rickroll-overlay"),
  player: document.getElementById("rickroll-player"),
  videoWarning: document.getElementById("video-warning")
};

function randomOdd(max) {
  return Math.floor(Math.random() * ((max - 1) / 2)) * 2 + 1;
}

function makeFilledGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(1));
}

function carveMaze(grid, x, y) {
  const directions = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0]
  ].sort(() => Math.random() - 0.5);

  grid[y][x] = 0;

  for (const [dx, dy] of directions) {
    const nextX = x + dx;
    const nextY = y + dy;

    if (nextX <= 0 || nextX >= SIZE - 1 || nextY <= 0 || nextY >= SIZE - 1) {
      continue;
    }

    if (grid[nextY][nextX] === 1) {
      grid[y + dy / 2][x + dx / 2] = 0;
      carveMaze(grid, nextX, nextY);
    }
  }
}

function buildMaze() {
  const grid = makeFilledGrid();
  carveMaze(grid, 1, 1);

  const exitX = SIZE - 2;
  const exitY = SIZE - 2;
  grid[1][1] = 0;
  grid[exitY][exitX] = 0;

  state.grid = grid;
  state.player = { x: 1, y: 1 };
  state.exit = { x: exitX, y: exitY };
  state.won = false;
}

function renderMaze() {
  elements.maze.style.gridTemplateColumns = `repeat(${SIZE}, 1fr)`;

  const cells = state.grid
    .flatMap((row, y) =>
      row.map((cell, x) => {
        const classes = ["cell", cell === 1 ? "wall" : "path"];
        return `<div class="${classes.join(" ")}" aria-hidden="true"></div>`;
      })
    )
    .join("");

  elements.maze.innerHTML = `
    ${cells}
    <div class="maze-token maze-exit" id="maze-exit" aria-hidden="true"></div>
    <div class="maze-token maze-player" id="maze-player" aria-hidden="true"></div>
  `;

  elements.mazePlayer = document.getElementById("maze-player");
  elements.mazeExit = document.getElementById("maze-exit");
  positionToken(elements.mazePlayer, state.player.x, state.player.y);
  positionToken(elements.mazeExit, state.exit.x, state.exit.y);
}

function positionToken(token, x, y) {
  const styles = getComputedStyle(document.documentElement);
  const cellSize = Number.parseFloat(styles.getPropertyValue("--cell-size")) || 28;
  const gap = Number.parseFloat(styles.getPropertyValue("--cell-gap")) || 3;
  const padding = 12;
  const inset = 6;
  const offsetX = padding + (x * (cellSize + gap)) + inset;
  const offsetY = padding + (y * (cellSize + gap)) + inset;

  token.style.setProperty("--token-x", `${offsetX}px`);
  token.style.setProperty("--token-y", `${offsetY}px`);
}

function tryMove(dx, dy) {
  if (state.won) {
    return;
  }

  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;

  if (nextX < 0 || nextX >= SIZE || nextY < 0 || nextY >= SIZE) {
    return;
  }

  if (state.grid[nextY][nextX] === 1) {
    return;
  }

  state.player = { x: nextX, y: nextY };
  positionToken(elements.mazePlayer, state.player.x, state.player.y);

  if (nextX === state.exit.x && nextY === state.exit.y) {
    triggerRickroll();
  }
}

function triggerRickroll() {
  state.won = true;
  elements.overlay.hidden = false;
  elements.player.currentTime = 0;
  elements.player.play().catch(() => {
    elements.videoWarning.textContent = "Autoplay was blocked or the direct file is missing. Press play on the video if needed.";
  });
}

function restartGame() {
  elements.overlay.hidden = true;
  elements.player.pause();
  buildMaze();
  renderMaze();
}

elements.player.addEventListener("error", () => {
  elements.videoWarning.textContent = "Video file could not be loaded. Make sure rickroll.mp4 is uploaded in the same folder as this page.";
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(key)) {
    event.preventDefault();
  }

  if (key === "arrowup" || key === "w") {
    tryMove(0, -1);
  } else if (key === "arrowdown" || key === "s") {
    tryMove(0, 1);
  } else if (key === "arrowleft" || key === "a") {
    tryMove(-1, 0);
  } else if (key === "arrowright" || key === "d") {
    tryMove(1, 0);
  }
});

elements.restartButton.addEventListener("click", restartGame);
elements.playAgainButton.addEventListener("click", restartGame);

buildMaze();
renderMaze();
