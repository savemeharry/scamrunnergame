// script.js

// =============================
// 0. Константы и Переменные
// =============================
const BASE_CANVAS_WIDTH = 400;
const BASE_CANVAS_HEIGHT = 700;
const PLATFORM_VERTICAL_SPACING = 80;
const PLATFORM_BUFFER = 150;
const MAX_JUMP_DISTANCE = 300;
const LEVEL_LENGTH = 6000;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const BLOCK_WIDTH = 100;
const BLOCK_HEIGHT = 100;

let baseGameSpeed = 0.8;
let gameSpeed = baseGameSpeed;

// Граница где заканчивается спрайт baseFront и начинается коллизия земли
let GROUND_Y;


const PLATFORM_TYPES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

const PLATFORM_EFFECTS = {
  NONE: 'none',
  SLOW: 'slow',
  SPEED: 'speed'
};

// Мяу
const MEOW_COOLDOWN = 500;
let lastMeowTime = 0;

// Дэш
const DASH_COOLDOWN = 3000;
let lastDashTime = 0;
const DASH_DURATION = 380;

// Новые переменные для «skill not ready» и комбо:
const DASH_RANGE = 300;
let skillNotReadyAlpha = 0;
let skillNotReadyTime = 0;
let comboCount = 0;
let lastDashKill = false;
let comboMessage = "";
let comboMessageAlpha = 0;
let comboMessageStart = 0;

// Доп. переменные игры
let gameOver = false;
let gameStarted = false;
let victory = false;
let fadeAlpha = 0;
let canvasScale = 1; // Масштаб канваса
let screenWidth = 0;
let screenHeight = 0;
let canvasOffsetX = 0;
let canvasOffsetY = 0;

let isSwipeDashActive = false;
let dashStart = { x: 0, y: 0 };
let dashCurrent = { x: 0, y: 0 };

const startScreen = document.getElementById("startScreen");
const gameOverScreen = document.getElementById("gameOverScreen");
const victoryScreen = document.getElementById("victoryScreen");
const finalScoreEl = document.getElementById("finalScore");
const victoryScoreEl = document.getElementById("victoryScore");
const superMeowReadyEl = document.getElementById("superMeowReady");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");
const restartVictoryButton = document.getElementById("restartVictoryButton");

const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");
const jumpBtn = document.getElementById("jumpBtn");
const meowBtn = document.getElementById("meowBtn");
const dashBtn = document.getElementById("dashBtn");
const controls = document.getElementById('controls');

// Подгружаем изображения
function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

const layers = {
  background: loadImage("./images/background/new/03_background.png"),
  buildingsMid: loadImage("./images/background/new/02_buildings_mid.png"),
  baseFront: loadImage("./images/background/new/01_base_frong.png"),
  hp: loadImage("./images/elements/hp.png"),
  whiskas: loadImage("./images/elements/whiskas.png"),
  superWhiskas: loadImage("./images/elements/super_whiskas.png"),
  energyIcon: loadImage("./images/elements/energy.png"),
  platformBlock: loadImage("./images/elements/platform.png"),
  pursuer: loadImage("./images/enemies/pursuer.png"),
  exclamationMark: loadImage("./images/elements/exclamation.png"),
  boss: loadImage("./images/enemies/boss.png"),
  bossHealthBar: loadImage("./images/elements/boss_health_bar.png"),
};

// Анимации
const runFrames = [
  loadImage("./images/cat1/cat_run/1.png"),
  loadImage("./images/cat1/cat_run/2.png"),
  loadImage("./images/cat1/cat_run/3.png"),
  loadImage("./images/cat1/cat_run/4.png"),
  loadImage("./images/cat1/cat_run/5.png"),
  loadImage("./images/cat1/cat_run/6.png"),
];
let runFrameIndex = 0;
let runFrameTimer = 0;
let runFrameInterval = 5;

const doubleJumpFrames = [
  loadImage("./images/cat1/cat_jump_d/1.png"),
  loadImage("./images/cat1/cat_jump_d/2.png"),
  loadImage("./images/cat1/cat_jump_d/3.png"),
  loadImage("./images/cat1/cat_jump_d/4.png"),
  loadImage("./images/cat1/cat_jump_d/5.png"),
  loadImage("./images/cat1/cat_jump_d/6.png"),
];
let doubleJumpFrameIndex = 0;
let doubleJumpFrameTimer = 0;
let doubleJumpFrameInterval = 5;

const idleFrames = [
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/3.png"),
];
let idleFrameIndex = 0;
let idleFrameTimer = 0;
let idleFrameInterval = 10;

const jumpFrames = [
  loadImage("./images/cat1/cat_jump/1.png"),
  loadImage("./images/cat1/cat_jump/2.png"),
  loadImage("./images/cat1/cat_jump/3.png"),
  loadImage("./images/cat1/cat_jump/4.png"),
];
let jumpFrameIndex = 0;
let jumpFrameTimer = 0;
let jumpFrameInterval = 10;

const dashFrames = [
  loadImage("./images/cat1/cat_dash/1.png"),
  loadImage("./images/cat1/cat_dash/2.png"),
  loadImage("./images/cat1/cat_dash/3.png"),
  loadImage("./images/cat1/cat_dash/4.png"),
   loadImage("./images/cat1/cat_dash/5.png"),
  loadImage("./images/cat1/cat_dash/6.png"),
]
let dashFrameIndex = 0;
let dashFrameTimer = 0;
let dashFrameInterval = 3;

const gameMusic = new Audio("./lvl2.mp3");
let musicPlayed = false;

let damageParticles = [];
let floatingTexts = [];
let dashParticles = [];
let meowWaves = [];
let meteors = [];
let explosions = [];
let energyItems = [];
let pursuers = [];
let platforms = [];
let keys = {};
let cameraX = 0;
let spawnTimer = Date.now();

let meteorSpawnRate = 2000;
let bossMeteorSpawnRate = 1000;
let lastPursuerSpawn = Date.now();
let pursuerSpawnRate = 5000;

let showDanger = false;
let dangerAlpha = 1;
let dangerFading = true;
let gameTimer = 60;
let timerInterval;

let cheatSequence = ['KeyF', 'ArrowDown', 'KeyF', 'KeyF', 'ArrowUp'];
let cheatIndex = 0;
let cheatActivated = false;
let showCollisionBox = 0; // Управление отображением бокса коллизии

let player = {
  x: -100,
  playerStartX: 100,
  y: GROUND_Y - 70,
  width: 64,
  height: 94,
  velocityY: 0,
  velocityX: 0,
  maxSpeed: 6,
  friction: 0.85,
  gravity: 0.5,
  jumpStrength: -7,
  canDoubleJump: true,
  performedDoubleJump: false,
  energy: 0,
  superMeowReady: false,
  alive: true,
  hp: 100,
    collisionWidth: 0,
    collisionHeight: 0,
    collisionOffsetX: 0,
    collisionOffsetY: 0,
    isEntering: true,
    isFading: false,
    fadeTimer: 0,
    fadeDuration: 1500,
    skillOpacity: 1,
  direction: 'right',
  isJumping: false,
  isDashing: false,
  dashTimer: 0,
  opacity: 1,
  animationState: 'idle',
  invulnerable: false,
};

let blissParticles = [];
let blissSpawnRate = 20;
let lastSkillTime = 0;
let skillCooldown = 6000;

let boss = {
  x: LEVEL_LENGTH,
  y: 200,
  width: 100,
  height: 100,
  hp: 10,
  isActive: false,
  lastShotTime: 0,
  shotInterval: 3000,
  shots: [],
  movementDirection: 1,
  movementSpeed: 2,
  movementRange: 50,
  initialY: 200,
  flashStartTime: null,
  isFlashing: false,
  flashVisible: false,
  descendActive: false,
  descendTimer: 0,
  descendDuration: 2000,
  nextDescendTime: Date.now() + getRandomInterval(5000, 10000),
  targetY: 200,
  descendY: 450,
  newAttackReady: false,
  newAttackCooldown: 8000,
  lastNewAttackTime: Date.now(),
};

