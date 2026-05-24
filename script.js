const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const levelText = document.getElementById("level");
const messageText = document.getElementById("message");

const startBtn = document.getElementById("start");
const restartBtn = document.getElementById("restart");

let score = 0;
let lives = 3;
let level = 1;
let gameRunning = false;
let paused = false;

let ball = {
  x: canvas.width / 2,
  y: canvas.height - 60,
  radius: 10,
  dx: 3,
  dy: -3
};

let paddle = {
  width: 120,
  height: 15,
  x: canvas.width / 2 - 60,
  speed: 7,
  movingLeft: false,
  movingRight: false
};

let brick = {
  rows: 5,
  cols: 8,
  width: 85,
  height: 22,
  padding: 10,
  topOffset: 40,
  leftOffset: 35
};

let bricks = [];

function createBricks() {
  bricks = [];

  for (let r = 0; r < brick.rows; r++) {
    bricks[r] = [];

    for (let c = 0; c < brick.cols; c++) {
      bricks[r][c] = {
        x: c * (brick.width + brick.padding) + brick.leftOffset,
        y: r * (brick.height + brick.padding) + brick.topOffset,
        visible: true
      };
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawPaddle() {
  ctx.fillStyle = "plum";
  ctx.fillRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height);
}

function drawBricks() {
  const colors = ["cornflowerblue", "plum", "white"];

  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.cols; c++) {
      const currentBrick = bricks[r][c];

      if (currentBrick.visible) {
        ctx.fillStyle = colors[(r + c) % colors.length];
        ctx.fillRect(currentBrick.x, currentBrick.y, brick.width, brick.height);
      }
    }
  }
}

function drawBackground() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateText() {
  scoreText.textContent = "Score: " + score;
  livesText.textContent = "Lives: " + lives;
  levelText.textContent = "Level: " + level;
}

function movePaddle() {
  if (paddle.movingLeft && paddle.x > 0) {
    paddle.x -= paddle.speed;
  }

  if (paddle.movingRight && paddle.x + paddle.width < canvas.width) {
    paddle.x += paddle.speed;
  }
}

function moveBall() {
  ball.x += ball.dx;
  ball.y += ball.dy;
}

function checkWallCollision() {
  if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
    ball.dx *= -1;
  }

  if (ball.y - ball.radius < 0) {
    ball.dy *= -1;
  }
}

function checkPaddleCollision() {
  const paddleTop = canvas.height - paddle.height - 10;

  if (
    ball.y + ball.radius > paddleTop &&
    ball.x > paddle.x &&
    ball.x < paddle.x + paddle.width
  ) {
    ball.dy *= -1;
  }
}

function checkBrickCollision() {
  for (let r = 0; r < brick.rows; r++) {
    for (let c = 0; c < brick.cols; c++) {
      const currentBrick = bricks[r][c];

      if (
        currentBrick.visible &&
        ball.x > currentBrick.x &&
        ball.x < currentBrick.x + brick.width &&
        ball.y > currentBrick.y &&
        ball.y < currentBrick.y + brick.height
      ) {
        currentBrick.visible = false;
        ball.dy *= -1;
        score++;
        updateText();
        checkWin();
      }
    }
  }
}

function checkMissedBall() {
  if (ball.y + ball.radius > canvas.height) {
    lives--;
    updateText();

    if (lives <= 0) {
      gameOver();
    } else {
      resetBallAndPaddle();
    }
  }
}

function checkWin() {
  if (score === brick.rows * brick.cols * level) {
    level++;
    messageText.textContent = "Nice! Level " + level;

    ball.dx += ball.dx > 0 ? 0.8 : -0.8;
    ball.dy += ball.dy > 0 ? 0.8 : -0.8;

    createBricks();
    resetBallAndPaddle();
    updateText();
  }
}

function resetBallAndPaddle() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height - 60;
  ball.dx = 3 + level * 0.4;
  ball.dy = -3 - level * 0.4;

  paddle.x = canvas.width / 2 - paddle.width / 2;
}

function gameOver() {
  gameRunning = false;
  messageText.textContent = "Game Over! Click RESTART to try again.";
}

function restartGame() {
  score = 0;
  lives = 3;
  level = 1;
  paused = false;
  gameRunning = true;

  messageText.textContent = "";
  createBricks();
  resetBallAndPaddle();
  updateText();
  draw();
}

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    paused = false;
    messageText.textContent = "";
    draw();
  }
}

function draw() {
  drawBackground();
  drawBall();
  drawPaddle();
  drawBricks();

  if (gameRunning && !paused) {
    movePaddle();
    moveBall();
    checkWallCollision();
    checkPaddleCollision();
    checkBrickCollision();
    checkMissedBall();

    requestAnimationFrame(draw);
  }
}

document.addEventListener("mousemove", function (event) {
  const canvasPosition = canvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasPosition.left;

  paddle.x = mouseX - paddle.width / 2;

  if (paddle.x < 0) {
    paddle.x = 0;
  }

  if (paddle.x + paddle.width > canvas.width) {
    paddle.x = canvas.width - paddle.width;
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    paddle.movingLeft = true;
  }

  if (event.key === "ArrowRight") {
    paddle.movingRight = true;
  }

  if (event.code === "Space" && gameRunning) {
    paused = !paused;

    if (paused) {
      messageText.textContent = "Paused";
    } else {
      messageText.textContent = "";
      draw();
    }
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    paddle.movingLeft = false;
  }

  if (event.key === "ArrowRight") {
    paddle.movingRight = false;
  }
});

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", restartGame);

createBricks();
updateText();
draw();
