const game = document.getElementById("game");
const player = document.getElementById("player");
let bullets = [];
let enemies = [];
let score = 0;

document.addEventListener("keydown", (e) => {
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
  bullet.style.left = player.offsetLeft + 12 + "px";
  bullet.style.bottom = "30px";
  game.appendChild(bullet);
  bullets.push(bullet);
}

function createEnemy() {
  const enemy = document.createElement("div");
  enemy.classList.add("enemy");
  enemy.style.left = Math.floor(Math.random() * 370) + "px";
  enemy.style.top = "0px";
  game.appendChild(enemy);
  enemies.push(enemy);
}

function update() {
  bullets.forEach((bullet, index) => {
    const bottom = parseInt(bullet.style.bottom);
    if (bottom >= 600) {
      bullet.remove();
      bullets.splice(index, 1);
    } else {
      bullet.style.bottom = bottom + 10 + "px";
    }
  });

  let enemiesToRemove = [];
  let bulletsToRemove = [];

  enemies.forEach((enemy, i) => {
    const top = parseInt(enemy.style.top);
    enemy.style.top = top + 3 + "px";

    if (top >= 570) {
      const playerLeft = player.offsetLeft;
      const enemyLeft = parseInt(enemy.style.left);
      if (
        enemyLeft < playerLeft + 60 &&
        enemyLeft + 60 > playerLeft
      ) {
        alert("Game Over! Pontuação: " + score);
        location.reload();
      }
    }

    bullets.forEach((bullet, j) => {
      const bulletTop = 600 - parseInt(bullet.style.bottom);
      const bulletLeft = parseInt(bullet.style.left);
      const enemyLeft = parseInt(enemy.style.left);
      const enemyTop = parseInt(enemy.style.top);

      if (
        bulletTop < enemyTop + 30 &&
        bulletTop + 10 > enemyTop &&
        bulletLeft < enemyLeft + 30 &&
        bulletLeft + 5 > enemyLeft
      ) {
        enemy.remove();
        bullet.remove();
        enemiesToRemove.push(i);
        bulletsToRemove.push(j);
        score++;
      }
    });

    if (top > 600) {
      enemy.remove();
      enemiesToRemove.push(i);
    }
  });

  [...new Set(enemiesToRemove)].sort((a, b) => b - a).forEach(i => enemies.splice(i, 1));
  [...new Set(bulletsToRemove)].sort((a, b) => b - a).forEach(j => bullets.splice(j, 1));
}

setInterval(update, 30);
setInterval(createEnemy, 1000);