let originalGravity = player.gravity;
let originalGameSpeed = baseGameSpeed;

// =============================
// 1. Обработчики Событий
// =============================
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", restartGame);
restartVictoryButton.addEventListener("click", restartGame);

document.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  checkCheatCode(e.code);

  if (e.code === "ArrowRight") {
    keys.right = true;
  }
  if (e.code === "ArrowLeft") {
    keys.left = true;
  }
  if (e.code === "Space") {
    handleJump();
  }
  if (e.code === "KeyF") {
      handleSkill()
  }
});

document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowRight") keys.right = false;
  if (e.code === "ArrowLeft") keys.left = false;
});

leftBtn.addEventListener("mousedown", () => {
  keys.left = true;
  player.direction = 'left';
});
leftBtn.addEventListener("mouseup", () => {
  keys.left = false;
});
rightBtn.addEventListener("mousedown", () => {
  keys.right = true;
  player.direction = 'right';
});
rightBtn.addEventListener("mouseup", () => {
  keys.right = false;
});
jumpBtn.addEventListener("click", handleJump);
meowBtn.addEventListener("click", handleSkill);

let dashActive = false;
const dashData = {
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0
};

dashBtn.addEventListener("mousedown", (e) => {
  if (player.isDashing) return;
  const now = Date.now();
  if ((now - lastDashTime < DASH_COOLDOWN) && comboCount === 0) {
    showSkillNotReady();
    return;
  }
  if (!player.alive || gameOver) return;

  dashActive = true;
  dashData.startX = e.clientX;
  dashData.startY = e.clientY;
  dashData.currentX = e.clientX;
  dashData.currentY = e.clientY;
});

document.addEventListener("mousemove", (e) => {
  if (!dashActive) return;
  dashData.currentX = e.clientX;
  dashData.currentY = e.clientY;
});

document.addEventListener("mouseup", (e) => {
  if (!dashActive) return;
  dashActive = false;

  const dx = dashData.currentX - dashData.startX;
  const dy = dashData.currentY - dashData.startY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 20) {
    return;
  }

  const angle = Math.atan2(dy, dx);
  performSwipeDash(angle);
});

dashBtn.addEventListener("touchstart", (e) => {
  if (player.isDashing) return;
  const now = Date.now();
  if ((now - lastDashTime < DASH_COOLDOWN) && comboCount === 0) {
    showSkillNotReady();
    return;
  }
  if (!player.alive || gameOver) return;

  isSwipeDashActive = true;
  const touch = e.touches[0];
  dashStart.x = touch.clientX;
  dashStart.y = touch.clientY;
  dashCurrent.x = touch.clientX;
  dashCurrent.y = touch.clientY;
});

dashBtn.addEventListener("touchmove", (e) => {
  if (!isSwipeDashActive) return;
  const touch = e.touches[0];
  dashCurrent.x = touch.clientX;
  dashCurrent.y = touch.clientY;
});

dashBtn.addEventListener("touchend", (e) => {
  if (!isSwipeDashActive) return;
  isSwipeDashActive = false;

  const dx = dashCurrent.x - dashStart.x;
  const dy = dashCurrent.y - dashStart.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < 20) return;

  const angle = Math.atan2(dy, dx);
  performSwipeDash(angle);
});

// Добавил touchstart/touchmove/touchend на кнопки влево и вправо
leftBtn.addEventListener('touchstart', (e) => {
    keys.left = true;
    player.direction = 'left';
});
leftBtn.addEventListener('touchmove', (e) => {
})
leftBtn.addEventListener('touchend', (e) => {
    keys.left = false;
});
rightBtn.addEventListener('touchstart', (e) => {
    keys.right = true;
    player.direction = 'right';
});
rightBtn.addEventListener('touchmove', (e) => {
})
rightBtn.addEventListener('touchend', (e) => {
    keys.right = false;
});

// =============================
// 2. Генерация Платформ
// =============================
const platformLevels = {
  1: GROUND_Y - 2 * PLATFORM_VERTICAL_SPACING, // Уровень 1
  2: GROUND_Y - PLATFORM_VERTICAL_SPACING,     // Уровень 2
  3: GROUND_Y - 4 * PLATFORM_VERTICAL_SPACING  // Уровень 3
};

const platformPatterns = [
  // Сектор 1
  [
    { level: 1, length: 3 },
    { level: 2, length: 2 },
    { level: 3, length: 3 }
  ],
  // Сектор 2
  [
    { level: 3, length: 2 },
    { level: 2, length: 3 },
    { level: 1, length: 2 }
  ],
  // Сектор 3
  [
    { level: 2, length: 2 },
    { level: 1, length: 3 },
    { level: 2, length: 3 }
  ],
  // Сектор 4
  [
    { level: 1, length: 2 },
    { level: 2, length: 2 },
    { level: 3, length: 2 }
  ]
];

const singlePlatformPatterns = [
  { level: 1, length: 2 },
  { level: 2, length: 2 },
  { level: 3, length: 2 }
];

function generateLevelPlatforms(startX = 200) {
    let currentX = startX;
    let currentLevel = 1;
    const allPlatforms = [];
    while (currentX < LEVEL_LENGTH) {
      if (Math.random() < 0.7) {
        const pattern = platformPatterns[Math.floor(Math.random() * platformPatterns.length)];
        pattern.forEach(p => {
          const platX = currentX;
          const platY = platformLevels[p.level];
          if (!isOverlapping(allPlatforms, platX, platY, p.length)) {
            allPlatforms.push({
              level: p.level,
              x: platX,
              y: platY,
              originalY: platY,
              length: p.length,
              effect: getRandomPlatformEffect(),
              isSinking: false,
              sinkSpeed: 0.5 * gameSpeed,
              sinkAmount: 10,
              returnSpeed: 0.5 * gameSpeed
            });
            currentX += p.length * BLOCK_WIDTH + getRandomSpacing();
            currentLevel = p.level;
          }
        });
      } else {
        const singlePattern = singlePlatformPatterns[Math.floor(Math.random() * singlePlatformPatterns.length)];
        const platX = currentX;
        const platY = platformLevels[singlePattern.level];
        if (!isOverlapping(allPlatforms, platX, platY, singlePattern.length)) {
           allPlatforms.push({
            level: singlePattern.level,
            x: platX,
            y: platY,
             originalY: platY,
            length: singlePattern.length,
             effect: getRandomPlatformEffect(),
             isSinking: false,
             sinkSpeed: 0.5 * gameSpeed,
             sinkAmount: 10,
             returnSpeed: 0.5 * gameSpeed
          });
          currentX += singlePattern.length * BLOCK_WIDTH + getRandomSpacing();
          currentLevel = singlePattern.level;
        }
      }
    }
    return allPlatforms;
}

function generateLevelWhiskas(platforms){
  const allWhiskas = [];
  platforms.forEach(platform => {
    const whiskasCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < whiskasCount; i++) {
      const type = Math.random() < 0.2 ? 'super' : 'normal';
      const radius = type === 'super' ? 20 : 10;
      const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20;
      const whiskasY = platform.originalY - radius - 5;
      if (!isWhiskasTooClose(allWhiskas, whiskasX, whiskasY, radius)) {
        allWhiskas.push({
          x: whiskasX,
          y: whiskasY,
          radius: radius,
          type: type,
        });
      }
    }
  });
    return allWhiskas;
}

// Добавьте отдельную функцию для генерации платформ босса
function spawnBossPlatform() {
    const bossPlatform = {
        level: 1,
        x: LEVEL_LENGTH - 300,
        y: platformLevels[1],
        originalY: platformLevels[1],
        length: 5,
        effect: PLATFORM_EFFECTS.NONE,
        isSinking: false,
        sinkSpeed: 0.5 * gameSpeed,
        sinkAmount: 10,
        returnSpeed: 0.5 * gameSpeed
    };
    platforms.push(bossPlatform);
    spawnWhiskasOnPlatform(bossPlatform);
}

function getRandomSpacing() {
  return Math.floor(Math.random() * 100 + 150);
}

