const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const bestEl = document.getElementById("best");
const statusEl = document.getElementById("status");

const state = {
  running: false,
  score: 0,
  best: 0,
  speed: 1.7,
  gravity: 0.45,
  jumpVelocity: -8.5,
  groundY: canvas.height - 72,
  time: 0,
};

const cat = {
  x: 120,
  y: state.groundY,
  width: 56,
  height: 42,
  velocityY: 0,
  isJumping: false,
};

const obstacles = [];
const cheeses = [];

const palette = {
  sky: "#1b2138",
  stars: "#f5f2e7",
  wall: "#252b3f",
  wallShadow: "#1d2234",
  window: "#95b7ff",
  windowFrame: "#f5f2e7",
  floor: "#2d354f",
  floorStripe: "#c9c6b8",
  furniture: "#4f5b83",
  furnitureShadow: "#394260",
  outline: "#0b0b10",
  cat: "#c7c6dd",
  catShadow: "#a9a8bf",
  catWhite: "#f5f2e7",
  catEyes: "#151515",
  cheese: "#f4c84c",
  cheeseShadow: "#d79f2b",
  obstacle: "#8f5a3c",
  obstacleShadow: "#6a3f28",
  obstacleStripe: "#c9c6b8",
};

const rng = () => Math.random();

function resetGame() {
  state.running = true;
  state.score = 0;
  state.speed = 1.7;
  state.time = 0;
  cat.y = state.groundY;
  cat.velocityY = 0;
  cat.isJumping = false;
  obstacles.length = 0;
  cheeses.length = 0;
  statusEl.textContent = "Snack time!";
}

function spawnObstacle() {
  const size = 36 + rng() * 14;
  obstacles.push({
    x: canvas.width + 40,
    y: state.groundY + 20 - size,
    width: size,
    height: size,
    type: rng() > 0.5 ? "crate" : "box",
  });
}

function spawnCheese() {
  const heightOffset = rng() > 0.6 ? -80 : -40;
  cheeses.push({
    x: canvas.width + 40,
    y: state.groundY + heightOffset,
    width: 30,
    height: 22,
    collected: false,
  });
}

function jump() {
  if (!state.running) {
    resetGame();
    return;
  }
  if (!cat.isJumping) {
    cat.velocityY = state.jumpVelocity;
    cat.isJumping = true;
  }
}

function update(dt) {
  if (!state.running) return;

  state.time += dt;
  state.score += dt * 6;
  state.speed = 1.7 + Math.min(1.5, state.score / 400);

  cat.velocityY += state.gravity;
  cat.y += cat.velocityY;

  if (cat.y >= state.groundY) {
    cat.y = state.groundY;
    cat.velocityY = 0;
    cat.isJumping = false;
  }

  if (state.time > 50 && rng() < 0.02) {
    spawnObstacle();
  }
  if (state.time > 30 && rng() < 0.03) {
    spawnCheese();
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= state.speed * 2.1;
  });
  cheeses.forEach((cheese) => {
    cheese.x -= state.speed * 1.8;
  });

  while (obstacles.length && obstacles[0].x + obstacles[0].width < 0) {
    obstacles.shift();
  }
  while (cheeses.length && cheeses[0].x + cheeses[0].width < 0) {
    cheeses.shift();
  }

  cheeses.forEach((cheese) => {
    if (cheese.collected) return;
    if (
      cat.x < cheese.x + cheese.width &&
      cat.x + cat.width > cheese.x &&
      cat.y < cheese.y + cheese.height &&
      cat.y + cat.height > cheese.y
    ) {
      cheese.collected = true;
      state.score += 20;
      statusEl.textContent = "Chomp!";
    }
  });

  const hit = obstacles.some((obstacle) =>
    cat.x < obstacle.x + obstacle.width &&
    cat.x + cat.width > obstacle.x &&
    cat.y + cat.height > obstacle.y &&
    cat.y < obstacle.y + obstacle.height
  );

  if (hit) {
    state.running = false;
    state.best = Math.max(state.best, Math.floor(state.score));
    bestEl.textContent = state.best;
    statusEl.textContent = "Ouch! Tap to restart.";
  }

  scoreEl.textContent = Math.floor(state.score);
}

