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
  maxJumpVelocity: -17,
  minJumpVelocity: -8,
  maxChargeMs: 420,
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
  catNose: "#3c3b43",
  cheese: "#f4c84c",
  cheeseShadow: "#d79f2b",
  obstacle: "#8f5a3c",
  obstacleShadow: "#6a3f28",
  obstacleStripe: "#c9c6b8",
};

const rng = () => Math.random();
const inputState = {
  charging: false,
  chargeStart: 0,
};

function drawPixelToCanvas(context, x, y, size, color) {
  context.fillStyle = color;
  context.fillRect(x, y, size, size);
}

function createCatSprite() {
  const pixel = 3;
  const layout = [
    ".....OOO........",
    "..OOOOOOOOO.....",
    ".OOOooooooOOO...",
    "OOo........oOO..",
    "Oo..e....e..oOO.",
    "Oo.....n....oOO.",
    "OOo..s...s..oOO.",
    ".OOo......oOOO..",
    "..OOooooooOOO...",
    "...OOOooOOO.....",
    "....OOOOO.......",
  ];
  const width = layout[0].length * pixel;
  const height = layout.length * pixel;
  const sprite = document.createElement("canvas");
  sprite.width = width;
  sprite.height = height;
  const sctx = sprite.getContext("2d");
  sctx.imageSmoothingEnabled = false;

  layout.forEach((row, y) => {
    row.split("").forEach((cell, x) => {
      if (cell === ".") return;
      let color = palette.cat;
      if (cell === "O") color = palette.outline;
      if (cell === "o") color = palette.catShadow;
      if (cell === "s") color = palette.catWhite;
      if (cell === "e") color = palette.catEyes;
      if (cell === "n") color = palette.catNose;
      drawPixelToCanvas(sctx, x * pixel, y * pixel, pixel, color);
    });
  });

  return sprite;
}

function createKitchenTile() {
  const tile = document.createElement("canvas");
  tile.width = 280;
  tile.height = 160;
  const tctx = tile.getContext("2d");
  tctx.imageSmoothingEnabled = false;

  tctx.fillStyle = palette.wall;
  tctx.fillRect(0, 0, tile.width, tile.height);

  tctx.fillStyle = palette.windowFrame;
  tctx.fillRect(20, 20, 70, 50);
  tctx.fillStyle = palette.window;
  tctx.fillRect(26, 26, 58, 38);

  tctx.fillStyle = palette.windowFrame;
  tctx.fillRect(110, 18, 80, 54);
  tctx.fillStyle = palette.window;
  tctx.fillRect(116, 24, 68, 42);

  tctx.fillStyle = palette.cabinet;
  tctx.fillRect(16, 78, 110, 28);
  tctx.fillRect(140, 78, 86, 28);
  tctx.fillStyle = palette.cabinetHighlight;
  tctx.fillRect(20, 82, 100, 8);
  tctx.fillRect(144, 82, 76, 8);
  tctx.fillStyle = palette.cabinetShadow;
  tctx.fillRect(28, 94, 36, 8);
  tctx.fillRect(72, 94, 36, 8);
  tctx.fillRect(156, 94, 52, 8);

  tctx.fillStyle = palette.countertop;
  tctx.fillRect(12, 106, 210, 10);
  tctx.fillStyle = palette.backsplash;
  tctx.fillRect(12, 116, 210, 12);

  tctx.fillStyle = palette.cabinet;
  tctx.fillRect(20, 118, 28, 30);
  tctx.fillRect(52, 118, 28, 30);
  tctx.fillRect(84, 118, 36, 30);
  tctx.fillRect(124, 118, 36, 30);
  tctx.fillRect(164, 118, 40, 30);

  tctx.fillStyle = palette.appliance;
  tctx.fillRect(228, 70, 40, 80);
  tctx.fillStyle = palette.applianceShadow;
  tctx.fillRect(232, 76, 32, 20);
  tctx.fillRect(232, 102, 32, 38);
  tctx.fillStyle = palette.windowFrame;
  tctx.fillRect(238, 82, 8, 6);
  tctx.fillRect(238, 112, 8, 6);

  tctx.fillStyle = palette.wallShadow;
  tctx.fillRect(0, 150, tile.width, 10);

  return tile;
}

const catSprite = createCatSprite();
const kitchenTile = createKitchenTile();
cat.width = catSprite.width;
cat.height = catSprite.height;

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
  }
  if (cat.isJumping) return;

  const chargeMs = Math.min(
    Math.max(performance.now() - inputState.chargeStart, 0),
    state.maxChargeMs
  );
  const ratio = chargeMs / state.maxChargeMs;
  const velocity =
    state.minJumpVelocity +
    (state.maxJumpVelocity - state.minJumpVelocity) * ratio;
  cat.velocityY = velocity;
  cat.isJumping = true;
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
  const scroll = (state.time * state.speed * 16) % kitchenTile.width;
  const pattern = ctx.createPattern(kitchenTile, "repeat");
  ctx.save();
  ctx.translate(-scroll, 0);
  ctx.fillStyle = pattern;
  ctx.fillRect(scroll, 0, canvas.width + kitchenTile.width, kitchenTile.height);
  ctx.restore();

  drawPixelRect(0, state.groundY + 20, canvas.width, 52, palette.floor);
  for (let x = -scroll; x < canvas.width + 48; x += 48) {
    drawPixelRect(x + 6, state.groundY + 28, 36, 10, palette.tileHighlight);
    drawPixelRect(x + 8, state.groundY + 34, 32, 4, palette.floorStripe);
  }
}

function drawCat() {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(catSprite, cat.x, cat.y);
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
    if (!inputState.charging) {
      inputState.charging = true;
      inputState.chargeStart = performance.now();
    }
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    if (inputState.charging) {
      inputState.charging = false;
      jump();
    }
  }
});

window.addEventListener("pointerdown", () => {
  inputState.charging = true;
  inputState.chargeStart = performance.now();
});

window.addEventListener("pointerup", () => {
  if (inputState.charging) {
    inputState.charging = false;
    jump();
  }
});

statusEl.textContent = "Hold to charge your jump.";
requestAnimationFrame(loop);