function isOverlapping(platforms, x, y, length) {
  for (let plat of platforms) {
    const platEndX = plat.x + plat.length * BLOCK_WIDTH;
    const currentEndX = x + length * BLOCK_WIDTH;
      if (Math.abs(y - plat.y) < 10) {
          if ((x < platEndX && x + length * BLOCK_WIDTH > plat.x)) {
            return true;
          }
      }
  }
  return false;
}

function getRandomPlatformEffect() {
  const rand = Math.random();
  if (rand < 0.05) return PLATFORM_EFFECTS.SLOW;
  if (rand < 0.1) return PLATFORM_EFFECTS.SPEED;
  return PLATFORM_EFFECTS.NONE;
}

function spawnWhiskasOnPlatform(platform) {
  const whiskasCount = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < whiskasCount; i++) {
    const type = Math.random() < 0.2 ? 'super' : 'normal';
    const radius = type === 'super' ? 20 : 10;
    const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20;
    const whiskasY = platform.originalY - radius - 5;
     if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, radius)) {
        energyItems.push({
          x: whiskasX,
          y: whiskasY,
          radius: radius,
          type: type,
        });
    }
  }
}

// =============================
// 3. Основной updateGame() и drawGame()
// =============================
function updateGame() {
    if (!gameStarted || gameOver) return;
    playMusic();
      if (gameOver && fadeAlpha < 1) {
           fadeAlpha += 0.01;
            return;
        }

  if (skillNotReadyTime > 0) {
    skillNotReadyTime -= 16.67;
    if (skillNotReadyTime <= 0) {
      skillNotReadyAlpha = 0;
    }
  }
    // Обновление состояния анимации
  if (!player.isJumping && !player.isDashing) {
      if ((keys.left || keys.right) && Math.abs(player.velocityX) > 0.5) {
          player.animationState = 'run';
      } else {
          player.animationState = 'idle';
      }
  }
  if (player.isJumping && player.performedDoubleJump) {
    player.animationState = 'double_jump';
  } else if (player.isJumping && !player.performedDoubleJump) {
    player.animationState = 'jump';
  }
 if(player.isDashing) {
     player.animationState = 'dash';
  }
    if(player.isFading){
        player.fadeTimer -= 16.67;
        player.opacity = (player.fadeTimer / player.fadeDuration);
        if (player.opacity > 1) player.opacity = 1;
           if(player.fadeTimer <= player.fadeDuration * 0.5){
               if(player.fadeTimer > 0)
                        spawnBlissParticles();
            }
      if(player.fadeTimer <= 0){
          player.isFading = false;
           player.invulnerable = false;
        }
    }
       if(!player.isFading && !player.invulnerable) {
           player.opacity = 1;
       }

  // Обработка движения игрока
   if (!player.isDashing && !player.isEntering) {
      if (keys.right) {
          player.velocityX = Math.min(player.velocityX + 0.5 * gameSpeed, player.maxSpeed * gameSpeed);
        player.direction = 'right';
      }
     if (keys.left) {
          player.velocityX = Math.max(player.velocityX - 0.5 * gameSpeed, -player.maxSpeed * gameSpeed);
          player.direction = 'left';
    }
      if (!keys.right && !keys.left) {
          player.velocityX *= player.friction;
         if (Math.abs(player.velocityX) < 0.1) {
              player.velocityX = 0;
           }
      }
  } else if (!player.isEntering){
    player.dashTimer -= 16.67;
    if (player.dashTimer <= 0) {
      endDash();
    }
  }
    
     if(player.isEntering){
        player.x += 3;
         if(player.x >= player.playerStartX){
             player.isEntering = false;
        }
     }
  // Обновление позиции игрока
   if(!player.isEntering){
        player.x += player.velocityX * gameSpeed;
        player.y += player.velocityY * gameSpeed;
      player.velocityY += player.gravity * gameSpeed;
   }
    
      // Обновление камеры
    let cameraTargetX;
    if(player.isEntering){
        cameraTargetX = player.x - 100;
      }
   else if (boss.isActive && !boss.isFlashing) {
     const baseCameraX = boss.x - canvas.width / (2 * canvasScale);
        const offset = clamp(player.x - boss.x, -150, 150);
     cameraTargetX = baseCameraX + offset;
   } else {
    cameraTargetX = player.x - (100 / canvasScale);
   }
   cameraX += (cameraTargetX - cameraX) * 0.1;

  // Проверка на приземление
  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height;
    player.velocityY = 0;
    if (player.isJumping) {
      player.isJumping = false;
      player.performedDoubleJump = false;
    }
    player.canDoubleJump = true;
  }
        
        // Вычисляем область коллизии игрока
        const collisionX = player.x + player.collisionOffsetX;
        const collisionY = player.y + player.collisionOffsetY;


    // Проверка коллизий с платформами и проседание
    platforms.forEach((platform) => {
        if (
            player.velocityY >= 0 &&
            collisionX + player.collisionWidth > platform.x &&
          collisionX < platform.x + platform.length * BLOCK_WIDTH &&
           player.y + player.height >= platform.y - 5 &&
           player.y + player.height <= platform.y + player.velocityY * gameSpeed + 1
       ) {
        player.y = platform.y - player.height;
        player.velocityY = 0;
        player.canDoubleJump = true;
        player.performedDoubleJump = false;
          if (player.isJumping) {
            platform.isSinking = true;
             player.isJumping = false;
          }
        }
        
        // Обработка проседания и возвращения платформы
        if (platform.isSinking) {
          platform.y += platform.sinkSpeed;
          if (platform.y >= platform.originalY + platform.sinkAmount){
              platform.isSinking = false;
          }
        } else if (platform.y > platform.originalY) {
         platform.y -= platform.returnSpeed;
            if (platform.y <= platform.originalY) {
                platform.y = platform.originalY;
            }
        }
    });

  // Спавн метеоров и энергетических предметов
  if (!boss.isActive) {
    if (Date.now() - spawnTimer > meteorSpawnRate) {
      spawnMeteor();
      spawnEnergy();
      spawnTimer = Date.now();
      meteorSpawnRate = Math.max(500, meteorSpawnRate - 50);
    }
    if (Date.now() - lastPursuerSpawn > pursuerSpawnRate) {
      spawnPursuer();
      lastPursuerSpawn = Date.now();
    }
  } else {
    if (Date.now() - spawnTimer > bossMeteorSpawnRate) {
      spawnMeteor();
      spawnTimer = Date.now();
    }
    if (Math.random() < 0.02) {
      spawnEnergy();
    }
  }

  // Обработка метеоров
  meteors.forEach((meteor, index) => {
    meteor.x += meteor.speedX * gameSpeed;
    meteor.y += meteor.speedY * gameSpeed;
      const dx = meteor.x - (collisionX + player.collisionWidth / 2);
    const dy = meteor.y - (collisionY + player.collisionHeight / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const collisionDistance = meteor.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2;

    if (distance < collisionDistance) {
      if (player.isDashing) {
        meteors.splice(index, 1);
        explosions.push({ x: meteor.x, y: meteor.y, radius: 10, alpha: 1 });
        lastDashKill = true;
      } else {
        playerTakeDamage(10);
        meteors.splice(index, 1);
      }
      return;
    }

    if (meteor.y >= GROUND_Y) {
      explosions.push({ x: meteor.x, y: GROUND_Y, radius: 10, alpha: 1 });
      meteors.splice(index, 1);
    }
  });

  // Обработка взрывов
  explosions.forEach((explosion, index) => {
    explosion.radius += 5 * gameSpeed;
    explosion.alpha -= 0.05;
    if (explosion.alpha <= 0) {
      explosions.splice(index, 1);
    }
  });

  // Обработка энергетических предметов
  energyItems.forEach((energyItem, index) => {
      const px = collisionX + player.collisionWidth / 2;
      const py = collisionY + player.collisionHeight / 2;
    const dx = energyItem.x - px;
   const dy = energyItem.y - py;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const collisionDistance = energyItem.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2;
    if (dist < collisionDistance) {
      if (energyItem.type === 'super') {
        player.energy += 5;
        spawnFloatingText('+5', px, py);
      } else {
        player.energy++;
        spawnFloatingText('+1', px, py);
      }
      energyItems.splice(index, 1);
      if (player.energy >= 25) {
        player.superMeowReady = true;
      }
    }
  });

  // Обработка волн мяу
  meowWaves.forEach((wave, wIndex) => {
    wave.radius += wave.speed * gameSpeed;
    wave.alpha -= 0.01 * gameSpeed;
    if (wave.alpha <= 0) {
      meowWaves.splice(wIndex, 1);
    }
  });

  // Обработка преследователей
    if (!boss.isActive) {
    pursuers.forEach((pursuer, pIndex) => {
       if (!pursuer.active && pursuer.x - cameraX < canvas.width) {
        pursuer.active = true;
      }
      if (pursuer.active) {
         if (pursuer.x > collisionX) {
          pursuer.speedX = Math.max(pursuer.speedX - pursuer.acceleration * gameSpeed, -pursuer.maxSpeed * gameSpeed);
        } else {
         pursuer.speedX = Math.min(pursuer.speedX + pursuer.acceleration * gameSpeed, pursuer.maxSpeed * gameSpeed);
        }
        pursuer.x += pursuer.speedX * gameSpeed;

          const dx = (pursuer.x + pursuer.width / 2) - (collisionX + player.collisionWidth / 2);
          const dy = (pursuer.y - pursuer.height / 2) - (collisionY + player.collisionHeight / 2);
          const dist = Math.sqrt(dx * dx + dy * dy);
           const collisionDistance = (pursuer.width / 2) + (player.collisionWidth / 2);

        if (dist < collisionDistance) {
          if (player.isDashing) {
            pursuers.splice(pIndex, 1);
            lastDashKill = true;
          } else {
             playerTakeDamage(5);
            pursuers.splice(pIndex, 1);
         }
        }

        if (!pursuer.spotted && Math.abs(pursuer.x - collisionX) < 300) {
          pursuer.spotted = true;
        }
        if (pursuer.spotted) {
          pursuer.exclamationTimer += 1;
          if (pursuer.exclamationTimer >= 30) {
            pursuer.showExclamation = !pursuer.showExclamation;
           pursuer.exclamationTimer = 0;
          }
        }
      }
      if (pursuer.x - cameraX < -pursuer.width) {
        pursuers.splice(pIndex, 1);
      }
    });
  } else {
    pursuers = [];
  }
    
  // Отображение предупреждения "Danger!"
  showDanger = meteors.some(m => m.x - cameraX < canvas.width + 150 && m.x - cameraX > canvas.width);
  if (showDanger) {
    if (dangerFading) dangerAlpha -= 0.05;
    else dangerAlpha += 0.05;
    if (dangerAlpha <= 0.3) dangerFading = false;
    if (dangerAlpha >= 1) dangerFading = true;
  } else {
    dangerAlpha = 1;
  }

  // Активация босса
  if (!boss.isActive && player.x >= boss.x - 100) {
    activateBoss();
  }

  // Обновление босса
  if (boss.isActive) {
    updateBoss();
  }

  // Обновление анимаций и интерфейса
  updateAnimations();
   if(player.isDashing){
        updateDashAnimations();
    }
   if (!player.isFading) {
        updateBlissParticles()
   }
  updateMeowButtonCooldown();
  updateDashButtonCooldownAll();
  updateComboMessage();

  // Обработка плавающего текста
  floatingTexts.forEach((ft, i) => {
    ft.y += ft.vy;
    ft.alpha -= 0.01;
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1);
    }
  });

  // Обработка частиц даша и урона
  dashParticles = dashParticles.filter(p => {
    p.x += p.vx * gameSpeed;
    p.y += p.vy * gameSpeed;
    p.alpha -= 0.02;
    return p.alpha > 0;
  });

  damageParticles = damageParticles.filter(dp => {
    dp.x += dp.vx * gameSpeed;
    dp.y += dp.vy * gameSpeed;
    dp.alpha -= 0.02;
    return dp.alpha > 0;
  });
}

