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
    let moveSpeed = 200;
    let blocks = {};
    let hintBlocks = [];

    // Create grid
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const div = document.createElement("div");
            div.classList.add("block");
            board.appendChild(div);
            blocks[`${r}-${c}`] = div;
        }
    }

    startBtn.addEventListener("click", () => {
        modal.style.display = "none";
        snake = [{ x: 2, y: 2 }];
        direction = null;
        scoreText.innerText = 0;
        moveSpeed = 200;
        clearInterval(intervalId);
        clearBoard();
        placeFood();
        draw();
        startTimer();
        intervalId = setInterval(move, moveSpeed);
    });

    function startTimer() {
        clearInterval(timerId);
        totalSeconds = 0;
        timerId = setInterval(() => {
            totalSeconds++;
            let min = Math.floor(totalSeconds / 60);
            let sec = totalSeconds % 60;
            time.innerText = (min < 10 ? "0" : "") + min + ":" + (sec < 10 ? "0" : "") + sec;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerId);
    }

    function clearBoard() {
        Object.values(blocks).forEach(b => {
            b.classList.remove("snake-path", "food", "hint");
        });
        hintBlocks = [];
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * rows);
        food.y = Math.floor(Math.random() * cols);
        while (snake.some(s => s.x === food.x && s.y === food.y)) {
            food.x = Math.floor(Math.random() * rows);
            food.y = Math.floor(Math.random() * cols);
        }
        showHints();
    }

    function draw() {
    highScoreText.innerText = localStorage.getItem("High Score") || 0;

    // Draw snake
    snake.forEach(s => {
        blocks[`${s.x}-${s.y}`].classList.add("snake-path");
    });

    // Always draw food
    blocks[`${food.x}-${food.y}`].classList.add("food");

    // Draw hints if they exist
    hintBlocks.forEach(b => b.classList.add("hint"));
}

function removeHints() {
    // Remove only hint classes, keep food intact
    hintBlocks.forEach(b => b.classList.remove("hint"));
    hintBlocks = [];
}


    function showHints() {
        removeHints();
        const head = snake[0];
        let queue = [[{ x: head.x, y: head.y }, []]];
        let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        visited[head.x][head.y] = true;
        let paths = [];

        while (queue.length && paths.length < 3) {
            const [current, path] = queue.shift();
            if (current.x === food.x && current.y === food.y) {
                paths.push(path);
                continue;
            }
            const moves = [
                { x: -1, y: 0 },
                { x: 1, y: 0 },
                { x: 0, y: -1 },
                { x: 0, y: 1 }
            ];
            for (let move of moves) {
                const nx = current.x + move.x;
                const ny = current.y + move.y;
                if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && !visited[nx][ny]) {
                    visited[nx][ny] = true;
                    queue.push([{ x: nx, y: ny }, [...path, { x: nx, y: ny }]]);
                }
            }
        }

        paths.forEach(p => {
            p.forEach(pos => {
                blocks[`${pos.x}-${pos.y}`].classList.add("hint");
                hintBlocks.push(blocks[`${pos.x}-${pos.y}`]);
            });
        });
    }

    
    function move() {
        if (!direction) return draw();
        snake.forEach(s => blocks[`${s.x}-${s.y}`].classList.remove("snake-path"));
            blocks[`${food.x}-${food.y}`].classList.remove("food");

        removeHints();

        let head = { ...snake[0] };
        if (direction === "up") head.x--;
        if (direction === "down") head.x++;
        if (direction === "left") head.y--;
        if (direction === "right") head.y++;

        if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) return endGame();
        if (snake.some(s => s.x === head.x && s.y === head.y)) return endGame();

        if (head.x === food.x && head.y === food.y) {
            snake.unshift(head);
            scoreText.innerText = +scoreText.innerText + 1;
            placeFood();
            moveSpeed = Math.max(50, moveSpeed - 10);
            clearInterval(intervalId);
            intervalId = setInterval(move, moveSpeed);
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
        if (score > highScore) localStorage.setItem("High Score", score);
        modal.style.display = "flex";
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" && direction !== "down") direction = "up";
        if (e.key === "ArrowDown" && direction !== "up") direction = "down";
        if (e.key === "ArrowLeft" && direction !== "right") direction = "left";
        if (e.key === "ArrowRight" && direction !== "left") direction = "right";
    });
};
