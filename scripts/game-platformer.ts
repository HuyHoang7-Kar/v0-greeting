// scripts/game-platformer.ts
// Simple platformer logic (independent of React)

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;

// Player setup
const player = {
  x: 50,
  y: 0,
  width: 40,
  height: 40,
  color: "#4ade80",
  velocityY: 0,
  isJumping: false,
};

// Gravity and ground
const gravity = 0.8;
const groundHeight = 300;

// Keyboard state
const keys: Record<string, boolean> = {};

// Draw everything
function draw() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Ground
  ctx.fillStyle = "#94a3b8";
  ctx.fillRect(0, groundHeight, canvas.width, 50);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Update physics
function update() {
  // Gravity
  player.velocityY += gravity;
  player.y += player.velocityY;

  // Stop at ground
  if (player.y + player.height >= groundHeight) {
    player.y = groundHeight - player.height;
    player.velocityY = 0;
    player.isJumping = false;
  }

  // Move left/right
  if (keys["ArrowLeft"]) player.x -= 5;
  if (keys["ArrowRight"]) player.x += 5;
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// Handle jump
function jump() {
  if (!player.isJumping) {
    player.velocityY = -15;
    player.isJumping = true;
  }
}

// Attach event listeners
function setupControls() {
  window.addEventListener("keydown", (e) => {
    keys[e.key] = true;
    if (e.key === " " || e.key === "ArrowUp") jump();
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });
}

// Initialize game
export function initPlatformer(canvasId: string) {
  canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error("❌ Canvas not found:", canvasId);
    return;
  }
  ctx = canvas.getContext("2d");
  if (!ctx) {
    console.error("❌ Cannot get 2D context");
    return;
  }

  canvas.width = 800;
  canvas.height = 400;

  setupControls();
  loop();

  console.log("✅ Platformer initialized!");
}