function updateDashButtonCooldownAll() {
}

function drawGame(screenWidth, screenHeight) {
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
        const offsetX = canvasOffsetX;
        const offsetY = canvasOffsetY;
          ctx.translate(Math.round(offsetX), Math.round(offsetY));
        ctx.scale(canvasScale, canvasScale);

  // Рисуем слои фона
  drawLayer(layers.background, cameraX * 0.2,0 ,screenHeight);
  drawLayer(layers.buildingsMid, cameraX * 0.5,0,screenHeight);
  drawLayer(layers.baseFront, cameraX * 0.8, screenHeight - layers.baseFront.height * canvasScale ,layers.baseFront.height * canvasScale);

  // Рисуем платформы
  platforms.forEach((platform) => {
    const platformY = platform.y - BLOCK_HEIGHT;
    for (let i = 0; i < platform.length; i++) {
      const blockX = platform.x + i * BLOCK_WIDTH - cameraX;
      ctx.drawImage(layers.platformBlock, blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT);

      // Применяем эффекты платформ
      if (platform.effect !== PLATFORM_EFFECTS.NONE) {
        if (platform.effect === PLATFORM_EFFECTS.SLOW) {
          if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = 'rgba(0,255,255,0.3)';
            ctx.fillRect(blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT);
          }
        }
        if (platform.effect === PLATFORM_EFFECTS.SPEED) {
          if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,165,0,0.3)';
            ctx.fillRect(blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT);
          }
        }
      }
    }
  });

  // Рисуем метеоры и взрывы
  meteors.forEach(m => drawCircle(m, "red"));
  explosions.forEach(e => drawCircle(e, "orange"));

  // Рисуем энергетические предметы
  energyItems.forEach(eItem => {
    if (eItem.type === 'super') {
      ctx.drawImage(layers.superWhiskas, eItem.x - cameraX - eItem.radius, eItem.y - eItem.radius, eItem.radius * 2, eItem.radius * 2);
    } else {
      ctx.drawImage(layers.whiskas, eItem.x - cameraX - eItem.radius, eItem.y - eItem.radius, eItem.radius * 2, eItem.radius * 2);
    }
  });

  // Рисуем преследователей
  pursuers.forEach(p => {
    ctx.drawImage(layers.pursuer, p.x - cameraX, p.y - p.height, p.width, p.height);
    if (p.spotted && p.showExclamation) {
      ctx.drawImage(layers.exclamationMark, p.x - cameraX - 10, p.y - 30, 20, 20);
    }
  });

  // Рисуем выстрелы босса
  boss.shots.forEach(shot => {
    ctx.save();
    ctx.globalAlpha = shot.fadeOut ? shot.alpha : 1;
    ctx.beginPath();
    ctx.arc(shot.x - cameraX, shot.y, shot.radius, 0, Math.PI * 2);
    ctx.fillStyle = shot.color;
    ctx.fill();
    ctx.restore();
  });

  // Рисуем волны мяу
  meowWaves.forEach(w => {
    ctx.save();
    ctx.globalAlpha = w.alpha;
    ctx.lineWidth = 2;
    if (w.super) {
      ctx.strokeStyle = 'rgba(0,255,255,0.5)';
    } else {
      ctx.strokeStyle = 'rgba(255,0,255,0.5)';
    }
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - cameraX, player.y + player.height / 2, w.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  });

  // Рисуем частицы даша
  dashParticles.forEach(p => {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p.x - cameraX, p.y);
    ctx.lineTo(p.x - cameraX - p.vx * 2, p.y - p.vy * 2);
    ctx.stroke();
    ctx.restore();
  });

  // Рисуем частицы урона
  damageParticles.forEach(dp => {
    ctx.save();
    ctx.globalAlpha = dp.alpha;
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(dp.x - cameraX, dp.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
    
    // Рисуем частицы бдисса
    if(!player.isFading) {
      blissParticles.forEach(p => {
           ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
          ctx.fillRect(p.x - cameraX, p.y, 5, 5);
      });
    }

  // Рисуем полоску HP над игроком
  drawPlayerHpBar();

  // Рисуем игрока
  ctx.save();
    ctx.globalAlpha = player.opacity;
    let playerImage = idleFrames[idleFrameIndex];
     if (player.animationState === 'idle') {
        playerImage = idleFrames[idleFrameIndex];
      } else if (player.animationState === 'run') {
       playerImage = runFrames[runFrameIndex];
     } else if (player.animationState === 'jump' && !player.performedDoubleJump) {
        playerImage = jumpFrames[jumpFrameIndex];
    } else if (player.animationState === 'double_jump') {
       playerImage = doubleJumpFrames[doubleJumpFrameIndex];
     } else if (player.animationState === 'dash') {
          playerImage = dashFrames[dashFrameIndex];
      }
     if (player.direction === 'left') {
        ctx.scale(-1, 1);
         ctx.drawImage(playerImage, -(player.x + player.width) + cameraX, player.y, player.width, player.height);
     } else {
       ctx.drawImage(playerImage, player.x - cameraX, player.y, player.width, player.height);
      }
    ctx.restore();

   // Рисуем область коллизии
    if (showCollisionBox) {
        drawCollisionBox();
   }

  // Рисуем интерфейс
    const energyIconX = 20;
    const energyIconY = 20;
    ctx.drawImage(layers.energyIcon, energyIconX, energyIconY, 30, 30);
    ctx.fillStyle = "white";
      ctx.font = "20px 'Micro 5', sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(`${player.energy}`, energyIconX + 40, energyIconY + 25);

    const progressX = 20;
    const progressY = 60;
    const progressWidth = 300;
    const progressHeight = 20;
    ctx.fillStyle = "#555";
    ctx.fillRect(progressX, progressY, progressWidth, progressHeight);
    ctx.fillStyle = "#0f0";
    const progress = Math.min(player.x / LEVEL_LENGTH, 1);
    ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(progressX, progressY, progressWidth, progressHeight);
    ctx.fillStyle = "#fff";
     ctx.font = "20px 'Micro 5', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Progress to Boss", progressX + progressWidth/2, progressY + 15);

  ctx.fillStyle = "white";
     ctx.font = "20px 'Micro 5', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(`${Math.ceil(gameTimer)}s`, canvas.width / 2, 30);

  // Рисуем босса и его интерфейс
  if (boss.isActive) {
    ctx.drawImage(layers.boss, boss.x - cameraX - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height);
    const healthBarX = canvas.width - 200;
    const healthBarY = 50;
      const healthBarWidth = 150;
    ctx.drawImage(layers.bossHealthBar, healthBarX, healthBarY, healthBarWidth, 20);
    ctx.fillStyle = "#f00";
    const bossHPWidth = (boss.hp / 10) * healthBarWidth;
    ctx.fillRect(healthBarX, healthBarY, bossHPWidth, 20);
    ctx.strokeStyle = "#fff";
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 20);
    ctx.fillStyle = "#fff";
     ctx.font = "20px 'Micro 5', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`Boss HP: ${boss.hp}/10`, healthBarX + healthBarWidth /2, healthBarY + 15);
  }

  // Рисуем предупреждение "Danger!"
  if (showDanger) {
    ctx.fillStyle = `rgba(255,0,0,${dangerAlpha})`;
      ctx.font = "20px 'Micro 5', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("Danger!", canvas.width - 10, canvas.height / 2 - 30);
    ctx.beginPath();
    ctx.moveTo(canvas.width - 20, canvas.height / 2);
    ctx.lineTo(canvas.width - 50, canvas.height / 2 - 20);
    ctx.lineTo(canvas.width - 50, canvas.height / 2 + 20);
    ctx.closePath();
    ctx.fill();
  }

  // Рисуем плавающий текст
  floatingTexts.forEach(ft => {
    ctx.save();
    ctx.globalAlpha = ft.alpha;
     ctx.font = "20px 'Micro 5', sans-serif";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText(ft.text, ft.x - cameraX, ft.y);
    ctx.restore();
  });

  // Рисуем "Skill not ready"
  if (skillNotReadyAlpha > 0) {
    drawSkillNotReady();
  }

  // Рисуем сообщение комбо
  if (comboMessageAlpha > 0 && comboMessage) {
    drawComboMessage();
  }
    
   if (gameOver && fadeAlpha > 0) {
     ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.restore(); // Завершаем масштабирование канваса
}

// =============================
// 4. Логика Босса
// =============================
function updateBoss() {
  if (!boss.flashStartTime) {
    boss.flashStartTime = Date.now();
    boss.isFlashing = true;
    gameSpeed = 0.5;
  }
  if (boss.isFlashing) {
    const elapsed = Date.now() - boss.flashStartTime;
    if (elapsed < 1000) {
      boss.flashVisible = Math.floor(elapsed / 100) % 2 === 0;
    } else if (elapsed < 3000) {
      boss.flashVisible = Math.floor((elapsed - 1000) / 500) % 2 === 0;
    } else {
      boss.isFlashing = false;
      boss.flashVisible = false;
      gameSpeed = originalGameSpeed;
    }
  }
  if (boss.descendActive) {
    boss.targetY = boss.descendY;
  } else {
    boss.targetY = boss.initialY;
  }
  boss.y += (boss.targetY - boss.y) * 0.1;

  if (!boss.descendActive && Date.now() > boss.nextDescendTime) {
    boss.descendActive = true;
    boss.descendTimer = boss.descendDuration;
    boss.shots.forEach(shot => {
      shot.fadeOut = true;
      shot.alpha = 1;
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 4;
      shot.vx = Math.cos(angle) * speed;
      shot.vy = Math.sin(angle) * speed;
    });
  }
  if (boss.descendActive) {
    boss.descendTimer -= 16.67;
    if (boss.descendTimer <= 0) {
      boss.descendActive = false;
      boss.nextDescendTime = Date.now() + getRandomInterval(5000, 10000);
      spawnWhiskasOnGround();
    }
  } else {
    if (!boss.isFlashing && Date.now() - boss.lastNewAttackTime > boss.newAttackCooldown) {
      boss.newAttackReady = true;
      boss.lastNewAttackTime = Date.now();
    }
    if (!boss.isFlashing && boss.newAttackReady) {
      bossNewAttack();
      boss.newAttackReady = false;
    }
    if (!boss.isFlashing && Date.now() - boss.lastShotTime > boss.shotInterval) {
      boss.shots.push(...shootBossShots(boss));
      boss.lastShotTime = Date.now();
    }
  }

  // Обработка выстрелов босса
  boss.shots.forEach((shot, sIndex) => {
    if (shot.fadeOut) {
      shot.x += shot.vx * gameSpeed;
      shot.y += shot.vy * gameSpeed;
      shot.alpha -= 0.01;
      if (shot.alpha <= 0) {
        boss.shots.splice(sIndex, 1);
      }
    } else if (shot.newAttack) {
      shot.timer -= 16.67;
      if (shot.timer <= 0 && shot.speed === 0) {
        const dx = (player.x + player.width / 2) - shot.x;
        const dy = (player.y + player.height / 2) - shot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        shot.vx = (dx / dist) * 8;
        shot.vy = (dy / dist) * 8;
        shot.speed = 8;
      }
      if (shot.speed > 0) {
        shot.x += shot.vx * gameSpeed;
        shot.y += shot.vy * gameSpeed;
         const dx = shot.x - (player.x + player.width / 2);
          const dy = shot.y - (player.y + player.height / 2);
         const dist = Math.sqrt(dx * dx + dy * dy);
        const collisionDistance = shot.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2;
        if (dist < collisionDistance) {
           playerTakeDamage(15);
          boss.shots.splice(sIndex, 1);
        }
        if (
          shot.x - cameraX < -shot.radius || shot.x - cameraX > canvas.width + shot.radius ||
          shot.y < -shot.radius || shot.y > canvas.height + shot.radius
        ) {
          boss.shots.splice(sIndex, 1);
        }
      }
    } else {
      shot.angle += shot.angularSpeed * gameSpeed;
      shot.x += shot.speed * Math.cos(shot.angle) * gameSpeed;
      shot.y += shot.speed * Math.sin(shot.angle) * gameSpeed;
        const dx = shot.x - (player.x + player.width / 2);
        const dy = shot.y - (player.y + player.height / 2);
       const dist = Math.sqrt(dx * dx + dy * dy);
      const collisionDistance = shot.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2;
      if (dist < collisionDistance) {
          playerTakeDamage(15);
        boss.shots.splice(sIndex, 1);
      }
      if (
        shot.x - cameraX < -shot.radius || shot.x - cameraX > canvas.width + shot.radius ||
        shot.y < -shot.radius || shot.y > canvas.height + shot.radius
      ) {
        boss.shots.splice(sIndex, 1);
      }
    }
  });

  // Проверка столкновения игрока с боссом
    const dxB = boss.x - (player.x + player.width / 2);
     const dyB = boss.y - (player.y + player.height / 2);
     const distB = Math.sqrt(dxB * dxB + dyB * dyB);
   const collisionDistB = (boss.width / 2 + player.width / 2);
  /*if (distB < collisionDistB) {
    if (player.y + player.height <= boss.y - boss.height / 4) {
      boss.hp -= 2;
      if (boss.hp <= 0) {
        victory = true;
        endGame(true);
      } else {
        player.velocityY = player.jumpStrength;
        player.isJumping = true;
      }
    } else {
      playerTakeDamage(1);
    }
  }*/ // Убрали урон от соприкосновения с боссом
  if (boss.hp <= 0) {
    victory = true;
    endGame(true);
  }
}

function bossNewAttack() {
  const numOrbs = 3;
  for (let i = 0; i < numOrbs; i++) {
    const angle = (Math.PI * 2 / numOrbs) * i;
    boss.shots.push({
      x: boss.x,
      y: boss.y,
      radius: 15,
      speed: 0,
      angle: angle,
      angularSpeed: 0,
      color: "orange",
      fadeOut: false,
      newAttack: true,
      timer: 1000,
      vx: 0,
      vy: 0,
    });
  }
}

// =============================
// 5. Доп. функции
// =============================
function drawCircle(object, color) {
  ctx.beginPath();
  ctx.arc(object.x - cameraX, object.y, object.radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLayer(image, offsetX, yOffset = 0, targetHeight) {
    const targetWidth = (image.width / image.height) * targetHeight;
    const posX = (-offsetX % targetWidth) ;
    ctx.drawImage(image, Math.round(posX), Math.round(yOffset), Math.round(targetWidth), Math.round(targetHeight));
      if (posX + targetWidth < canvas.width) {
          ctx.drawImage(image, Math.round(posX + targetWidth), Math.round(yOffset), Math.round(targetWidth), Math.round(targetHeight));
      }
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function activateBoss() {
  boss.isActive = true;
  boss.isFlashing = true;
  boss.flashStartTime = Date.now();
   boss.x = cameraX + canvas.width + 100;
  boss.targetX = cameraX + canvas.width / 2;
  boss.y = platformLevels[1];
  boss.targetY = boss.initialY;
  gameSpeed = 0.2;
}

function isWhiskasTooClose(items, x, y, radius) {
  for (let item of items) {
    const dx = item.x - x;
    const dy = item.y - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < (item.radius + radius + 20)) {
      return true;
    }
  }
  return false;
}

function spawnWhiskasOnGround() {
    for (let i = 0; i < 3; i++) {
        let gx = player.x + (Math.random() * 400 - 200);
        if (gx < cameraX) gx = cameraX + 50;
        const whiskasY = GROUND_Y - 10;
        const whiskasX = gx;
       if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, 10)) {
          energyItems.push({
            x: gx,
            y: whiskasY,
            radius: 10,
             type: 'normal',
        });
       }
    }
}

function spawnMeteor() {
  if (!boss.isActive) {
    const spawnX = cameraX + canvas.width + Math.random() * 500;
    const speedX = (-2 - Math.random() * 2) * gameSpeed;
    const speedY = (1 + Math.random() * 6) * gameSpeed;
    meteors.push({ x: spawnX, y: 50, speedX, speedY, radius: 20 });
  } else {
    const spawnX = cameraX + Math.random() * canvas.width;
    const speedY = (2 + Math.random() * 4) * gameSpeed;
    const meteorCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < meteorCount; i++) {
      meteors.push({
        x: spawnX + Math.random() * 100 - 50,
        y: 50,
        speedX: 0,
        speedY: speedY,
        radius: 20,
      });
    }
  }
}

