const BASE_CANVAS_WIDTH = 400
const BASE_CANVAS_HEIGHT = 700
const PLATFORM_VERTICAL_SPACING = 80
const PLATFORM_BUFFER = 150
const MAX_JUMP_DISTANCE = 300
const LEVEL_LENGTH = 6000

const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")

const BLOCK_WIDTH = 100
const BLOCK_HEIGHT = 100

let baseGameSpeed = 0.8
let gameSpeed = baseGameSpeed

const GROUND_Y = 550

const PLATFORM_TYPES = { LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }
const PLATFORM_EFFECTS = { NONE: 'none', SLOW: 'slow', SPEED: 'speed' }

const MEOW_COOLDOWN = 500
let lastMeowTime = 0

const DASH_COOLDOWN = 3000
let lastDashTime = 0
const DASH_DURATION = 380

const DASH_RANGE = 300
let skillNotReadyAlpha = 0
let skillNotReadyTime = 0
let comboCount = 0
let lastDashKill = false
let comboMessage = ""
let comboMessageAlpha = 0
let comboMessageStart = 0

let gameOver = false
let gameStarted = false
let victory = false
let fadeAlpha = 0
let canvasScale = 1
let screenWidth = 0
let screenHeight = 0
let canvasOffsetX = 0
let canvasOffsetY = 0

let isSwipeDashActive = false
let dashStart = { x: 0, y: 0 }
let dashCurrent = { x: 0, y: 0 }

const startScreen = document.getElementById("startScreen")
const gameOverScreen = document.getElementById("gameOverScreen")
const victoryScreen = document.getElementById("victoryScreen")
const finalScoreEl = document.getElementById("finalScore")
const victoryScoreEl = document.getElementById("victoryScore")
const superMeowReadyEl = document.getElementById("superMeowReady")

const startButton = document.getElementById("startButton")
const restartButton = document.getElementById("restartButton")
const restartVictoryButton = document.getElementById("restartVictoryButton")

// Оставляем кнопку meowBtn (мяу), как просили.
const meowBtn = document.getElementById("meowBtn")
// Блок «controls» может остаться, если нужно для стилей или прочего, но кнопки в нём игнорируем
const controls = document.getElementById('controls')

function loadImage(src) {
  const img = new Image()
  img.src = src
  return img
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
}

// Анимация бега кота
const runFrames = [
  loadImage("./images/cat1/cat_run/1.png"),
  loadImage("./images/cat1/cat_run/2.png"),
  loadImage("./images/cat1/cat_run/3.png"),
  loadImage("./images/cat1/cat_run/4.png"),
  loadImage("./images/cat1/cat_run/5.png"),
  loadImage("./images/cat1/cat_run/6.png"),
]
let runFrameIndex = 0
let runFrameTimer = 0
let runFrameInterval = 5

// Анимация двойного прыжка
const doubleJumpFrames = [
  loadImage("./images/cat1/cat_jump_d/1.png"),
  loadImage("./images/cat1/cat_jump_d/2.png"),
  loadImage("./images/cat1/cat_jump_d/3.png"),
  loadImage("./images/cat1/cat_jump_d/4.png"),
  loadImage("./images/cat1/cat_jump_d/5.png"),
  loadImage("./images/cat1/cat_jump_d/6.png"),
]
let doubleJumpFrameIndex = 0
let doubleJumpFrameTimer = 0
let doubleJumpFrameInterval = 5

// Анимация покоя (idle)
const idleFrames = [
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/2.png"),
  loadImage("./images/cat1/cat idle/1.png"),
  loadImage("./images/cat1/cat idle/3.png"),
]
let idleFrameIndex = 0
let idleFrameTimer = 0
let idleFrameInterval = 10

// Анимация обычного прыжка
const jumpFrames = [
  loadImage("./images/cat1/cat_jump/1.png"),
  loadImage("./images/cat1/cat_jump/2.png"),
  loadImage("./images/cat1/cat_jump/3.png"),
  loadImage("./images/cat1/cat_jump/4.png"),
]
let jumpFrameIndex = 0
let jumpFrameTimer = 0
let jumpFrameInterval = 10

// Анимация дэша
const dashFrames = [
  loadImage("./images/cat1/cat_dash/1.png"),
  loadImage("./images/cat1/cat_dash/2.png"),
  loadImage("./images/cat1/cat_dash/3.png"),
  loadImage("./images/cat1/cat_dash/4.png"),
  loadImage("./images/cat1/cat_dash/5.png"),
  loadImage("./images/cat1/cat_dash/6.png"),
]
let dashFrameIndex = 0
let dashFrameTimer = 0
let dashFrameInterval = 3

// --- НОВАЯ АНИМАЦИЯ ДЛЯ МЕТЕОРИТОВ ---
// Полёт (10 кадров)
const meteorFlyingFrames = [
  loadImage("./images/elements/meteors/flying/01+.png"),
  loadImage("./images/elements/meteors/flying/02+.png"),
  loadImage("./images/elements/meteors/flying/03+.png"),
  loadImage("./images/elements/meteors/flying/04+.png"),
  loadImage("./images/elements/meteors/flying/05+.png"),
  loadImage("./images/elements/meteors/flying/06+.png"),
  loadImage("./images/elements/meteors/flying/07+.png"),
  loadImage("./images/elements/meteors/flying/08+.png"),
  loadImage("./images/elements/meteors/flying/09+.png"),
  loadImage("./images/elements/meteors/flying/10+.png"),
]

// Взрыв (6 кадров)
const meteorSmashFrames = [
  loadImage("./images/elements/meteors/smash/01-.png"),
  loadImage("./images/elements/meteors/smash/02-.png"),
  loadImage("./images/elements/meteors/smash/03-.png"),
  loadImage("./images/elements/meteors/smash/04-.png"),
  loadImage("./images/elements/meteors/smash/05-.png"),
  loadImage("./images/elements/meteors/smash/06-.png"),
]
// --- КОНЕЦ новой анимации для метеоритов ---

const gameMusic = new Audio("./lvl2.mp3")
let musicPlayed = false

let damageParticles = []
let floatingTexts = []
let dashParticles = []
let meowWaves = []

// Массив метеоритов (теперь со спрайтовой анимацией)
let meteors = []

// explosions оставим, если вдруг где-то используется, 
// но для метеоритов она теперь не нужна (можно было бы выпилить совсем).
let explosions = []

let energyItems = []
let pursuers = []
let platforms = []
let keys = {}
let cameraX = 0
let spawnTimer = Date.now()

let meteorSpawnRate = 2000
let bossMeteorSpawnRate = 1000
let lastPursuerSpawn = Date.now()
let pursuerSpawnRate = 5000

let showDanger = false
let dangerAlpha = 1
let dangerFading = true
let gameTimer = 60
let timerInterval

let cheatSequence = ['KeyF','ArrowDown','KeyF','KeyF','ArrowUp']
let cheatIndex = 0
let cheatActivated = false
let showCollisionBox = 0

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
}

let blissParticles = []
let blissSpawnRate = 20
let lastSkillTime = 0
let skillCooldown = 6000

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
}

let originalGravity = player.gravity
let originalGameSpeed = baseGameSpeed

const platformLevels = {
  1: GROUND_Y - 2 * PLATFORM_VERTICAL_SPACING,
  2: GROUND_Y - PLATFORM_VERTICAL_SPACING,
  3: GROUND_Y - 4 * PLATFORM_VERTICAL_SPACING
}

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

// --- НАЧАЛО ГЛАВНЫХ ИЗМЕНЕНИЙ ПО ЗАПРОСУ ---
let swipeData = {
  active: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  side: null, // 'left' или 'right'
  lastSwipeUpTime: 0, 
}
const SWIPE_THRESHOLD = 30

