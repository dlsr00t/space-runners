const game = document.getElementById("game");
const player = document.getElementById("player");
let bullets = [];
let enemies = [];
let score = 0;
let gameRunning = true;
let updateInterval;
let enemyInterval;
const SHOW_HITBOXES = false;

// ====== PIXEL-PERFECT COLLISION SETUP ======
const hitboxCanvas = document.createElement('canvas');
const hitboxCtx = hitboxCanvas.getContext('2d');
let playerPixelData = null;

// Load player collision data
function initPixelCollision() {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      hitboxCanvas.width = player.offsetWidth;
      hitboxCanvas.height = player.offsetHeight;
      hitboxCtx.drawImage(img, 0, 0, hitboxCanvas.width, hitboxCanvas.height);
      playerPixelData = hitboxCtx.getImageData(0, 0, hitboxCanvas.width, hitboxCanvas.height).data;
      resolve();
    };
    img.src = window.getComputedStyle(player).backgroundImage
      .replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
  });
}

// Check if visible pixels collide
function checkPixelCollision(playerRect, enemyRect) {
  if (!playerPixelData) return true; // Fallback if not loaded
  
  // Calculate overlap area
  const xStart = Math.max(playerRect.left, enemyRect.left) - playerRect.left;
  const xEnd = Math.min(playerRect.right, enemyRect.right) - playerRect.left;
  const yStart = Math.max(playerRect.top, enemyRect.top) - playerRect.top;
  const yEnd = Math.min(playerRect.bottom, enemyRect.bottom) - playerRect.top;
  
  // Check each pixel in overlap area
  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const pixelIndex = (y * hitboxCanvas.width + x) * 4;
      if (playerPixelData[pixelIndex + 3] > 128) { // Alpha > 50%
        return true;
      }
    }
  }
  return false;
}

// ====== COLLISION SYSTEM ======
const HITBOX_PADDING = {
  player: 0,  // Now handled by pixel-perfect
  enemy: 3,
  bullet: 2
};

function checkCollision(rect1, rect2, padding1 = 0, padding2 = 0) {
  return (
    rect1.right - padding1 > rect2.left + padding2 &&
    rect1.left + padding1 < rect2.right - padding2 &&
    rect1.bottom - padding1 > rect2.top + padding2 &&
    rect1.top + padding1 < rect2.bottom - padding2
  );
}

async function gameOver() {
  gameRunning = false;
  clearInterval(updateInterval);
  clearInterval(enemyInterval);
  
  if (SHOW_HITBOXES) {
    player.style.backgroundColor = "red";
  }
  await new Promise(r => setTimeout(r, 200));
  
  await Swal.fire({
    title: 'Game Over!',
    text: `Your score: ${score}`,
    icon: 'error',
    confirmButtonText: 'Restart'
  });
  
  location.reload();
}

// ====== GAME CONTROLS (UNCHANGED) ======
document.addEventListener("keydown", (e) => {
  if (!gameRunning) return;

  const left = player.offsetLeft;
  if (e.key === "ArrowLeft" && left > 0) {
    player.style.left = left - 15 + "px";
  }
  if (e.key === "ArrowRight" && left < 370) {
    player.style.left = left + 15 + "px";
  }
  if (e.key === " ") {
    shoot();
  }
});

function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = player.offsetLeft + 28 + "px";
  bullet.style.bottom = "30px";
  
  
  bullet.style.boxShadow = "0 0 0 1px cyan";
  
  
  game.appendChild(bullet);
  bullets.push(bullet);
}

function createEnemy() {
  if (!gameRunning) return;

  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.floor(Math.random() * 370) + "px";
  enemy.style.top = "0px";
  
  if (SHOW_HITBOXES) {
    enemy.style.boxShadow = "0 0 0 1px lime";
  }
  
  game.appendChild(enemy);
  enemies.push(enemy);
}

// ====== UPDATED GAME LOOP ======
async function update() {
  if (!gameRunning) return;

  // Bullet movement (unchanged)
  for (let i = bullets.length - 1; i >= 0; i--) {
    const bullet = bullets[i];
    const bottom = parseInt(bullet.style.bottom);
    
    if (bottom >= 600) {
      bullet.remove();
      bullets.splice(i, 1);
    } else {
      bullet.style.bottom = bottom + 10 + "px";
    }
  }

  // Enemy processing
  for (let i = enemies.length - 1; i >= 0; i--) {
    const enemy = enemies[i];
    enemy.style.top = parseInt(enemy.style.top) + 3 + "px";

    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();

    // Two-phase collision check
    if (checkCollision(playerRect, enemyRect)) {
      if (checkPixelCollision(playerRect, enemyRect)) {
        await gameOver();
        return;
      }
    }

    // Bullet-enemy collision (rectangle-based for performance)
    for (let j = bullets.length - 1; j >= 0; j--) {
      const bullet = bullets[j];
      const bulletRect = bullet.getBoundingClientRect();
      
      if (checkCollision(bulletRect, enemyRect, HITBOX_PADDING.bullet, HITBOX_PADDING.enemy)) {
        enemy.remove();
        bullet.remove();
        enemies.splice(i, 1);
        bullets.splice(j, 1);
        score++;
        break;
      }
    }

    if (parseInt(enemy.style.top) > 600) {
      enemy.remove();
      enemies.splice(i, 1);
    }
  }
}

// ====== INITIALIZE ======
initPixelCollision().then(() => {
  if (SHOW_HITBOXES) {
    player.style.boxShadow = "0 0 0 1px red";
  }
  
  updateInterval = setInterval(() => update().catch(console.error), 30);
  enemyInterval = setInterval(createEnemy, 1000);
});