function spawnEnergy() {
  const spawnChance = Math.random();
  if (spawnChance < 0.5) {
    // Спавн на платформе
    if (platforms.length > 0) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)];
        const whiskasY = platform.originalY - 15;
      const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20;
        if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, 10)) {
             const type = Math.random() < 0.1 ? 'super' : 'normal';
             const radius = type === 'super' ? 20 : 10;
          energyItems.push({ x: whiskasX, y: whiskasY, radius, type });
      }
    }
  } else {
    // Спавн в воздухе между платформами
    const midX = player.x + canvas.width / 2 + Math.random() * 300;
    const midY = GROUND_Y - PLATFORM_VERTICAL_SPACING * 1.5;
     if (!isWhiskasTooClose(energyItems, midX, midY - 5, 10)) {
        energyItems.push({ x: midX, y: midY - 5, radius: 10, type: 'normal' });
      }
  }
}

function spawnPursuer() {
  if (boss.isActive) return;
  const spawnX = cameraX + canvas.width + Math.random() * 500;
  const spawnY = GROUND_Y;
  pursuers.push({
    x: spawnX,
    y: spawnY,
    speedX: 0,
    acceleration: 0.05 * gameSpeed,
    maxSpeed: 5 * gameSpeed,
    active: false,
    width: 140,
    height: 70,
    spotted: false,
    exclamationTimer: 0,
    showExclamation: false,
  });
}

