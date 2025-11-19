window.onload = () => {
    const board = document.querySelector(".board");
    const scoreText = document.querySelector(".score");
    const highScoreText = document.querySelector(".high-score");
    const startBtn = document.querySelector(".btn-start");
    const modal = document.querySelector(".modal");
    const time = document.querySelector(".timer");

    const cellSize = 34;
    const rows = Math.floor(board.clientHeight / cellSize);
    const cols = Math.floor(board.clientWidth / cellSize);

    let snake = [{ x: 2, y: 2 }];
    let food = {};
    let direction = null;
    let intervalId = null;
    let timerId = null;
    let totalSeconds = 0;
    let blocks = {};

    // Create Grid
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const div = document.createElement("div");
            div.classList.add("block");
            board.appendChild(div);
            blocks[`${r}-${c}`] = div;
        }
    }

    // Start Button
    startBtn.addEventListener("click", () => {
        modal.style.display = "none";

        // Reset data
        snake = [{ x: 2, y: 2 }];
        direction = null;
        scoreText.innerText = 0;
        clearInterval(intervalId);

        clearBoard();
        placeFood();
        draw();
        startTimer();

        intervalId = setInterval(move, 200);
    });

    function startTimer() {
        clearInterval(timerId);
        totalSeconds = 0;

        timerId = setInterval(() => {
            totalSeconds++;

            let min = Math.floor(totalSeconds / 60);
            let sec = totalSeconds % 60;

            time.innerText =
                (min < 10 ? "0" : "") + min + ":" +
                (sec < 10 ? "0" : "") + sec;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerId);
    }

    function clearBoard() {
        Object.values(blocks).forEach(b => {
            b.classList.remove("snake-path", "food");
        });
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * rows);
        food.y = Math.floor(Math.random() * cols);

        while (snake.some(s => s.x === food.x && s.y === food.y)) {
            food.x = Math.floor(Math.random() * rows);
            food.y = Math.floor(Math.random() * cols);
        }
    }

    function draw() {
        highScoreText.innerText = localStorage.getItem("High Score") || 0;

        snake.forEach(s => {
            blocks[`${s.x}-${s.y}`].classList.add("snake-path");
        });

        blocks[`${food.x}-${food.y}`].classList.add("food");
    }

    function move() {
        if (!direction) return draw();

        snake.forEach(s =>
            blocks[`${s.x}-${s.y}`].classList.remove("snake-path")
        );

        let head = { ...snake[0] };

        if (direction === "up") head.x--;
        if (direction === "down") head.x++;
        if (direction === "left") head.y--;
        if (direction === "right") head.y++;

        // Wall hit
        if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols)
            return endGame();

        // Self hit
        if (snake.some(s => s.x === head.x && s.y === head.y))
            return endGame();

        // Food eaten
        if (head.x === food.x && head.y === food.y) {
            blocks[`${food.x}-${food.y}`].classList.remove("food");
            scoreText.innerText = +scoreText.innerText + 1;
            snake.unshift(head);
            placeFood();
        } else {
            snake.unshift(head);
            snake.pop();
        }

        draw();
    }

    function endGame() {
        clearInterval(intervalId);
        stopTimer();

        let score = +scoreText.innerText;
        let highScore = +localStorage.getItem("High Score") || 0;

        if (score > highScore) {
            localStorage.setItem("High Score", score);
        }

        modal.style.display = "flex";
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" && direction !== "down") direction = "up";
        if (e.key === "ArrowDown" && direction !== "up") direction = "down";
        if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
        if (e.key === "ArrowRight" && direction !== "left") direction = "right";
    });
};
