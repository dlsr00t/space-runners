const game = document.getElementById("game");
const player = document.getElementById("player");

let playerX = 185;
let bullets = [];
let enemies = [];
let score = 0;
let gameOver = false;

document.addEventListener("keydown", e => {
  if (gameOver) return;

  if (e.key === "ArrowLeft" && playerX > 0) {
    playerX -= 20;
  } else if (e.key === "ArrowRight" && playerX < 370) {
    playerX += 20;
  } else if (e.key === " ") {
    shoot();
  }
  player.style.left = playerX + "px";
});

function shoot() {
  const bullet = document.createElement("div");
  bullet.classList.add("bullet");
  bullet.style.left = playerX + 12 + "px";
  bullet.style.bottom = "40px";
  game.appendChild(bullet);
  bullets.push(bullet);
}

function spawnEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.floor(Math.random() * 370) + "px";
  enemy.style.top = "0px";
  game.appendChild(enemy);
  enemies.push(enemy);
}

function update() {
  if (gameOver) return;

  // Atualiza balas
  bullets.forEach((bullet, i) => {
    let bottom = parseInt(bullet.style.bottom);
    bullet.style.bottom = bottom + 10 + "px";

    // Remove se sair da tela
    if (bottom > 600) {
      bullet.remove();
      bullets.splice(i, 1);
    }
  });

  // Atualiza inimigos
  let enemiesToRemove = [];
  let bulletsToRemove = [];
  
  enemies.forEach((enemy, i) => {
    const enemyTop = parseInt(enemy.style.top);
    const enemyLeft = parseInt(enemy.style.left);
  
    // Atualiza posição do inimigo
    enemy.style.top = (enemyTop + 2) + "px";
  
    // Verifica colisão com o player
    const playerLeft = player.offsetLeft;
    if (
      enemyTop + 30 >= 570 &&
      enemyLeft < playerLeft + 30 &&
      enemyLeft + 30 > playerLeft
    ) {
      alert("Game Over! Pontuação: " + score);
      location.reload();
      return;
    }
  
    // Verifica se saiu da tela
    if (enemyTop > 600) {
      enemy.remove();
      enemiesToRemove.push(i);
    }
  
    // Colisão com balas
    bullets.forEach((bullet, j) => {
      const bulletTop = 600 - parseInt(bullet.style.bottom); // Convertendo bottom para top
      const bulletLeft = parseInt(bullet.style.left);
  
      if (
        bulletTop < enemyTop + 30 &&
        bulletTop + 10 > enemyTop &&
        bulletLeft < enemyLeft + 30 &&
        bulletLeft + 5 > enemyLeft
      ) {
        // Colidiu
        enemy.remove();
        bullet.remove();
        enemiesToRemove.push(i);
        bulletsToRemove.push(j);
        score++;
      }
    });
  });
  
  // Remove os elementos marcados
  [...new Set(enemiesToRemove)].sort((a, b) => b - a).forEach(i => enemies.splice(i, 1));
  [...new Set(bulletsToRemove)].sort((a, b) => b - a).forEach(j => bullets.splice(j, 1));
  
  requestAnimationFrame(update);
}

setInterval(spawnEnemy, 1000);
update();