function shootBossShots(boss) {
  const shots = [];
  const centerX = boss.x;
  const centerY = boss.y;
  const numShots = 10;
  const angleIncrement = Math.PI / 4;
  const initialAngle = Math.random() * Math.PI * 2;
  for (let i = 0; i < numShots; i++) {
    const angle = initialAngle + i * angleIncrement;
    shots.push({
      x: centerX,
      y: centerY,
      radius: 10,
      speed: 5,
      angle: angle,
      angularSpeed: 0.1,
      color: "green",
      fadeOut: false,
    });
  }
  return shots;
}

function handleJump() {
  if (!player.alive || gameOver || player.isFading) return;
  const onGround = player.y >= GROUND_Y - player.height ||
    platforms.some(platform =>
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.length * BLOCK_WIDTH &&
      player.y + player.height >= platform.y - 10 &&
      player.y + player.height <= platform.y + 10
    );

  if (onGround) {
    player.velocityY = player.jumpStrength;
    player.canDoubleJump = true;
    player.isJumping = true;
    player.performedDoubleJump = false;
  } else if (player.canDoubleJump) {
    player.velocityY = player.jumpStrength;
    player.canDoubleJump = false;
    player.isJumping = true;
    player.performedDoubleJump = true;
  }
}

function updateMeowButtonCooldown() {
  const currentTime = Date.now();
  const timeSinceLastMeow = currentTime - lastSkillTime;
  if (timeSinceLastMeow < skillCooldown) {
    const percentage = (skillCooldown - timeSinceLastMeow) / skillCooldown;
    meowBtn.disabled = true;
    meowBtn.classList.add('cooldown');
     meowBtn.style.background = `linear-gradient(to right, rgba(255,255,255,0.3) ${percentage * 100}%, rgba(255,255,255,0) ${percentage * 100}%)`;
  } else {
    meowBtn.disabled = false;
    meowBtn.classList.remove('cooldown');
    meowBtn.style.background = '';
  }
}

