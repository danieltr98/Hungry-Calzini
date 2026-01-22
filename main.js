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
  jumpVelocity: -17,
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
  sky: "#c7d5f2",
  stars: "#f5f2e7",
  wall: "#aeb7d8",
  wallShadow: "#97a2c7",
  window: "#7da3ff",
  windowFrame: "#fef7e3",
  floor: "#e6d2b8",
  floorStripe: "#d1b792",
  tileHighlight: "#f2e4cf",
  cabinet: "#c9763a",
  cabinetShadow: "#a65c2e",
  cabinetHighlight: "#e59a5a",
  countertop: "#ece7e0",
  backsplash: "#f8f3dc",
  appliance: "#f0b326",
  applianceShadow: "#d5901c",
  outline: "#1c1b24",
  cat: "#c9c7de",
  catShadow: "#a8a6bf",
  catHighlight: "#e3e2f2",
  catWhite: "#f8f7ff",
  catEyes: "#1b1b1f",
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

  const scroll = (state.time * state.speed * 14) % canvas.width;
  drawPixelRect(0, 0, canvas.width, state.groundY + 20, palette.wall);
  for (let x = -scroll; x < canvas.width + 240; x += 240) {
    drawPixelRect(x + 12, 36, 50, 40, palette.windowFrame);
    drawPixelRect(x + 16, 40, 42, 32, palette.window);
    drawPixelRect(x + 68, 42, 70, 36, palette.windowFrame);
    drawPixelRect(x + 72, 46, 62, 28, palette.window);

    drawPixelRect(x + 12, 96, 96, 24, palette.cabinet);
    drawPixelRect(x + 14, 98, 92, 8, palette.cabinetHighlight);
    drawPixelRect(x + 18, 110, 30, 8, palette.cabinetShadow);
    drawPixelRect(x + 54, 110, 40, 8, palette.cabinetShadow);
    drawPixelRect(x + 112, 96, 60, 28, palette.cabinet);
    drawPixelRect(x + 116, 100, 52, 10, palette.cabinetHighlight);

    drawPixelRect(x + 12, 120, 180, 12, palette.countertop);
    drawPixelRect(x + 12, 132, 180, 10, palette.backsplash);

    drawPixelRect(x + 18, 132, 22, 20, palette.cabinet);
    drawPixelRect(x + 44, 132, 22, 20, palette.cabinet);
    drawPixelRect(x + 70, 132, 30, 20, palette.cabinet);
    drawPixelRect(x + 104, 132, 32, 20, palette.cabinet);
    drawPixelRect(x + 140, 132, 30, 20, palette.cabinet);

    drawPixelRect(x + 184, 88, 36, 68, palette.appliance);
    drawPixelRect(x + 188, 92, 28, 14, palette.applianceShadow);
    drawPixelRect(x + 188, 112, 28, 38, palette.applianceShadow);
    drawPixelRect(x + 194, 98, 8, 4, palette.windowFrame);
    drawPixelRect(x + 194, 122, 8, 4, palette.windowFrame);
  }

  drawPixelRect(0, state.groundY + 20, canvas.width, 52, palette.floor);
  for (let x = -scroll; x < canvas.width + 48; x += 48) {
    drawPixelRect(x + 6, state.groundY + 28, 36, 10, palette.tileHighlight);
    drawPixelRect(x + 8, state.groundY + 34, 32, 4, palette.floorStripe);
  }

  drawPixelRect(0, state.groundY + 20, canvas.width, 4, palette.wallShadow);
}

function drawCat() {
  const baseX = cat.x;
  const baseY = cat.y + 2;

  drawPixelRect(baseX - 6, baseY + 4, cat.width + 12, cat.height - 2, palette.outline);
  drawPixelRect(baseX + 4, baseY - 10, 12, 12, palette.outline);
  drawPixelRect(baseX + 26, baseY - 10, 12, 12, palette.outline);
  drawPixelRect(baseX + 42, baseY - 2, 18, 12, palette.outline);
  drawPixelRect(baseX + 54, baseY - 22, 12, 20, palette.outline);

  drawPixelRect(baseX, baseY + 6, cat.width, cat.height - 6, palette.cat);
  drawPixelRect(baseX + 6, baseY - 6, 10, 10, palette.cat);
  drawPixelRect(baseX + 28, baseY - 6, 10, 10, palette.cat);
  drawPixelRect(baseX + 46, baseY + 2, 14, 10, palette.cat);
  drawPixelRect(baseX + 56, baseY - 16, 8, 18, palette.cat);

  drawPixelRect(baseX + 4, baseY + 10, 12, 10, palette.catShadow);
  drawPixelRect(baseX + 22, baseY + 10, 12, 10, palette.catShadow);
  drawPixelRect(baseX + 8, baseY + 8, 10, 6, palette.catHighlight);
  drawPixelRect(baseX + 26, baseY + 8, 10, 6, palette.catHighlight);

  drawPixelRect(baseX + 12, baseY + 14, 4, 4, palette.catEyes);
  drawPixelRect(baseX + 26, baseY + 14, 4, 4, palette.catEyes);
  drawPixelRect(baseX + 20, baseY + 18, 4, 4, palette.catEyes);

  drawPixelRect(baseX + 4, baseY + 28, 14, 10, palette.catWhite);
  drawPixelRect(baseX + 30, baseY + 28, 14, 10, palette.catWhite);
  drawPixelRect(baseX + 16, baseY + 22, 14, 8, palette.catWhite);
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
