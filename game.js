let width;
let height;
let tileSize;
let canvas;
let ctx;
let fps;

// Other global variables
let food;
let snake;
let score;

// Initialization of the game objects.
function init() {
    tileSize = 20;

    // Dynamically controlling the size of canvas
    width = tileSize * Math.floor(window.innerWidth / tileSize);
    height = tileSize * Math.floor(window.innerHeight / tileSize);

    fps = 10;

    canvas = document.getElementById('game-canvas');
    canvas.width = width;
    canvas.height = height;

    ctx = canvas.getContext('2d');

    isPaused = false;
    score = 0;

    food = new Food(spawnLocation(), '#FF5555');
    snake = new Snake({
        x: tileSize * Math.floor(width / (2 * tileSize)),
        y: tileSize * Math.floor(height / (2 * tileSize)),
    }, '#50FA7B');
}

// Determining a random spawn location on the grid
function spawnLocation() {
    // Breaking the entire canvas into a grid of titles
    let rows = width / tileSize;
    let cols = height / tileSize;

    let xPos, yPos;

    xPos = Math.floor(Math.random() * rows) * tileSize;
    yPos = Math.floor(Math.random() * cols) * tileSize;

    return { x: xPos, y: yPos };
}

// The actual game function
function game() {
    init();

    // The game loop
    interval = setInterval(update, 1000 / fps);
}

// Loading the browser windows
window.addEventListener('load', function () {
    game();
});

// Adding an event listener for key presses
window.addEventListener('keydown', function (evt) {
    if (evt.key === ' ') {
        evt.preventDefault();

        isPaused = !isPaused;
        showPaused();
    } else if (evt.key === 'ArrowUp') {
        evt.preventDefault();

        if (snake.velY != 1 && snake.x >= 0 && snake.x <= width && snake.y >= 0 && snake.y <= height) {
            snake.dir(0, -1);
        }
    } else if (evt.key === 'ArrowDown') {
        evt.preventDefault();

        if (snake.velY != -1 && snake.x >= 0 && snake.x <= width && snake.y >= 0 && snake.y <= height) {
            snake.dir(0, 1);
        }
    } else if (evt.key === 'ArrowLeft') {
        evt.preventDefault();

        if (snake.velX != 1 && snake.x >= 0 && snake.x <= width && snake.y >= 0 && snake.y <= height) {
            snake.dir(-1, 0);
        }
    } else if (evt.key === 'ArrowRight') {
        evt.preventDefault();

        if (snake.velX != -1 && snake.x >= 0 && snake.x <= width && snake.y >= 0 && snake.y <= height) {
            snake.dir(1, 0);
        }
    }
});

// Updating the position and redrawing  of game objects
function update() {
    // Checking if game is paused
    if (isPaused) {
        return;
    }

    if (snake.die()) {
        alert('GAME OVER!!!');
        window.location.reload();
    }

    snake.border();

    if (snake.eat()) {
        score += 10;
        food = new Food(spawnLocation(), 'red');
    }

    // Clearing the canvas for redrawing
    ctx.clearRect(0, 0, width, height);

    food.draw();
    snake.draw();
    snake.move();
    showScore();
}

// Showing the score of the player
function showScore() {
    ctx.texAlign = 'center';
    ctx.font = '24px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText('SCORE: ' + score, width - 120, 30);

}

// Showing if the game is paused
function showPaused() {
    ctx.texAlign = 'center';
    ctx.font = '36px Arial'
    ctx.fillStyle = 'white';
    ctx.fillText('PAUSED', (width - 70) / 2, height / 2);
}

// Treating the food as an object
class Food {
    // Initialization of object properties
    constructor(pos, color) {
        this.x = pos.x;
        this.y = pos.y;
        this.color = color;
    }

    // Drawing the food on the canvas
    draw() {
        ctx.beginPath();
        ctx.rect(this.x, this.y, tileSize, tileSize);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();
    }
}

class Snake {
    // Initialization of objects properties
    constructor(pos, color) {
        this.x = pos.x;
        this.y = pos.y;
        this.tail = [{ x: pos.x - tileSize, y: pos.y }, { x: pos.x - tileSize * 2, y: pos.y }];
        this.velX = 1;
        this.velY = 0;
        this.color = color;

    }

    // Drawing the snake on the canvas
    draw() {
        // Drawing the head of the snake
        ctx.beginPath();
        ctx.rect(this.x, this.y, tileSize, tileSize);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.closePath();

        // Drawing the tail of snake
        for (var i = 0; i < this.tail.length; i++) {
            ctx.beginPath();
            ctx.rect(this.tail[i].x, this.tail[i].y, tileSize, tileSize);
            ctx.fillStyle = this.color;
            ctx.fill();
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.closePath();
        }
    }

    // Moving the snake by updating position
    move() {
        // Movement of the tail
        for (let i = this.tail.length - 1; i > 0; i--) {
            this.tail[i] = this.tail[i - 1];
        }

        // Updating the start of the tail do acquire the position of the head
        if (this.tail.length != 0) {
            this.tail[0] = { x: this.x, y: this.y };
        }

        // Movement of the head
        this.x += this.velX * tileSize;
        this.y += this.velY * tileSize;
    }

    // Changing the direction of movement of snake
    dir(dirX, dirY) {
        this.velX = dirX;
        this.velY = dirY;
    }

    // Determining wheter the snake has eaten a piece of food
    eat() {
        if (Math.abs(this.x - food.x) < tileSize && Math.abs(this.y - food.y) < tileSize) {
            this.tail.push({});
            return true;
        }

        return false;
    }

    // Checking if the snake as died
    die() {
        for (var i = 0; i < this.tail.length; i++) {
            if (Math.abs(this.x - this.tail[i].x) < tileSize && Math.abs(this.y - this.tail[i].y) < tileSize) {
                return true;
            }
        }

        return false;
    }

    border() {
        if (this.x + tileSize > width && this.velX != -1 || this.x < 0 && this.velX != 1) {
            this.x = width - this.x;
        } else if (this.y + tileSize > height && this.velY != -1 || this.velY != 1 && this.y < 0) {
            this.y = height - this.y;
        }
    }
}