function handleSkill() {
    if (!player.alive || gameOver || player.isFading) return;
    const now = Date.now();
    if (now - lastSkillTime < skillCooldown) {
        showSkillNotReady();
        return;
    }
    player.isFading = true;
   player.fadeTimer = player.fadeDuration;
    player.invulnerable = true;
    lastSkillTime = now;
   spawnBlissParticles();
    createNormalMeow();
    updateMeowButtonCooldown();
}

function createNormalMeow() {
  const direction = player.direction;
  const numWaves = 5;
  const waveInterval = 200;
  for (let i = 0; i < numWaves; i++) {
    setTimeout(() => {
      meowWaves.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        radius: 50,
        speed: 2,
        alpha: 1,
        super: false,
        direction: direction,
      });
    }, i * waveInterval);
  }
}


function createSuperMeow() {
  const direction = player.direction;
  const numWaves = 10;
  const waveInterval = 100;
  for (let i = 0; i < numWaves; i++) {
    setTimeout(() => {
      meowWaves.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        radius: 80,
        speed: 3,
        alpha: 1,
        super: true,
        direction: direction,
      });
    }, i * waveInterval);
  }
}

function showSuperMeowReady() {
  superMeowReadyEl.style.opacity = 1;
  setTimeout(() => {
    superMeowReadyEl.style.transition = 'opacity 1s';
    superMeowReadyEl.style.opacity = 0;
    setTimeout(() => {
      superMeowReadyEl.style.transition = 'opacity 0.5s';
    }, 1000);
  }, 0);
}

function performSwipeDash(angle) {
  if (player.isDashing) return;

  player.isDashing = true;
  player.dashTimer = DASH_DURATION;
  player.invulnerable = true;
      player.animationState = 'dash';

  if (comboCount === 0) {
    lastDashTime = Date.now();
      }
  lastDashKill = false;

  const DASH_SPEED = 16;
  player.velocityX = Math.cos(angle) * DASH_SPEED;
  player.velocityY = Math.sin(angle) * DASH_SPEED;

  for (let i = 0; i < 10; i++) {
    dashParticles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      alpha: 1,
    });
  }
}

function endDash() {
  player.isDashing = false;
  player.invulnerable = false;
  player.velocityX = 0;
  player.velocityY = 0;

  if (lastDashKill) {
    comboCount++;
    lastDashTime = 0;
      if (comboCount >= 5) {
       player.hp = Math.min(player.hp + 5, 100);
          spawnFloatingText("+5HP", player.x + player.width / 2, player.y - 50);
        }
    showComboText();
  } else {
    comboCount = 0;
  }
}

function showComboText() {
  comboMessageAlpha = 1;
  comboMessageStart = Date.now();
  if (comboCount >= 5) {
      comboMessage = "SCAMRAGE!!!";
    } else if (comboCount >= 2) {
    comboMessage = `COMBO x${comboCount}`;
  } else {
    comboMessage = "";
  }
}

function updateComboMessage() {
  if (!comboMessage) return;
  const elapsed = Date.now() - comboMessageStart;
  const duration = 2000;
  if (elapsed >= duration) {
    comboMessageAlpha = 0;
    comboMessage = "";
  } else {
    const t = elapsed / duration;
    comboMessageAlpha = 1 - t;
  }
}

function drawSkillNotReady() {
   const x = (player.x + player.width / 2) - cameraX;
    const y = player.y - 20;
    ctx.save();
       ctx.font = "20px 'Micro 5', sans-serif";
    ctx.fillStyle = `rgba(255,0,0,${skillNotReadyAlpha})`;
    ctx.textAlign = "center";
    ctx.fillText("Skill not ready", x, y);
    ctx.restore();
}

function showSkillNotReady() {
  skillNotReadyAlpha = 1;
  skillNotReadyTime = 1000;
}

function drawComboMessage() {
  ctx.save();
    ctx.font = "bold 36px 'Micro 5', sans-serif";
  const colors = ["red", "yellow", "blue", "lime", "magenta"];
  const colorIndex = Math.floor(Date.now() / 200) % colors.length;
  ctx.fillStyle = `rgba(${colors[colorIndex]},${comboMessageAlpha})`;
  ctx.textAlign = "center";
  const posX = canvas.width / (2 * canvasScale);
    const posY = canvas.height * 0.25 / canvasScale;
  ctx.fillText(comboMessage, posX, posY);
  ctx.restore();
}

function drawPlayerHpBar() {
  const barWidth = 50;
  const barHeight = 5;
    const x = (player.x + player.width / 2 - cameraX - barWidth / 2) / canvasScale;
    const y = player.y / canvasScale - 20;

  // Основа полоски (черный)
  ctx.fillStyle = "#000";
  ctx.fillRect(x, y, barWidth, barHeight);

  // Полоска HP (красная)
  const hpWidth = (player.hp / 100) * barWidth;
  ctx.fillStyle = "#f00";
  ctx.fillRect(x, y, hpWidth, barHeight);
}

function drawCollisionBox() {
  if(!showCollisionBox) return;
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 1;
    const collisionX = (player.x + player.collisionOffsetX - cameraX) / canvasScale;
    const collisionY = (player.y + player.collisionOffsetY) / canvasScale;
    ctx.strokeRect(collisionX, collisionY, player.collisionWidth / canvasScale, player.collisionHeight / canvasScale);
}

function playerTakeDamage(amount) {
  if (player.invulnerable) return;
  player.hp -= amount;
  spawnDamageParticles(player.x + player.width / 2, player.y + player.height / 2, 10);
  if (player.hp <= 0) {
    player.alive = false;
    endGame();
  }
}

function spawnDamageParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 2 + 1;
    damageParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
    });
  }
}

function spawnFloatingText(text, x, y) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    alpha: 1,
    vy: -0.5
  });
}

function checkCheatCode(code) {
  if (cheatActivated) return;
  if (code === cheatSequence[cheatIndex]) {
    cheatIndex++;
    if (cheatIndex === cheatSequence.length) {
      cheatActivated = true;
      player.invulnerable = true;
        showCollisionBox = 1;
      // Можно добавить уведомление об активации чит-кода
      spawnFloatingText("Cheat Activated!", player.x + player.width / 2, player.y - 50);
    }
  } else {
    cheatIndex = 0;
  }
}
function spawnBlissParticles(){
    for (let i = 0; i < blissSpawnRate; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        const x = player.x + player.width / 2 + Math.cos(angle) * 20;
        const y = player.y + player.height / 2 + Math.sin(angle) * 20;
        blissParticles.push({
            x: x,
           y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            alpha: 1,
         initialTime: Date.now(),
      });
    }
}

function updateBlissParticles(){
    blissParticles.forEach((p, i) => {
    const elapsed = Date.now() - p.initialTime;
      const duration = 500;
        if(elapsed > duration) {
            blissParticles.splice(i, 1);
       } else {
          p.alpha = 1 - (elapsed/duration);
            p.x += p.vx * gameSpeed;
           p.y += p.vy * gameSpeed;
       }
  });
}
// =============================
// 6. Сброс / restart
// =============================
function startGame() {
  gameStarted = true;
  startScreen.style.display = "none";
  victoryScreen.style.display = "none";
  gameOverScreen.style.display = "none";
  resetGame();
}

function restartGame() {
  gameOverScreen.style.display = "none";
  victoryScreen.style.display = "none";
  resetGame();
}

