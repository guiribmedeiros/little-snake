// Variables for the gestures
let lastTapped = 0;
let touchStartX = undefined;
let touchStartY = undefined;

// Pauses the game at browser's window double tap
window.addEventListener('touchend', function (event) {
    var currentTime = new Date().getTime();

    // Uses 0.25 seconds as the double-tap timeout
    if (currentTime - lastTapped < 250) {
        event.preventDefault();

        pauseGame();
    }

    lastTapped = currentTime;
});

// Adds events for the touches
window.addEventListener('touchstart', function (event) {
    touchStartX = Math.abs(event.touches[0].clientX);
    touchStartY = Math.abs(event.touches[0].clientY);
});

// Adds events for the touches
window.addEventListener('touchmove', function (event) {
    if (!touchStartX || !touchStartY) {
        return;
    }

    touchEndX = Math.abs(event.touches[0].clientX);
    touchEndY = Math.abs(event.touches[0].clientY);

    if (touchEndY < touchStartY) {
        snake.changeDirection('UP');
    } else if (touchEndY > touchStartY) {
        snake.changeDirection('DOWN');
    } else if (touchEndX < touchStartX) {
        snake.changeDirection('LEFT');
    } else if (touchEndX > touchStartX) {
        snake.changeDirection('RIGHT');
    }

    // Reset the initial position values
    touchStartX = undefined;
    touchStartY = undefined;
});
