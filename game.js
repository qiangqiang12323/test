class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.snake = [{x: 5, y: 5}];
        this.food = this.generateFood();
        this.direction = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.isGameOver = false;
        this.basketballImage = new Image();
        this.basketballImage.src = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji/assets/Basketball/3D/basketball_3d.png';
        this.isImageLoaded = false;
        
        this.basketballImage.onload = () => {
            this.isImageLoaded = true;
            this.draw();
        };

        this.basketballImage.onerror = () => {
            console.error('篮球图片加载失败');
            this.isImageLoaded = false;
        };

        this.bindControls();
        this.setupButtons();

        // 为不支持 roundRect 的浏览器添加 polyfill
        if (!this.ctx.roundRect) {
            this.ctx.roundRect = function(x, y, width, height, radius) {
                this.beginPath();
                this.moveTo(x + radius, y);
                this.arcTo(x + width, y, x + width, y + height, radius);
                this.arcTo(x + width, y + height, x, y + height, radius);
                this.arcTo(x, y + height, x, y, radius);
                this.arcTo(x, y, x + width, y, radius);
                this.closePath();
                return this;
            };
        }
    }

    bindControls() {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });
    }

    setupButtons() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('restartBtn').addEventListener('click', () => {
            document.getElementById('gameOver').classList.add('hidden');
            this.resetGame();
        });
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize));
        return {x, y};
    }

    update() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        if (this.checkCollision(head)) {
            this.endGame();
            return;
        }

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('score').textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        return (
            head.x < 0 ||
            head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 ||
            head.y >= this.canvas.height / this.gridSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)
        );
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格背景
        this.drawGrid();

        // 绘制蛇身
        this.ctx.fillStyle = '#4CAF50';
        for (let i = 1; i < this.snake.length; i++) {
            const segment = this.snake[i];
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                5  // 圆角半径
            );
            this.ctx.fill();
        }

        // 绘制蛇头（篮球）
        if (this.isImageLoaded) {
            this.ctx.drawImage(
                this.basketballImage,
                this.snake[0].x * this.gridSize,
                this.snake[0].y * this.gridSize,
                this.gridSize,
                this.gridSize
            );
        } else {
            // 如果图片未加载完成，先用默认样式
            this.ctx.fillStyle = '#FFA500';
            this.ctx.beginPath();
            this.ctx.roundRect(
                this.snake[0].x * this.gridSize + 1,
                this.snake[0].y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                5
            );
            this.ctx.fill();
        }

        // 绘制食物（圆形）
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(
            this.food.x * this.gridSize + this.gridSize/2,
            this.food.y * this.gridSize + this.gridSize/2,
            this.gridSize/2 - 2,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }

    // 添加绘制网格的方法
    drawGrid() {
        this.ctx.strokeStyle = '#E0E0E0';
        this.ctx.lineWidth = 0.5;

        // 绘制垂直线
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // 绘制水平线
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    startGame() {
        if (!this.gameLoop) {
            this.gameLoop = setInterval(() => {
                this.update();
                this.draw();
            }, 150);
        }
    }

    resetGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.score = 0;
        this.food = this.generateFood();
        this.isGameOver = false;
        document.getElementById('score').textContent = '0';
        this.draw();
    }

    endGame() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isGameOver = true;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
}

// 初始化游戏
window.onload = () => {
    const game = new SnakeGame();
    game.draw();
}; 