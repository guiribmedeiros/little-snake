// Declaration for the required global variables
const fontName = 'Joystix';

// Constants for the game
const gameCanvas = document.getElementById('game-canvas');
const gameContext = gameCanvas.getContext('2d');

// Constants for the game settings
const tileSize = 24;
const desiredFps = 16;
const fpsInterval = 1000 / desiredFps;

// Variables for the game
let isPaused = false;
let snake;
let fruit;
let score = 0;

// Variables for the game loop
let animationFrame;
let startTime;
let lastTime = Date.now();
let elapsedTime;

// Starts the game at browser's window load
window.addEventListener('load', function () {
    document.fonts
        .load('48px Joystix')
        .then(startGame);
});

// Reinitializes the game at the browser's window resize
window.addEventListener('resize', function () {
    initializeGame();
});

// Adds events for the key presses
window.addEventListener('keydown', function (event) {
    if (event.key === ' ') {
        event.preventDefault();

        isPaused = !isPaused;
        showPaused();
    } else if (event.key === 'ArrowUp') {
        event.preventDefault();

        if (snake.velY != 1 && snake.posX >= 0 && snake.posX <= gameCanvas.width && snake.posY >= 0 && snake.posY <= gameCanvas.height) {
            snake.changeDirection({ x: 0, y: -1 });
        }
    } else if (event.key === 'ArrowDown') {
        event.preventDefault();

        if (snake.velY != -1 && snake.posX >= 0 && snake.posX <= gameCanvas.width && snake.posY >= 0 && snake.posY <= gameCanvas.height) {
            snake.changeDirection({ x: 0, y: 1 });
        }
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();

        if (snake.velX != 1 && snake.posX >= 0 && snake.posX <= gameCanvas.width && snake.posY >= 0 && snake.posY <= gameCanvas.height) {
            snake.changeDirection({ x: -1, y: 0 });
        }
    } else if (event.key === 'ArrowRight') {
        event.preventDefault();

        if (snake.velX != -1 && snake.posX >= 0 && snake.posX <= gameCanvas.width && snake.posY >= 0 && snake.posY <= gameCanvas.height) {
            snake.changeDirection({ x: 1, y: 0 });
        }
    }
});

// Initializes the game objects
function initializeGame() {
    // Dynamically controls the size for the game canvas
    gameCanvas.width = tileSize * Math.floor(window.innerWidth / tileSize);
    gameCanvas.height = tileSize * Math.floor(window.innerHeight / tileSize);

    // Resets the game status
    isPaused = false;
    score = 0;
    lastTime = Date.now();

    // Instances the objects in their places
    snake = new Snake({
        x: tileSize * Math.floor(gameCanvas.width / (2 * tileSize)),
        y: tileSize * Math.floor(gameCanvas.height / (2 * tileSize)),
    });
    fruit = new Fruit(getSpawnLocation());
}

// Updates the position and redraws the game objects
function updateGame() {
    // Checks if the game is paused
    if (isPaused) {
        return;
    }

    // Checks if the snake has died
    if (snake.die()) {
        alert('GAME OVER!');
        cancelAnimationFrame(animationFrame);
        window.location.reload();
    }

    // Checks if the snake has eaten a fruit
    if (snake.eat()) {
        score += 10;
        fruit = new Fruit(getSpawnLocation());
    }

    // Clears the game canvas for redrawing
    gameContext.clearRect(0, 0, gameCanvas.width, gameCanvas.height);

    fruit.draw();
    snake.draw();
    showScore();

    snake.move();
}

// Loops the game
function loopGame() {
    animationFrame = requestAnimationFrame(loopGame);
    startTime = Date.now();
    elapsedTime = startTime - lastTime;

    if (elapsedTime > fpsInterval) {
        // Get ready for next frame by setting lastTime = startTime,
        // But also adjusts for you specified fpsInterval not being a multiple of RAF's interval (16.7ms)
        lastTime = startTime - (elapsedTime % fpsInterval);

        // Updates the game
        updateGame();
    }
}

// Starts the game
function startGame() {
    initializeGame();

    // Starts the game loop
    loopGame();
}

// Shows the game score
function showScore() {
    gameContext.textAlign = 'right';
    gameContext.font = `24px ${fontName}`;
    gameContext.fillStyle = '#FFFFFF';
    gameContext.fillText('SCORE: ' + score, gameCanvas.width - 48, 48);
}

// Shows if the game is paused
function showPaused() {
    const gradient = gameContext.createLinearGradient(0, 0, gameCanvas.width, 0);
    gradient.addColorStop(0, '#F1FA8C');
    gradient.addColorStop(0.33, '#FFB86C');
    gradient.addColorStop(0.66, '#BD93F9');

    gameContext.textAlign = 'center';
    gameContext.font = `48px "${fontName}"`;
    gameContext.fillStyle = gradient;
    gameContext.fillText('PAUSED', gameCanvas.width / 2, gameCanvas.height / 2);
}