function onCanvasPointerDown(e) {
  swipeData.active = true
  swipeData.startX = e.clientX
  swipeData.startY = e.clientY
  swipeData.currentX = e.clientX
  swipeData.currentY = e.clientY

  const halfScreen = screenWidth / 2
  if (e.clientX < halfScreen) {
    swipeData.side = 'left'
  } else {
    swipeData.side = 'right'
  }

  canvas.setPointerCapture(e.pointerId)
  document.addEventListener('pointermove', onCanvasPointerMove)
  document.addEventListener('pointerup', onCanvasPointerUp)
}

function onCanvasPointerMove(e) {
  if (!swipeData.active) return
  swipeData.currentX = e.clientX
  swipeData.currentY = e.clientY
}

function onCanvasPointerUp(e) {
  if (!swipeData.active) return
  swipeData.active = false

  const dx = swipeData.currentX - swipeData.startX
  const dy = swipeData.currentY - swipeData.startY

  if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
    // Тап
    document.removeEventListener('pointermove', onCanvasPointerMove)
    document.removeEventListener('pointerup', onCanvasPointerUp)
    return
  }

  if (swipeData.side === 'left') {
    if (Math.abs(dx) > Math.abs(dy)) {
      // Горизонтальный свайп
      if (dx > 0) {
        player.direction = 'right'
      } else {
        player.direction = 'left'
      }
    } else {
      // Вертикальный свайп => прыжок
      if (dy < 0) {
        const now = Date.now()
        const timeSinceLastUp = now - swipeData.lastSwipeUpTime
        if (timeSinceLastUp < 400) {
          handleDoubleJump()
        } else {
          handleJump()
        }
        swipeData.lastSwipeUpTime = now
      }
    }
  } else {
    // ПРАВАЯ половина — дэш
    const rect = canvas.getBoundingClientRect()
    const startXLocal = swipeData.startX - rect.left
    const startYLocal = swipeData.startY - rect.top
    const currentXLocal = swipeData.currentX - rect.left
    const currentYLocal = swipeData.currentY - rect.top

    const dxLocal = currentXLocal - startXLocal
    const dyLocal = currentYLocal - startYLocal
    const angle = Math.atan2(dyLocal, dxLocal)
    performSwipeDash(angle)
  }

  document.removeEventListener('pointermove', onCanvasPointerMove)
  document.removeEventListener('pointerup', onCanvasPointerUp)
}

canvas.addEventListener('pointerdown', onCanvasPointerDown)
// --- КОНЕЦ ГЛАВНЫХ ИЗМЕНЕНИЙ ПО ЗАПРОСУ ---

startButton.addEventListener("click", startGame)
restartButton.addEventListener("click", restartGame)
restartVictoryButton.addEventListener("click", restartGame)

// Минимальные клавиатурные ивенты
document.addEventListener("keydown", (e) => {
  if (e.repeat) return
  checkCheatCode(e.code)
  if (e.code === "ArrowRight") keys.right = true
  if (e.code === "ArrowLeft") keys.left = true
  if (e.code === "Space") handleJump()
  if (e.code === "KeyF") handleSkill()
})
document.addEventListener("keyup", (e) => {
  if (e.code === "ArrowRight") keys.right = false
  if (e.code === "ArrowLeft") keys.left = false
})

// Генерация уровней и платформ
function generateLevelPlatforms(startX = 200) {
  let currentX = startX
  let currentLevel = 1
  const allPlatforms = []
  while (currentX < LEVEL_LENGTH) {
    if (Math.random() < 0.7) {
      const pattern = platformPatterns[Math.floor(Math.random() * platformPatterns.length)]
      pattern.forEach(p => {
        const platX = currentX
        const platY = platformLevels[p.level]
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
          })
          currentX += p.length * BLOCK_WIDTH + getRandomSpacing()
          currentLevel = p.level
        }
      })
    } else {
      const singlePattern = singlePlatformPatterns[Math.floor(Math.random() * singlePlatformPatterns.length)]
      const platX = currentX
      const platY = platformLevels[singlePattern.level]
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
        })
        currentX += singlePattern.length * BLOCK_WIDTH + getRandomSpacing()
        currentLevel = singlePattern.level
      }
    }
  }
  return allPlatforms
}

function generateLevelWhiskas(platforms) {
  const allWhiskas = []
  platforms.forEach(platform => {
    const whiskasCount = Math.floor(Math.random() * 3) + 1
    for (let i = 0; i < whiskasCount; i++) {
      const type = Math.random() < 0.2 ? 'super' : 'normal'
      const radius = type === 'super' ? 20 : 10
      const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20
      const whiskasY = platform.originalY - radius - 5
      if (!isWhiskasTooClose(allWhiskas, whiskasX, whiskasY, radius)) {
        allWhiskas.push({ x: whiskasX, y: whiskasY, radius: radius, type: type })
      }
    }
  })
  return allWhiskas
}

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
  }
  platforms.push(bossPlatform)
  spawnWhiskasOnPlatform(bossPlatform)
}

function getRandomSpacing() {
  return Math.floor(Math.random() * 100 + 150)
}

function isOverlapping(platforms, x, y, length) {
  for (let plat of platforms) {
    const platEndX = plat.x + plat.length * BLOCK_WIDTH
    const currentEndX = x + length * BLOCK_WIDTH
    if (Math.abs(y - plat.y) < 10) {
      if ((x < platEndX && x + length * BLOCK_WIDTH > plat.x)) {
        return true
      }
    }
  }
  return false
}

function getRandomPlatformEffect() {
  const rand = Math.random()
  if (rand < 0.05) return PLATFORM_EFFECTS.SLOW
  if (rand < 0.1) return PLATFORM_EFFECTS.SPEED
  return PLATFORM_EFFECTS.NONE
}

function spawnWhiskasOnPlatform(platform) {
  const whiskasCount = Math.floor(Math.random() * 3) + 1
  for (let i = 0; i < whiskasCount; i++) {
    const type = Math.random() < 0.2 ? 'super' : 'normal'
    const radius = type === 'super' ? 20 : 10
    const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20
    const whiskasY = platform.originalY - radius - 5
    if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, radius)) {
      energyItems.push({ x: whiskasX, y: whiskasY, radius: radius, type: type })
    }
  }
}