function resetGame() {
   canvas.width = BASE_CANVAS_WIDTH;
    canvas.height = BASE_CANVAS_HEIGHT;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    canvasScale = screenHeight / BASE_CANVAS_HEIGHT;

    canvas.width = Math.round(Math.max(screenWidth, BASE_CANVAS_WIDTH * canvasScale));
      canvas.height = Math.round(screenHeight);
    canvasOffsetX = (screenWidth - canvas.width) / 2;
    canvasOffsetY = 0;
      GROUND_Y = screenHeight - layers.baseFront.height * canvasScale;
    player.x = -100;
    player.playerStartX = 100;
  player.y = GROUND_Y - player.height;
  player.velocityY = 0;
  player.velocityX = 0;
  player.energy = 0;
  player.superMeowReady = false;
  player.alive = true;
  player.hp = 100;
    // Вычисляем область коллизии игрока
      player.collisionWidth = player.width * 0.85;
    player.collisionHeight = player.height * 0.85;
    player.collisionOffsetX = (player.width - player.collisionWidth) / 2;
    player.collisionOffsetY = (player.height - player.collisionHeight) / 2;
   player.isEntering = true;
    player.isFading = false;
     player.fadeTimer = 0;
    player.skillOpacity = 1;
  player.direction = 'right';
  player.animationState = 'idle';
  player.isJumping = false;
  player.isDashing = false;
  player.dashTimer = 0;
  player.opacity = 1;
    player.invulnerable = cheatActivated ? true : false;

  dashParticles = [];
  meowWaves = [];
  meteors = [];
  explosions = [];
  energyItems = [];
  pursuers = [];
  platforms = [];
  floatingTexts = [];
  damageParticles = [];
      blissParticles = [];
      fadeAlpha = 0;


  cameraX = -200;
  spawnTimer = Date.now();
  meteorSpawnRate = 2000;
  lastPursuerSpawn = Date.now();
  pursuerSpawnRate = 5000;
  bossMeteorSpawnRate = 1000;
  gameOver = false;
  victory = false;
      
  document.body.style.overflow = 'hidden';
    

  clearInterval(timerInterval);
  gameTimer = 60;
  startTimer();

  boss.hp = 10;
  boss.isActive = false;
  boss.shots = [];
  boss.lastShotTime = 0;
  boss.y = platformLevels[1];
  boss.flashStartTime = null;
  boss.isFlashing = false;
  boss.flashVisible = false;
  boss.descendActive = false;
  boss.descendTimer = 0;
  boss.nextDescendTime = Date.now() + getRandomInterval(5000, 10000);
  boss.newAttackReady = false;
  boss.lastNewAttackTime = Date.now();

  lastMeowTime = 0;
  lastDashTime = 0;
    lastSkillTime = 0;

  comboCount = 0;
  lastDashKill = false;
  skillNotReadyAlpha = 0;
  skillNotReadyTime = 0;

  // Генерируем платформы и вискасы для всего уровня
  platforms = generateLevelPlatforms();
  energyItems = generateLevelWhiskas(platforms);
  spawnBossPlatform();

  superMeowReadyEl.style.opacity = 0;
  resetButtons();
  requestAnimationFrame(gameLoop);
}

// =============================
// 7. Логика игры
// =============================
function endGame(victoryCondition = false) {
  gameOver = true;
  clearInterval(timerInterval);

  if (victoryCondition) {
    victoryScreen.style.display = "flex";
    victoryScoreEl.textContent = `Поздравляем! Вы победили босса и собрали energy: ${player.energy}`;
  } else if (player.hp <= 0) {
    finalScoreEl.textContent = `Игра окончена! Вы собрали energy: ${player.energy}`;
    gameOverScreen.style.display = "flex";
  } else if (gameTimer <= 0) {
    finalScoreEl.textContent = `Время вышло! Вы собрали energy: ${player.energy}`;
    gameOverScreen.style.display = "flex";
  }
}
// =============================
// 11. Инициализация и запуск
// =============================
function resetButtons() {
  meowBtn.disabled = false;
  meowBtn.classList.remove('cooldown');
  meowBtn.style.opacity = 1;
  meowBtn.style.background = '';

  leftBtn.disabled = false;
  leftBtn.classList.remove('cooldown');
  leftBtn.style.opacity = 1;
  leftBtn.style.background = '';

  rightBtn.disabled = false;
  rightBtn.classList.remove('cooldown');
  rightBtn.style.opacity = 1;
  rightBtn.style.background = '';

  dashBtn.disabled = false;
  dashBtn.classList.remove('cooldown');
}

function startTimer() {
  timerInterval = setInterval(() => {
    gameTimer -= 1;
    if (gameTimer <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function playMusic() {
  if (!musicPlayed) {
    gameMusic.loop = true;
    gameMusic.play().catch(error => {
      console.warn("Не удалось воспроизвести музыку:", error);
    });
    musicPlayed = true;
  }
}

function gameLoop() {
  if (!gameOver && gameStarted) {
    updateGame();
       drawGame(screenWidth, screenHeight);
    requestAnimationFrame(gameLoop);
  }
}

function handleResize() {
    canvas.width = BASE_CANVAS_WIDTH;
    canvas.height = BASE_CANVAS_HEIGHT;
    screenWidth = window.innerWidth;
    screenHeight = window.innerHeight;

    canvasScale = screenHeight / BASE_CANVAS_HEIGHT;

    canvas.width = Math.round(Math.max(screenWidth, BASE_CANVAS_WIDTH * canvasScale));
    canvas.height = Math.round(screenHeight);
    canvasOffsetX = (screenWidth - canvas.width) / 2;
    canvasOffsetY = 0;
     GROUND_Y = screenHeight - layers.baseFront.height * canvasScale;

     const uiTop = 20 / canvasScale; // Положение 20px от верхнего края
     const uiBottom = (screenHeight / canvasScale) - 80; // Положение 80px от нижнего края

      controls.style.bottom = uiBottom + "px";
      superMeowReadyEl.style.top = uiTop + "px";
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// =============================
// 12. Обновление анимаций
// =============================
function updateAnimations() {
  if (player.animationState === 'idle') {
    idleFrameTimer++;
    if (idleFrameTimer >= idleFrameInterval) {
      idleFrameTimer = 0;
      idleFrameIndex = (idleFrameIndex + 1) % idleFrames.length;
    }
  } else if (player.animationState === 'run') {
    runFrameTimer++;
    if (runFrameTimer >= runFrameInterval) {
      runFrameTimer = 0;
      runFrameIndex = (runFrameIndex + 1) % runFrames.length;
    }
  } else if (player.animationState === 'jump' && !player.performedDoubleJump) {
    jumpFrameTimer++;
    if (jumpFrameTimer >= jumpFrameInterval) {
      jumpFrameTimer = 0;
      jumpFrameIndex = (jumpFrameIndex + 1) % jumpFrames.length;
    }
  } else if (player.animationState === 'double_jump') {
    doubleJumpFrameTimer++;
    if (doubleJumpFrameTimer >= doubleJumpFrameInterval) {
      doubleJumpFrameTimer = 0;
      doubleJumpFrameIndex = (doubleJumpFrameIndex + 1) % doubleJumpFrames.length;
    }
  }
}

function updateDashAnimations() {
     dashFrameTimer++;
      if (dashFrameTimer >= dashFrameInterval) {
         dashFrameTimer = 0;
         dashFrameIndex = (dashFrameIndex + 1) % dashFrames.length;
    }
}

// =============================
// 13. Запуск игры при загрузке
// =============================
window.onload = () => {
     handleResize()
           window.addEventListener('resize', handleResize);

    // Telegram Mini Apps settings
    if(window.Telegram) {
        //Отключаем свайпы по области контента
       window.Telegram.WebApp.disableVerticalSwipes();

        //Запрос на фулл скрин
          if(window.Telegram.WebApp.isVersionAtLeast("8.0")) {
                try {
                     window.Telegram.WebApp.requestFullscreen();
                     console.log("isFullScreen: " + window.Telegram.WebApp.isFullscreen);
                } catch (e) {
                   console.error("Ошибка при попытке фуллскрина:", e);
                }
            }

        if (window.Telegram.WebApp.platform === "ios") {
             window.Telegram.WebApp.expand();
            console.log("isFullScreen: " + window.Telegram.WebApp.isExpanded);
          }
          
         if(window.Telegram.WebApp.isExpanded){
            handleResize()
        }
        
          window.Telegram.WebApp.onEvent("viewportChanged", handleResize);
         window.Telegram.WebApp.onEvent("fullscreenChanged", ()=> {
           console.log("isFullScreen: " + window.Telegram.WebApp.isFullscreen);
          });
    }
};