// Returns a free spawn position on the game canvas grid
function getSpawnLocation() {
    // Break the entire game canvas into a grid of titles
    let rows = gameCanvas.width / tileSize;
    let cols = gameCanvas.height / tileSize;

    let posX, posY;
    let overlap = false;

    // Prevents an overlap between the fruit and the snake's body
    do {
        posX = Math.floor(Math.random() * rows) * tileSize;
        posY = Math.floor(Math.random() * cols) * tileSize;

        overlap = getFruitSnakeOverlap({ x: posX, y: posY });
    } while (overlap);

    return { x: posX, y: posY };
}

// Checks if the fruit spawned on the snake's body
function getFruitSnakeOverlap(position) {
    if (snake.posX == position.x && snake.posY == position.y) {
        return true;
    }

    for (var i = 0; i < snake.tail.length; i++) {
        if (snake.tail[i].x == position.x && snake.tail[i].y == position.y) {
            return true;
        }
    }

    return false;
}

// Treats the fruit as an object
class Fruit {
    // Colors
    fillColor = '#FF5555';
    strokeColor = '#343746';

    // Initializes the fruit properties
    constructor(position) {
        this.posX = position.x;
        this.posY = position.y;
    }

    // Draws the fruit in the game canvas
    draw() {
        gameContext.beginPath();
        gameContext.rect(this.posX, this.posY, tileSize, tileSize);

        gameContext.fillStyle = this.fillColor;
        gameContext.fill();

        gameContext.strokeStyle = this.strokeColor;
        gameContext.lineWidth = 4;
        gameContext.stroke();

        gameContext.closePath();
    }
}

// Treats the snake as an object
class Snake {
    // Colors
    fillColor = '#50FA7B';
    strokeColor = '#343746';

    // Sounds
    dieSound = new Audio('../assets/sounds/die.mp3');
    eatSound = new Audio('../assets/sounds/eat.mp3');

    // Initializes the snake properties
    constructor(position) {
        this.posX = position.x;
        this.posY = position.y;
        this.tail = [{ x: position.x - tileSize, y: position.y }, { x: position.x - tileSize * 2, y: position.y }];
        this.velX = 1;
        this.velY = 0;
    }

    // Draws the snake in the game canvas
    draw() {
        // Draws the head of snake
        gameContext.beginPath();
        gameContext.rect(this.posX, this.posY, tileSize, tileSize);

        gameContext.fillStyle = this.fillColor;
        gameContext.fill();

        gameContext.strokeStyle = this.strokeColor;
        gameContext.lineWidth = 4;
        gameContext.stroke();

        gameContext.closePath();

        // Draws the tail of snake
        for (var i = 0; i < this.tail.length; i++) {
            gameContext.beginPath();
            gameContext.rect(this.tail[i].x, this.tail[i].y, tileSize, tileSize);

            gameContext.fillStyle = this.fillColor;
            gameContext.fill();

            gameContext.strokeStyle = this.strokeColor;
            gameContext.lineWidth = 4;
            gameContext.stroke();

            gameContext.closePath();
        }
    }

    // Moves the snake by updating its position
    move() {
        // Movement for the tail
        for (let i = this.tail.length - 1; i > 0; i--) {
            this.tail[i] = this.tail[i - 1];
        }

        // Updating the start of the tail do acquire the head's position
        if (this.tail.length != 0) {
            this.tail[0] = { x: this.posX, y: this.posY };
        }

        // Movement for the head
        this.posX += this.velX * tileSize;
        this.posY += this.velY * tileSize;

        // Check if the head has collided with the game canvas border to translocate to the other side
        if (this.posX + tileSize > gameCanvas.width && this.velX != -1 || this.posX < 0 && this.velX != 1) {
            this.posX = gameCanvas.width - this.posX;
        } else if (this.posY + tileSize > gameCanvas.height && this.velY != -1 || this.velY != 1 && this.posY < 0) {
            this.posY = gameCanvas.height - this.posY;
        }
    }

    // Changes the movement's direction
    changeDirection(direction) {
        this.velX = direction.x;
        this.velY = direction.y;
    }

    // Determines whether the snake has eaten a fruit
    eat() {
        if (Math.abs(this.posX - fruit.posX) < tileSize && Math.abs(this.posY - fruit.posY) < tileSize) {
            this.eatSound.play();
            this.tail.push({});

            return true;
        }

        return false;
    }

    // Checks if the snake has died
    die() {
        for (var i = 0; i < this.tail.length; i++) {
            if (Math.abs(this.posX - this.tail[i].x) < tileSize && Math.abs(this.posY - this.tail[i].y) < tileSize) {
                this.dieSound.play();

                return true;
            }
        }

        return false;
    }
}