function updateGame() {
  if (!gameStarted || gameOver) return
  playMusic()
  if (gameOver && fadeAlpha < 1) {
    fadeAlpha += 0.01
    return
  }
  if (skillNotReadyTime > 0) {
    skillNotReadyTime -= 16.67
    if (skillNotReadyTime <= 0) {
      skillNotReadyAlpha = 0
    }
  }

  // ЛОГИКА АВТОБЕГА
  if (!player.isDashing && !player.isEntering) {
    if (player.direction === 'right') {
      player.velocityX = player.maxSpeed * gameSpeed
    } else {
      player.velocityX = -player.maxSpeed * gameSpeed
    }
  }

  // Смена анимаций (run, idle и т.д.)
  if (!player.isJumping && !player.isDashing) {
    if (Math.abs(player.velocityX) > 1) {
      player.animationState = 'run'
    } else {
      player.animationState = 'idle'
    }
  }
  if (player.isJumping && player.performedDoubleJump) {
    player.animationState = 'double_jump'
  } else if (player.isJumping && !player.performedDoubleJump) {
    player.animationState = 'jump'
  }
  if (player.isDashing) {
    player.animationState = 'dash'
  }

  if (player.isFading) {
    player.fadeTimer -= 16.67
    player.opacity = (player.fadeTimer / player.fadeDuration)
    if (player.opacity > 1) player.opacity = 1
    if (player.fadeTimer <= player.fadeDuration * 0.5) {
      if (player.fadeTimer > 0) {
        spawnBlissParticles()
      }
    }
    if (player.fadeTimer <= 0) {
      player.isFading = false
      player.invulnerable = false
    }
  }
  if (!player.isFading && !player.invulnerable) {
    player.opacity = 1
  }

  if (player.isEntering) {
    player.x += 3
    if (player.x >= player.playerStartX) {
      player.isEntering = false
    }
  } else if (player.isDashing) {
    player.dashTimer -= 16.67
    player.x += player.velocityX * gameSpeed
    player.y += player.velocityY * gameSpeed
    player.velocityY += player.gravity * gameSpeed
      // -- НАЧАЛО ПРОВЕРКИ СТОЛКНОВЕНИЯ С БОССОМ --
      if (boss.isActive && !boss.isFlashing &&
            player.x + player.collisionWidth > boss.x - boss.width/2 &&
            player.x < boss.x + boss.width/2 &&
                player.y + player.collisionHeight > boss.y - boss.height/2 &&
                player.y < boss.y + boss.height/2
            ) {
        bossTakeDamage(1);
      }
     // -- КОНЕЦ ПРОВЕРКИ СТОЛКНОВЕНИЯ С БОССОМ --
    if (player.dashTimer <= 0) {
      endDash()
    }
  } else {
    player.x += player.velocityX * gameSpeed
    player.y += player.velocityY * gameSpeed
    player.velocityY += player.gravity * gameSpeed
  }

  let cameraTargetX
  if (player.isEntering) {
    cameraTargetX = player.x - 100
  } else if (boss.isActive && !boss.isFlashing) {
    const baseCameraX = boss.x - canvas.width / (2 * canvasScale)
    const offset = clamp(player.x - boss.x, -150, 150)
    cameraTargetX = baseCameraX + offset
  } else {
    cameraTargetX = player.x - (100 / canvasScale)
  }
  cameraX += (cameraTargetX - cameraX) * 0.1

  if (player.y >= GROUND_Y - player.height) {
    player.y = GROUND_Y - player.height
    player.velocityY = 0
    if (player.isJumping) {
      player.isJumping = false
      player.performedDoubleJump = false
    }
    player.canDoubleJump = true
  }

  const collisionX = player.x + player.collisionOffsetX
  const collisionY = player.y + player.collisionOffsetY

  platforms.forEach((platform) => {
    if (
      player.velocityY >= 0 &&
      collisionX + player.collisionWidth > platform.x &&
      collisionX < platform.x + platform.length * BLOCK_WIDTH &&
      player.y + player.height >= platform.y - 5 &&
      player.y + player.height <= platform.y + player.velocityY * gameSpeed + 1
    ) {
      player.y = platform.y - player.height
      player.velocityY = 0
      player.canDoubleJump = true
      player.performedDoubleJump = false
      if (player.isJumping) {
        platform.isSinking = true
        player.isJumping = false
      }
    }
    if (platform.isSinking) {
      platform.y += platform.sinkSpeed
      if (platform.y >= platform.originalY + platform.sinkAmount) {
        platform.isSinking = false
      }
    } else if (platform.y > platform.originalY) {
      platform.y -= platform.returnSpeed
      if (platform.y <= platform.originalY) {
        platform.y = platform.originalY
      }
    }
  })

  if (!boss.isActive) {
    if (Date.now() - spawnTimer > meteorSpawnRate) {
      spawnMeteor()
      spawnEnergy()
      spawnTimer = Date.now()
      meteorSpawnRate = Math.max(500, meteorSpawnRate - 50)
    }
    if (Date.now() - lastPursuerSpawn > pursuerSpawnRate) {
      spawnPursuer()
      lastPursuerSpawn = Date.now()
    }
  } else {
    if (Date.now() - spawnTimer > bossMeteorSpawnRate) {
      spawnMeteor()
      spawnTimer = Date.now()
    }
    if (Math.random() < 0.02) {
      spawnEnergy()
    }
  }

  meteors.forEach((meteor, index) => {
    if (meteor.state === 'flying') {
      meteor.x += meteor.speedX * gameSpeed
      meteor.y += meteor.speedY * gameSpeed

      meteor.frameTimer++
      if (meteor.frameTimer >= meteor.frameInterval) {
        meteor.frameTimer = 0
        meteor.frameIndex++
        if (meteor.frameIndex >= meteorFlyingFrames.length) {
          meteor.frameIndex = 0
        }
      }

      const dx = meteor.x - (collisionX + player.collisionWidth / 2)
      const dy = meteor.y - (collisionY + player.collisionHeight / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)
      const collisionDistance = meteor.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2
      if (distance < collisionDistance) {
        if (player.isDashing) {
          meteors[index].state = 'exploding'
          meteors[index].frameIndex = 0
          meteors[index].frameTimer = 0
          lastDashKill = true
        } else {
          playerTakeDamage(10)
          meteors[index].state = 'exploding'
          meteors[index].frameIndex = 0
          meteors[index].frameTimer = 0
        }
      }

      if (meteor.y >= GROUND_Y) {
        meteors[index].state = 'exploding'
        meteors[index].frameIndex = 0
        meteors[index].frameTimer = 0
      }
    } else if (meteor.state === 'exploding') {
      meteor.frameTimer++
      if (meteor.frameTimer >= meteor.frameInterval) {
        meteor.frameTimer = 0
        meteor.frameIndex++
        if (meteor.frameIndex >= meteorSmashFrames.length) {
          meteors.splice(index, 1)
          return
        }
      }
    }
  })

  explosions.forEach((explosion, index) => {
    explosion.radius += 5 * gameSpeed
    explosion.alpha -= 0.05
    if (explosion.alpha <= 0) {
      explosions.splice(index, 1)
    }
  })

  energyItems.forEach((energyItem, index) => {
    const px = collisionX + player.collisionWidth / 2
    const py = collisionY + player.collisionHeight / 2
    const dx = energyItem.x - px
    const dy = energyItem.y - py
    const dist = Math.sqrt(dx * dx + dy * dy)
    const collisionDistance = energyItem.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2
    if (dist < collisionDistance) {
      if (energyItem.type === 'super') {
        player.energy += 5
        spawnFloatingText('+5', px, py)
      } else {
        player.energy++
        spawnFloatingText('+1', px, py)
      }
      energyItems.splice(index, 1)
      if (player.energy >= 25) {
        player.superMeowReady = true
      }
    }
  })

  meowWaves.forEach((wave, wIndex) => {
    wave.radius += wave.speed * gameSpeed
    wave.alpha -= 0.01 * gameSpeed
    if (wave.alpha <= 0) {
      meowWaves.splice(wIndex, 1)
    }
  })

  if (!boss.isActive) {
    pursuers.forEach((pursuer, pIndex) => {
      if (!pursuer.active && pursuer.x - cameraX < canvas.width) {
        pursuer.active = true
      }
      if (pursuer.active) {
        if (pursuer.x > collisionX) {
          pursuer.speedX = Math.max(pursuer.speedX - pursuer.acceleration * gameSpeed, -pursuer.maxSpeed * gameSpeed)
        } else {
          pursuer.speedX = Math.min(pursuer.speedX + pursuer.acceleration * gameSpeed, pursuer.maxSpeed * gameSpeed)
        }
        pursuer.x += pursuer.speedX * gameSpeed
        const dx = (pursuer.x + pursuer.width / 2) - (collisionX + player.collisionWidth / 2)
        const dy = (pursuer.y - pursuer.height / 2) - (collisionY + player.collisionHeight / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const collisionDistance = (pursuer.width / 2) + (player.collisionWidth / 2)
        if (dist < collisionDistance) {
          if (player.isDashing) {
            pursuers.splice(pIndex, 1)
            lastDashKill = true
          } else {
            playerTakeDamage(5)
            pursuers.splice(pIndex, 1)
          }
        }
        if (!pursuer.spotted && Math.abs(pursuer.x - collisionX) < 300) {
          pursuer.spotted = true
        }
        if (pursuer.spotted) {
          pursuer.exclamationTimer++
          if (pursuer.exclamationTimer >= 30) {
            pursuer.showExclamation = !pursuer.showExclamation
            pursuer.exclamationTimer = 0
          }
        }
      }
      if (pursuer.x - cameraX < -pursuer.width) {
        pursuers.splice(pIndex, 1)
      }
    })
  } else {
    pursuers = []
  }

  showDanger = meteors.some(m => m.x - cameraX < canvas.width + 150 && m.x - cameraX > canvas.width)
  if (showDanger) {
    if (dangerFading) dangerAlpha -= 0.05
    else dangerAlpha += 0.05
    if (dangerAlpha <= 0.3) dangerFading = false
    if (dangerAlpha >= 1) dangerFading = true
  } else {
    dangerAlpha = 1
  }

  if (!boss.isActive && player.x >= boss.x - 100) {
    activateBoss()
  }
  if (boss.isActive) {
    updateBoss()
  }

  updateAnimations()
  if (player.isDashing) {
    updateDashAnimations()
  }
  if (!player.isFading) {
    updateBlissParticles()
  }
  updateMeowButtonCooldown()
  updateDashButtonCooldownAll()
  updateComboMessage()

  floatingTexts.forEach((ft, i) => {
    ft.y += ft.vy
    ft.alpha -= 0.01
    if (ft.alpha <= 0) {
      floatingTexts.splice(i, 1)
    }
  })

  dashParticles = dashParticles.filter(p => {
    p.x += p.vx * gameSpeed
    p.y += p.vy * gameSpeed
    p.alpha -= 0.02
    return p.alpha > 0
  })

  damageParticles = damageParticles.filter(dp => {
    dp.x += dp.vx * gameSpeed
    dp.y += dp.vy * gameSpeed
    dp.alpha -= 0.02
    return dp.alpha > 0
  })
}

function updateDashButtonCooldownAll() {
  // пока пусто
}

const backgroundYOffset = 50
const buildingsMidYOffset = 50
const baseFrontYOffset = 77

function drawGame(screenWidth, screenHeight) {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  drawLayer(layers.background, cameraX * 0.2, backgroundYOffset)
  drawLayer(layers.buildingsMid, cameraX * 0.5, buildingsMidYOffset)
  drawLayer(layers.baseFront, cameraX * 0.8, baseFrontYOffset)

  drawGround()

  if (boss.isActive && boss.isFlashing && boss.flashVisible) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  platforms.forEach((platform) => {
    const platformY = platform.y - BLOCK_HEIGHT
    for (let i = 0; i < platform.length; i++) {
      const blockX = platform.x + i * BLOCK_WIDTH - cameraX
      ctx.drawImage(layers.platformBlock, blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT)
      if (platform.effect !== PLATFORM_EFFECTS.NONE) {
        if (platform.effect === PLATFORM_EFFECTS.SLOW) {
          if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = 'rgba(0,255,255,0.3)'
            ctx.fillRect(blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT)
          }
        }
        if (platform.effect === PLATFORM_EFFECTS.SPEED) {
          if (Math.floor(Date.now() / 200) % 2 === 0) {
            ctx.fillStyle = 'rgba(255,165,0,0.3)'
            ctx.fillRect(blockX, platformY, BLOCK_WIDTH, BLOCK_HEIGHT)
          }
        }
      }
    }
  })

  // --- Рисование метеоритов (спрайты вместо кружков) ---
  meteors.forEach(meteor => {
   ctx.save()
   ctx.translate(meteor.x - cameraX, meteor.y)
   if (meteor.state === 'flying') {
     ctx.rotate(meteor.angle)
     const frame = meteorFlyingFrames[meteor.frameIndex]
     const drawWidth = frame.width * 3;   // <-- Увеличили ширину
     const drawHeight = frame.height * 3; // <-- Увеличили высоту
     ctx.drawImage(frame, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
   } else if (meteor.state === 'exploding') {
     const frame = meteorSmashFrames[meteor.frameIndex]
      const drawWidth = frame.width * 3;    // <-- Увеличили ширину
      const drawHeight = frame.height * 3;  // <-- Увеличили высоту
     ctx.drawImage(frame, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight)
   }
   ctx.restore()
 })
  // --- конец рисования метеоритов ---

  explosions.forEach(e => drawCircle(e, "orange")) // оставим, если что-то ещё требует

  energyItems.forEach(eItem => {
    if (eItem.type === 'super') {
      ctx.drawImage(layers.superWhiskas, eItem.x - cameraX - eItem.radius, eItem.y - eItem.radius, eItem.radius * 2, eItem.radius * 2)
    } else {
      ctx.drawImage(layers.whiskas, eItem.x - cameraX - eItem.radius, eItem.y - eItem.radius, eItem.radius * 2, eItem.radius * 2)
    }
  })

  pursuers.forEach(p => {
    ctx.drawImage(layers.pursuer, p.x - cameraX, p.y - p.height, p.width, p.height)
    if (p.spotted && p.showExclamation) {
      ctx.drawImage(layers.exclamationMark, p.x - cameraX - 10, p.y - 30, 20, 20)
    }
  })

  boss.shots.forEach(shot => {
    ctx.save()
    ctx.globalAlpha = shot.fadeOut ? shot.alpha : 1
    ctx.beginPath()
    ctx.arc(shot.x - cameraX, shot.y, shot.radius, 0, Math.PI * 2)
    ctx.fillStyle = shot.color
    ctx.fill()
    ctx.restore()
  })

  meowWaves.forEach(w => {
    ctx.save()
    ctx.globalAlpha = w.alpha
    ctx.lineWidth = 2
    if (w.super) {
      ctx.strokeStyle = 'rgba(0,255,255,0.5)'
    } else {
      ctx.strokeStyle = 'rgba(255,0,255,0.5)'
    }
    ctx.beginPath()
    ctx.arc(player.x + player.width / 2 - cameraX, player.y + player.height / 2, w.radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  })

  dashParticles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.strokeStyle = 'cyan'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(p.x - cameraX, p.y)
    ctx.lineTo(p.x - cameraX - p.vx * 2, p.y - p.vy * 2)
    ctx.stroke()
    ctx.restore()
  })

  damageParticles.forEach(dp => {
    ctx.save()
    ctx.globalAlpha = dp.alpha
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(dp.x - cameraX, dp.y, 2, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })

  if (!player.isFading) {
    blissParticles.forEach(p => {
      ctx.fillStyle = `rgba(255,255,255,${p.alpha})`
      ctx.fillRect(p.x - cameraX, p.y, 5, 5)
    })
  }

  drawPlayerHpBar()

  // Рисуем кота
  ctx.save()
  ctx.globalAlpha = player.opacity
  let playerImage = idleFrames[idleFrameIndex]
  if (player.animationState === 'idle') {
    playerImage = idleFrames[idleFrameIndex]
  } else if (player.animationState === 'run') {
    playerImage = runFrames[runFrameIndex]
  } else if (player.animationState === 'jump' && !player.performedDoubleJump) {
    playerImage = jumpFrames[jumpFrameIndex]
  } else if (player.animationState === 'double_jump') {
    playerImage = doubleJumpFrames[doubleJumpFrameIndex]
  } else if (player.animationState === 'dash') {
    playerImage = dashFrames[dashFrameIndex]
  }
  if (player.direction === 'left') {
    ctx.scale(-1, 1)
    ctx.drawImage(playerImage, -(player.x + player.width) + cameraX, player.y, player.width, player.height)
  } else {
    ctx.drawImage(playerImage, player.x - cameraX, player.y, player.width, player.height)
  }
  ctx.restore()

  if (showCollisionBox) {
    drawCollisionBox()
  }

  const energyIconX = 40
  const energyIconY = 80
  ctx.drawImage(layers.energyIcon, energyIconX, energyIconY, 30, 30)
  ctx.fillStyle = "white"
  ctx.font = "54px 'Micro 5', sans-serif"
  ctx.textAlign = "left"
  ctx.fillText(`${player.energy}`, energyIconX + 40, energyIconY + 25)

  const progressX = 40
  const progressY = 130
  const progressWidth = canvas.width - 70
  const progressHeight = 20
  ctx.fillStyle = "#555"
  ctx.fillRect(progressX, progressY, progressWidth, progressHeight)
  ctx.fillStyle = "#0f0"
  const progress = Math.min(player.x / LEVEL_LENGTH, 1)
  ctx.fillRect(progressX, progressY, progressWidth * progress, progressHeight)
  ctx.strokeStyle = "#fff"
  ctx.strokeRect(progressX, progressY, progressWidth, progressHeight)
  ctx.fillStyle = "#fff"
  ctx.font = "20px 'Micro 5', sans-serif"
  ctx.textAlign = "center"
  ctx.fillText("Progress to Boss", progressX + progressWidth / 2, progressY + 15)

  ctx.fillStyle = "white"
  ctx.font = "34px 'Micro 5', sans-serif"
  ctx.textAlign = "center"
  ctx.fillText(`${Math.ceil(gameTimer)}s`, canvas.width / 2, 100)

  if (boss.isActive) {
    ctx.drawImage(layers.boss, boss.x - cameraX - boss.width / 2, boss.y - boss.height / 2, boss.width, boss.height)
    const healthBarX = canvas.width - 200
    const healthBarY = 50
    const healthBarWidth = 150
    ctx.drawImage(layers.bossHealthBar, healthBarX, healthBarY, healthBarWidth, 20)
    ctx.fillStyle = "#f00"
    const bossHPWidth = (boss.hp / 10) * healthBarWidth
    ctx.fillRect(healthBarX, healthBarY, bossHPWidth, 20)
    ctx.strokeStyle = "#fff"
    ctx.strokeRect(healthBarX, healthBarY, healthBarWidth, 20)
    ctx.fillStyle = "#fff"
    ctx.font = "20px 'Micro 5', sans-serif"
    ctx.textAlign = "center"
    ctx.fillText(`Boss HP: ${boss.hp}/10`, healthBarX + healthBarWidth / 2, healthBarY + 15)
  }

  if (showDanger) {
    ctx.fillStyle = `rgba(255,0,0,${dangerAlpha})`
    ctx.font = "20px 'Micro 5', sans-serif"
    ctx.textAlign = "right"
    ctx.fillText("Danger!", canvas.width - 10, canvas.height / 2 - 30)
    ctx.beginPath()
    ctx.moveTo(canvas.width - 20, canvas.height / 2)
    ctx.lineTo(canvas.width - 50, canvas.height / 2 - 20)
    ctx.lineTo(canvas.width - 50, canvas.height / 2 + 20)
    ctx.closePath()
    ctx.fill()
  }

  floatingTexts.forEach(ft => {
    ctx.save()
    ctx.globalAlpha = ft.alpha
    ctx.font = "20px 'Micro 5', sans-serif"
    ctx.fillStyle = "#fff"
    ctx.textAlign = "center"
    ctx.fillText(ft.text, ft.x - cameraX, ft.y)
    ctx.restore()
  })

  if (skillNotReadyAlpha > 0) {
    drawSkillNotReady()
  }

  if (comboMessageAlpha > 0 && comboMessage) {
    drawComboMessage()
  }

  if (gameOver && fadeAlpha > 0) {
    ctx.fillStyle = `rgba(0,0,0,${fadeAlpha})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  ctx.restore()
}

function updateBoss() {
  if (!boss.flashStartTime) {
    boss.flashStartTime = Date.now()
    boss.isFlashing = true
    gameSpeed = 0.5
  }
  if (boss.isFlashing) {
    const elapsed = Date.now() - boss.flashStartTime
    if (elapsed < 1000) {
      boss.flashVisible = Math.floor(elapsed / 100) % 2 === 0
    } else if (elapsed < 3000) {
      boss.flashVisible = Math.floor((elapsed - 1000) / 500) % 2 === 0
    } else {
      boss.isFlashing = false
      boss.flashVisible = false
      gameSpeed = originalGameSpeed
    }
  }
  if (boss.descendActive) {
    boss.targetY = boss.descendY
  } else {
    boss.targetY = boss.initialY
  }
  boss.y += (boss.targetY - boss.y) * 0.1
  if (!boss.descendActive && Date.now() > boss.nextDescendTime) {
    boss.descendActive = true
    boss.descendTimer = boss.descendDuration
    boss.shots.forEach(shot => {
      shot.fadeOut = true
      shot.alpha = 1
      const angle = Math.random() * Math.PI * 2
      const speed = 4 + Math.random() * 4
      shot.vx = Math.cos(angle) * speed
      shot.vy = Math.sin(angle) * speed
    })
  }
  if (boss.descendActive) {
    boss.descendTimer -= 16.67
    if (boss.descendTimer <= 0) {
      boss.descendActive = false
      boss.nextDescendTime = Date.now() + getRandomInterval(5000, 10000)
      spawnWhiskasOnGround()
    }
  } else {
    if (!boss.isFlashing && Date.now() - boss.lastNewAttackTime > boss.newAttackCooldown) {
      boss.newAttackReady = true
      boss.lastNewAttackTime = Date.now()
    }
    if (!boss.isFlashing && boss.newAttackReady) {
      bossNewAttack()
      boss.newAttackReady = false
    }
    if (!boss.isFlashing && Date.now() - boss.lastShotTime > boss.shotInterval) {
      boss.shots.push(...shootBossShots(boss))
      boss.lastShotTime = Date.now()
    }
  }
  boss.shots.forEach((shot, sIndex) => {
    if (shot.fadeOut) {
      shot.x += shot.vx * gameSpeed
      shot.y += shot.vy * gameSpeed
      shot.alpha -= 0.01
      if (shot.alpha <= 0) {
        boss.shots.splice(sIndex, 1)
      }
    } else if (shot.newAttack) {
      shot.timer -= 16.67
      if (shot.timer <= 0 && shot.speed === 0) {
        const dx = (player.x + player.width / 2) - shot.x
        const dy = (player.y + player.height / 2) - shot.y
        const dist = Math.sqrt(dx * dx, dy * dy)
        shot.vx = (dx / dist) * 8
        shot.vy = (dy / dist) * 8
        shot.speed = 8
      }
      if (shot.speed > 0) {
        shot.x += shot.vx * gameSpeed
        shot.y += shot.vy * gameSpeed
        const dx = shot.x - (player.x + player.width / 2)
        const dy = shot.y - (player.y + player.height / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)
        const collisionDistance = shot.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2
        if (dist < collisionDistance) {
          playerTakeDamage(15)
          boss.shots.splice(sIndex, 1)
        }
        if (
          shot.x - cameraX < -shot.radius || shot.x - cameraX > canvas.width + shot.radius ||
          shot.y < -shot.radius || shot.y > canvas.height + shot.radius
        ) {
          boss.shots.splice(sIndex, 1)
        }
      }
    } else {
      shot.angle += shot.angularSpeed * gameSpeed
      shot.x += shot.speed * Math.cos(shot.angle) * gameSpeed
      shot.y += shot.speed * Math.sin(shot.angle) * gameSpeed
      const dx = shot.x - (player.x + player.width / 2)
      const dy = shot.y - (player.y + player.height / 2)
      const dist = Math.sqrt(dx * dx + dy * dy)
      const collisionDistance = shot.radius + Math.max(player.collisionWidth, player.collisionHeight) / 2
      if (dist < collisionDistance) {
        playerTakeDamage(15)
        boss.shots.splice(sIndex, 1)
      }
      if (
        shot.x - cameraX < -shot.radius || shot.x - cameraX > canvas.width + shot.radius ||
        shot.y < -shot.radius || shot.y > canvas.height + shot.radius
      ) {
        boss.shots.splice(sIndex, 1)
      }
    }
  })
  const dxB = boss.x - (player.x + player.width / 2)
  const dyB = boss.y - (player.y + player.height / 2)
  const distB = Math.sqrt(dxB * dxB + dyB * dyB)
  if (boss.hp <= 0) {
    victory = true
    endGame(true)
  }
}

function bossNewAttack() {
  const numOrbs = 3
  for (let i = 0; i < numOrbs; i++) {
    const angle = (Math.PI * 2 / numOrbs) * i
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
    })
  }
}

function drawCircle(object, color) {
  ctx.beginPath()
  ctx.arc(object.x - cameraX, object.y, object.radius, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

function drawLayer(image, offsetX, yOffset = 0) {
  const targetWidth = 1200
  const targetHeight = 600
  const posX = -offsetX % targetWidth
  const posY = yOffset
  const numVerticalRepeats = Math.ceil(canvas.height / targetHeight)
  for (let i = 0; i < numVerticalRepeats; i++) {
    ctx.drawImage(
      image,
      Math.round(posX) - canvasOffsetX,
      Math.round(posY + i * targetHeight) - canvasOffsetY,
      targetWidth,
      targetHeight
    )
    if (posX + targetWidth < canvas.width) {
      ctx.drawImage(
        image,
        Math.round(posX + targetWidth) - canvasOffsetX,
        Math.round(posY + i * targetHeight) - canvasOffsetY,
        targetWidth,
        targetHeight
      )
    }
  }
}

function drawGround() {
  ctx.fillStyle = "rgba(0,0,0,0)"
  ctx.fillRect(0, GROUND_Y, canvas.width, canvas.height - GROUND_Y)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function activateBoss() {
  boss.isActive = true
  boss.isFlashing = true
  boss.flashStartTime = Date.now()
  boss.x = cameraX + canvas.width + 100
  boss.targetX = cameraX + canvas.width / 2
  boss.y = platformLevels[1]
  boss.targetY = boss.initialY
  gameSpeed = 0.2
}

function isWhiskasTooClose(items, x, y, radius) {
  for (let item of items) {
    const dx = item.x - x
    const dy = item.y - y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < (item.radius + radius + 20)) {
      return true
    }
  }
  return false
}

function spawnWhiskasOnGround() {
  for (let i = 0; i < 3; i++) {
    let gx = player.x + (Math.random() * 400 - 200)
    if (gx < cameraX) gx = cameraX + 50
    const whiskasY = GROUND_Y - 10
    const whiskasX = gx
    if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, 10)) {
      energyItems.push({ x: gx, y: whiskasY, radius: 10, type: 'normal' })
    }
  }
}

// --- ГЛАВНАЯ ФУНКЦИЯ СПАВНА МЕТЕОРОВ ---
// Теперь учитываем анимацию полёта и угол
function spawnMeteor() {
  if (!boss.isActive) {
    const spawnX = cameraX + canvas.width + Math.random() * 500
    const speedX = (-2 - Math.random() * 2) * gameSpeed
    const speedY = (1 + Math.random() * 6) * gameSpeed

    const angle = Math.atan2(speedY, speedX)
    meteors.push({
      x: spawnX,
      y: 50,
      speedX,
      speedY,
      radius: 20 * 3,
      state: 'flying',
      frameIndex: 0,
      frameTimer: 0,
      frameInterval: 5,
      angle: angle,
    })
  } else {
    const spawnXBase = cameraX + (Math.random() * (canvas.width + 400) - 200)
    const spawnY = -50 - Math.random() * 100
    let speedY = (2 + Math.random() * 4) * gameSpeed
    const speedX = (Math.random() - 0.5) * 2 * gameSpeed
    const meteorCount = Math.floor(Math.random() * 3) + 2
    for (let i = 0; i < meteorCount; i++) {
      const spawnX = spawnXBase + (Math.random() * 200 - 100)
      speedY += (Math.random() - 0.5) * 1 * gameSpeed;
      const angle = Math.atan2(speedY, speedX)
      setTimeout(() => {
        meteors.push({
          x: spawnX,
          y: spawnY,
          speedX: speedX,
          speedY: speedY,
          radius: 20 * 3,
          state: 'flying',
          frameIndex: 0,
          frameTimer: 0,
          frameInterval: 5,
          angle: angle,
        })
      }, i * 150)
    }
  }
}

function spawnEnergy() {
  const spawnChance = Math.random()
  if (spawnChance < 0.5) {
    if (platforms.length > 0) {
      const platform = platforms[Math.floor(Math.random() * platforms.length)]
      const whiskasY = platform.originalY - 15
      const whiskasX = platform.x + Math.random() * (platform.length * BLOCK_WIDTH - 40) + 20
      if (!isWhiskasTooClose(energyItems, whiskasX, whiskasY, 10)) {
        const type = Math.random() < 0.1 ? 'super' : 'normal'
        const radius = type === 'super' ? 20 : 10
        energyItems.push({ x: whiskasX, y: whiskasY, radius, type })
      }
    }
  } else {
    const midX = player.x + canvas.width / 2 + Math.random() * 300
    const midY = GROUND_Y - PLATFORM_VERTICAL_SPACING * 1.5
    if (!isWhiskasTooClose(energyItems, midX, midY - 5, 10)) {
      energyItems.push({ x: midX, y: midY - 5, radius: 10, type: 'normal' })
    }
  }
}

function spawnPursuer() {
  if (boss.isActive) return
  const spawnX = cameraX + canvas.width + Math.random() * 500
  const spawnY = GROUND_Y
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
  })
}

function shootBossShots(boss) {
  const shots = []
  const centerX = boss.x
  const centerY = boss.y
  const numShots = 10
  const angleIncrement = Math.PI / 4
  const initialAngle = Math.random() * Math.PI * 2
  for (let i = 0; i < numShots; i++) {
    const angle = initialAngle + i * angleIncrement
    shots.push({
      x: centerX,
      y: centerY,
      radius: 10,
      speed: 5,
      angle: angle,
      angularSpeed: 0.1,
      color: "green",
      fadeOut: false,
    })
  }
  return shots
}

function handleJump() {
  if (!player.alive || gameOver || player.isFading) return
  const onGround = player.y >= GROUND_Y - player.height ||
    platforms.some(platform =>
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.length * BLOCK_WIDTH &&
      player.y + player.height >= platform.y - 10 &&
      player.y + player.height <= platform.y + 10
    )
  if (onGround) {
    player.velocityY = player.jumpStrength
    player.canDoubleJump = true
    player.isJumping = true
    player.performedDoubleJump = false
  } else if (player.canDoubleJump) {
    player.velocityY = player.jumpStrength
    player.canDoubleJump = false
    player.isJumping = true
    player.performedDoubleJump = true
  }
}

function handleDoubleJump() {
  if (!player.alive || gameOver || player.isFading) return
  if (player.canDoubleJump) {
    player.velocityY = player.jumpStrength
    player.canDoubleJump = false
    player.isJumping = true
    player.performedDoubleJump = true
  }
}

function updateMeowButtonCooldown() {
  const currentTime = Date.now()
  const timeSinceLastMeow = currentTime - lastSkillTime
  if (timeSinceLastMeow < skillCooldown) {
    const percentage = (skillCooldown - timeSinceLastMeow) / skillCooldown
    meowBtn.disabled = true
    meowBtn.classList.add('cooldown')
    meowBtn.style.background = `linear-gradient(to right, rgba(255,255,255,0.3) ${percentage * 100}%, rgba(255,255,255,0) ${percentage * 100}%)`
  } else {
    meowBtn.disabled = false
    meowBtn.classList.remove('cooldown')
    meowBtn.style.background = ''
  }
}

meowBtn.addEventListener("click", handleSkill)

function handleSkill() {
  if (!player.alive || gameOver || player.isFading) return
  const now = Date.now()
  if (now - lastSkillTime < skillCooldown) {
    showSkillNotReady()
    return
  }
  player.isFading = true
  player.fadeTimer = player.fadeDuration
  player.invulnerable = true
  lastSkillTime = now
  spawnBlissParticles()
  createNormalMeow()
  updateMeowButtonCooldown()
}

function createNormalMeow() {
  const direction = player.direction
  const numWaves = 5
  const waveInterval = 200
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
      })
    }, i * waveInterval)
  }
}

function createSuperMeow() {
  const direction = player.direction
  const numWaves = 10
  const waveInterval = 100
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
      })
    }, i * waveInterval)
  }
}

function showSuperMeowReady() {
  superMeowReadyEl.style.opacity = 1
  setTimeout(() => {
    superMeowReadyEl.style.transition = 'opacity 1s'
    superMeowReadyEl.style.opacity = 0
    setTimeout(() => {
      superMeowReadyEl.style.transition = 'opacity 0.5s'
    }, 1000)
  }, 0)
}

function performSwipeDash(angle) {
  if (player.isDashing) return
  const now = Date.now()
  if ((now - lastDashTime < DASH_COOLDOWN) && comboCount === 0) {
    showSkillNotReady()
    return
  }
  if (!player.alive || gameOver) return
  player.isDashing = true
  player.dashTimer = DASH_DURATION
  player.invulnerable = true
  player.animationState = 'dash'
  if (comboCount === 0) {
    lastDashTime = now
  }
  lastDashKill = false
  const DASH_SPEED = 16
  player.velocityX = Math.cos(angle) * DASH_SPEED
  player.velocityY = Math.sin(angle) * DASH_SPEED

  for (let i = 0; i < 10; i++) {
    dashParticles.push({
      x: player.x + player.width / 2,
      y: player.y + player.height / 2,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      alpha: 1,
    })
  }
}

function endDash() {
  player.isDashing = false
  player.invulnerable = false
  player.velocityX = 0
  player.velocityY = 0
  if (lastDashKill) {
    comboCount++
    lastDashTime = 0
    if (comboCount >= 5) {
      player.hp = Math.min(player.hp + 5, 100)
      spawnFloatingText("+5HP", player.x + player.width / 2, player.y - 50)
    }
    showComboText()
  } else {
    comboCount = 0
  }
}

function bossTakeDamage(amount) {
    if (boss.isFlashing) return;
    boss.hp -= amount;
     spawnFloatingText("-" + amount, boss.x, boss.y - 50)
    }

function showComboText() {
  comboMessageAlpha = 1
  comboMessageStart = Date.now()
  if (comboCount >= 5) {
    comboMessage = "SCAMRAGE!!!"
  } else if (comboCount >= 2) {
    comboMessage = `COMBO x${comboCount}`
  } else {
    comboMessage = ""
  }
}

function updateComboMessage() {
  if (!comboMessage) return
  const elapsed = Date.now() - comboMessageStart
  const duration = 2000
  if (elapsed >= duration) {
    comboMessageAlpha = 0
    comboMessage = ""
  } else {
    const t = elapsed / duration
    comboMessageAlpha = 1 - t
  }
}

function drawSkillNotReady() {
  const x = (player.x + player.width / 2) - cameraX
  const y = player.y - 20
  ctx.save()
  ctx.font = "20px 'Micro 5', sans-serif"
  ctx.fillStyle = `rgba(255,0,0,${skillNotReadyAlpha})`
  ctx.textAlign = "center"
  ctx.fillText("Skill not ready", x, y)
  ctx.restore()
}

function showSkillNotReady() {
  skillNotReadyAlpha = 1
  skillNotReadyTime = 1000
}

function drawComboMessage() {
  ctx.save()
  ctx.font = "bold 36px 'Micro 5', sans-serif"
  ctx.fillStyle = `rgba(255,255,255,${comboMessageAlpha})`
  ctx.textAlign = "center"
  const posX = canvas.width / (2 * canvasScale)
  const posY = canvas.height * 0.25 / canvasScale
  ctx.fillText(comboMessage, posX, posY)
  ctx.restore()
}

function drawPlayerHpBar() {
  const barWidth = 50
  const barHeight = 5
  const x = (player.x + player.width / 2 - cameraX - barWidth / 2) / canvasScale
  const y = player.y / canvasScale - 20
  ctx.fillStyle = "#000"
  ctx.fillRect(x, y, barWidth, barHeight)
  const hpWidth = (player.hp / 100) * barWidth
  ctx.fillStyle = "#f00"
  ctx.fillRect(x, y, hpWidth, barHeight)
}

function drawCollisionBox() {
  if (!showCollisionBox) return
  ctx.strokeStyle = 'green'
  ctx.lineWidth = 1
  const collisionX = (player.x + player.collisionOffsetX - cameraX) / canvasScale
  const collisionY = (player.y + player.collisionOffsetY) / canvasScale
  ctx.strokeRect(collisionX, collisionY, player.collisionWidth / canvasScale, player.collisionHeight / canvasScale)
}

function playerTakeDamage(amount) {
  if (player.invulnerable) return
  player.hp -= amount
  spawnDamageParticles(player.x + player.width / 2, player.y + player.height / 2, 10)
  if (player.hp <= 0) {
    player.alive = false
    endGame()
  }
}

function spawnDamageParticles(x, y, count) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 2 + 1
    damageParticles.push({
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
    })
  }
}

function spawnFloatingText(text, x, y) {
  floatingTexts.push({
    text: text,
    x: x,
    y: y,
    alpha: 1,
    vy: -0.5
  })
}

function checkCheatCode(code) {
  if (cheatActivated) return
  if (code === cheatSequence[cheatIndex]) {
    cheatIndex++
    if (cheatIndex === cheatSequence.length) {
      cheatActivated = true
      player.invulnerable = true
      showCollisionBox = 1
      spawnFloatingText("Cheat Activated!", player.x + player.width / 2, player.y - 50)
    }
  } else {
    cheatIndex = 0
  }
}

function spawnBlissParticles() {
  for (let i = 0; i < blissSpawnRate; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = Math.random() * 2 + 1
    const xPos = player.x + player.width / 2 + Math.cos(angle) * 20
    const yPos = player.y + player.height / 2 + Math.sin(angle) * 20
    blissParticles.push({
      x: xPos,
      y: yPos,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      initialTime: Date.now(),
    })
  }
}

function updateBlissParticles() {
  blissParticles.forEach((p, i) => {
    const elapsed = Date.now() - p.initialTime
    const duration = 500
    if (elapsed > duration) {
      blissParticles.splice(i, 1)
    } else {
      p.alpha = 1 - (elapsed / duration)
      p.x += p.vx * gameSpeed
      p.y += p.vy * gameSpeed
    }
  })
}

function startGame() {
  gameStarted = true
  startScreen.style.display = "none"
  victoryScreen.style.display = "none"
  gameOverScreen.style.display = "none"
  resetGame()
}

function restartGame() {
  gameOverScreen.style.display = "none"
  victoryScreen.style.display = "none"
  resetGame()
}

function resetGame() {
  canvas.width = BASE_CANVAS_WIDTH
  canvas.height = BASE_CANVAS_HEIGHT
  screenWidth = window.innerWidth
  screenHeight = window.innerHeight
  canvasScale = screenHeight / BASE_CANVAS_HEIGHT
  canvas.width = Math.round(Math.max(screenWidth, BASE_CANVAS_WIDTH * canvasScale))
  canvas.height = Math.round(screenHeight)
  canvasOffsetX = (screenWidth - canvas.width) / 2
  canvasOffsetY = 0

  player.x = -100
  player.playerStartX = 100
  player.y = GROUND_Y - player.height
  player.velocityY = 0
  player.velocityX = 0
  player.energy = 0
  player.superMeowReady = false
  player.alive = true
  player.hp = 100
  player.collisionWidth = player.width * 0.85
  player.collisionHeight = player.height * 0.85
  player.collisionOffsetX = (player.width - player.collisionWidth) / 2
  player.collisionOffsetY = (player.height - player.collisionHeight) / 2
  player.isEntering = true
  player.isFading = false
  player.fadeTimer = 0
  player.skillOpacity = 1
  player.direction = 'right'
  player.animationState = 'idle'
  player.isJumping = false
  player.isDashing = false
  player.dashTimer = 0
  player.opacity = 1
  player.invulnerable = cheatActivated ? true : false

  dashParticles = []
  meowWaves = []
  meteors = []
  explosions = []
  energyItems = []
  pursuers = []
  platforms = []
  floatingTexts = []
  damageParticles = []
  blissParticles = []
  fadeAlpha = 0
  cameraX = -200
  spawnTimer = Date.now()
  meteorSpawnRate = 2000
  lastPursuerSpawn = Date.now()
  pursuerSpawnRate = 5000
  bossMeteorSpawnRate = 1600
  gameOver = false
  victory = false

  document.body.style.overflow = 'hidden'
  clearInterval(timerInterval)
  gameTimer = 60
  startTimer()

  boss.hp = 10
  boss.isActive = false
  boss.shots = []
  boss.lastShotTime = 0
  boss.y = platformLevels[1]
  boss.flashStartTime = null
  boss.isFlashing = false
  boss.flashVisible = false
  boss.descendActive = false
  boss.descendTimer = 0
  boss.nextDescendTime = Date.now() + getRandomInterval(5000, 10000)
  boss.newAttackReady = false
  boss.lastNewAttackTime = Date.now()

  lastMeowTime = 0
  lastDashTime = 0
  lastSkillTime = 0
  comboCount = 0
  lastDashKill = false
  skillNotReadyAlpha = 0
  skillNotReadyTime = 0

  platforms = generateLevelPlatforms()
  energyItems = generateLevelWhiskas(platforms)
  spawnBossPlatform()

  superMeowReadyEl.style.opacity = 0
  resetButtons()
  requestAnimationFrame(gameLoop)
}

function endGame(victoryCondition = false) {
  gameOver = true
  clearInterval(timerInterval)
  if (victoryCondition) {
    victoryScreen.style.display = "flex"
    victoryScoreEl.textContent = `YO! YOU DID IT: ${player.energy}`
  } else if (player.hp <= 0) {
    finalScoreEl.textContent = `GAME OVER! ENRGY: ${player.energy}`
    gameOverScreen.style.display = "flex"
  } else if (gameTimer <= 0) {
    finalScoreEl.textContent = `GAME OVER! ENRGY: ${player.energy}`
    gameOverScreen.style.display = "flex"
  }
}

function resetButtons() {
  meowBtn.disabled = false
  meowBtn.classList.remove('cooldown')
  meowBtn.style.opacity = 1
  meowBtn.style.background = ''
}

function startTimer() {
  timerInterval = setInterval(() => {
    gameTimer -= 1
    if (gameTimer <= 0) {
      clearInterval(timerInterval)
      endGame()
    }
  }, 1000)
}

function playMusic() {
  if (!musicPlayed) {
    gameMusic.loop = true
    gameMusic.play().catch(error => {
      console.warn("Не удалось воспроизвести музыку:", error)
    })
    musicPlayed = true
  }
}

function gameLoop() {
  if (!gameOver && gameStarted) {
    updateGame()
    drawGame(screenWidth, screenHeight)
    requestAnimationFrame(gameLoop)
  }
}

function handleResize() {
  canvas.width = BASE_CANVAS_WIDTH
  canvas.height = BASE_CANVAS_HEIGHT
  screenWidth = window.innerWidth
  screenHeight = window.innerHeight
  canvasScale = 1
  canvas.width = Math.round(Math.max(screenWidth, BASE_CANVAS_WIDTH))
  canvas.height = Math.round(Math.max(screenHeight, BASE_CANVAS_HEIGHT))
  canvasOffsetX = (screenWidth - canvas.width) / 2
  canvasOffsetY = (screenHeight - canvas.height) / 2

  const uiTop = 20
  const uiBottom = (screenHeight) - 650
  controls.style.bottom = uiBottom + "px"
  superMeowReadyEl.style.top = uiTop + "px"
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function updateAnimations() {
  if (player.animationState === 'idle') {
    idleFrameTimer++
    if (idleFrameTimer >= idleFrameInterval) {
      idleFrameTimer = 0
      idleFrameIndex = (idleFrameIndex + 1) % idleFrames.length
    }
  } else if (player.animationState === 'run') {
    runFrameTimer++
    if (runFrameTimer >= runFrameInterval) {
      runFrameTimer = 0
      runFrameIndex = (runFrameIndex + 1) % runFrames.length
    }
  } else if (player.animationState === 'jump' && !player.performedDoubleJump) {
    jumpFrameTimer++
    if (jumpFrameTimer >= jumpFrameInterval) {
      jumpFrameTimer = 0
      jumpFrameIndex = (jumpFrameIndex + 1) % jumpFrames.length
    }
  } else if (player.animationState === 'double_jump') {
    doubleJumpFrameTimer++
    if (doubleJumpFrameTimer >= doubleJumpFrameInterval) {
      doubleJumpFrameTimer = 0
      doubleJumpFrameIndex = (doubleJumpFrameIndex + 1) % doubleJumpFrames.length
    }
  }
}

function updateDashAnimations() {
  dashFrameTimer++
  if (dashFrameTimer >= dashFrameInterval) {
    dashFrameTimer = 0
    dashFrameIndex = (dashFrameIndex + 1) % dashFrames.length
  }
}

window.onload = () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  if (window.Telegram) {
    window.Telegram.WebApp.disableVerticalSwipes()
    if (window.Telegram.WebApp.isVersionAtLeast("8.0")) {
      try {
        window.Telegram.WebApp.requestFullscreen()
      } catch (e) { }
    }
    if (window.Telegram.WebApp.platform === "ios") {
      window.Telegram.WebApp.expand()
    }
    if (window.Telegram.WebApp.isExpanded) {
      handleResize()
    }
    window.Telegram.WebApp.onEvent("viewportChanged", handleResize)
    window.Telegram.WebApp.onEvent("fullscreenChanged", () => { })
  }
}