function drawPixelRect(x, y, width, height, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawBackground() {
  drawPixelRect(0, 0, canvas.width, canvas.height, palette.sky);

  const scroll = (state.time * state.speed * 12) % canvas.width;
  drawPixelRect(0, 0, canvas.width, state.groundY + 20, palette.wall);
  for (let x = -scroll; x < canvas.width + 96; x += 96) {
    drawPixelRect(x + 18, 40, 28, 28, palette.windowFrame);
    drawPixelRect(x + 22, 44, 20, 20, palette.window);
    drawPixelRect(x + 50, 54, 18, 12, palette.windowFrame);
    drawPixelRect(x + 52, 56, 14, 8, palette.window);
    drawPixelRect(x + 8, state.groundY - 40, 40, 20, palette.furniture);
    drawPixelRect(x + 12, state.groundY - 36, 32, 12, palette.furnitureShadow);
  }

  drawPixelRect(0, state.groundY + 20, canvas.width, 52, palette.floor);
  for (let x = -scroll; x < canvas.width + 40; x += 40) {
    drawPixelRect(x + 4, state.groundY + 30, 24, 6, palette.floorStripe);
  }

  drawPixelRect(0, state.groundY + 20, canvas.width, 4, palette.wallShadow);
}

function drawCat() {
  const baseX = cat.x;
  const baseY = cat.y + 2;

  drawPixelRect(baseX - 4, baseY + 4, cat.width + 8, cat.height - 2, palette.outline);
  drawPixelRect(baseX + 6, baseY - 8, 10, 10, palette.outline);
  drawPixelRect(baseX + 26, baseY - 8, 10, 10, palette.outline);
  drawPixelRect(baseX + 44, baseY - 2, 16, 10, palette.outline);
  drawPixelRect(baseX + 52, baseY - 18, 10, 16, palette.outline);

  drawPixelRect(baseX, baseY + 6, cat.width, cat.height - 6, palette.cat);
  drawPixelRect(baseX + 8, baseY - 4, 8, 8, palette.cat);
  drawPixelRect(baseX + 28, baseY - 4, 8, 8, palette.cat);
  drawPixelRect(baseX + 46, baseY + 2, 12, 8, palette.cat);
  drawPixelRect(baseX + 54, baseY - 14, 8, 16, palette.cat);

  drawPixelRect(baseX + 6, baseY + 12, 8, 8, palette.catShadow);
  drawPixelRect(baseX + 22, baseY + 12, 8, 8, palette.catShadow);

  drawPixelRect(baseX + 10, baseY + 14, 4, 4, palette.catEyes);
  drawPixelRect(baseX + 26, baseY + 14, 4, 4, palette.catEyes);
  drawPixelRect(baseX + 18, baseY + 18, 4, 4, palette.catEyes);

  drawPixelRect(baseX + 6, baseY + 28, 12, 8, palette.catWhite);
  drawPixelRect(baseX + 30, baseY + 28, 12, 8, palette.catWhite);
  drawPixelRect(baseX + 16, baseY + 22, 12, 6, palette.catWhite);
}

function drawCheese(cheese) {
  if (cheese.collected) return;
  drawPixelRect(cheese.x, cheese.y, cheese.width, cheese.height, palette.cheese);
  drawPixelRect(cheese.x + 4, cheese.y + 4, cheese.width - 8, cheese.height - 8, palette.cheeseShadow);
  drawPixelRect(cheese.x + 6, cheese.y + 6, 4, 4, palette.stars);
  drawPixelRect(cheese.x + 16, cheese.y + 8, 4, 4, palette.stars);
}

function drawObstacle(obstacle) {
  drawPixelRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, palette.obstacle);
  drawPixelRect(
    obstacle.x + 4,
    obstacle.y + 4,
    obstacle.width - 8,
    obstacle.height - 8,
    palette.obstacleShadow
  );
  if (obstacle.type === "crate") {
    drawPixelRect(obstacle.x + 2, obstacle.y + obstacle.height / 2 - 2, obstacle.width - 4, 4, palette.obstacleStripe);
  } else {
    drawPixelRect(obstacle.x + obstacle.width / 2 - 2, obstacle.y + 2, 4, obstacle.height - 4, palette.obstacleStripe);
  }
}

function render() {
  drawBackground();

  cheeses.forEach(drawCheese);
  obstacles.forEach(drawObstacle);
  drawCat();
}

let last = performance.now();
function loop(now) {
  const dt = (now - last) / 16.6667;
  last = now;
  update(dt);
  render();
  requestAnimationFrame(loop);
}

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }
});

window.addEventListener("pointerdown", () => {
  jump();
});

statusEl.textContent = "Tap, click, or press space to start.";
requestAnimationFrame(loop);
