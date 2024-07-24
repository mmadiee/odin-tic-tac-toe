const GameBoard = (() => {
    let board = ['', '', '', '', '', '', '', '', ''];

    const getBoard = () => board;

    const setCell = (index, value) => {
        if (board[index] === '') {
            board[index] = value;
            return true;
        }
        return false;
    };

    const resetBoard = () => {
        board = ['', '', '', '', '', '', '', '', ''];
    };

    return { getBoard, setCell, resetBoard };
})();

const Player = (name, marker) => {
    return { name, marker, score: 0 };
};


const AIMove = (() => {
    const makeMove = () => {
        const board = GameBoard.getBoard();
        const emptyCells = board.map((cell, index) => cell === '' ? index : null).filter(index => index !== null);
        const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        GameController.handleCellClick(randomIndex, true); // AI move
    };

    return { makeMove };
})();

const GameController = (() => {
    let player, ai;
    let currentPlayer;
    let round = 1;
    let isGameActive = true;

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    const initializeGame = (playerName, playerMarker) => {
        player = Player(playerName, playerMarker);
        ai = Player('AI', playerMarker === 'X' ? 'O' : 'X');
        currentPlayer = player;

        document.getElementById('player-name-display').textContent = player.name;
        document.getElementById('game').style.display = 'block';
        document.getElementById('player-setup').style.display = 'none';
        DisplayController.updateBoard();
        DisplayController.updatePlayerScore(player.score);
        DisplayController.updateAIScore(ai.score);
    };

    const switchPlayer = () => {
        currentPlayer = currentPlayer === player ? ai : player;
    };

    const checkWinner = () => {
        const board = GameBoard.getBoard();
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                isGameActive = false;
                if (currentPlayer === player) {
                    player.score++;
                    DisplayController.updatePlayerScore(player.score);
                } else {
                    ai.score++;
                    DisplayController.updateAIScore(ai.score);
                }
                DisplayController.showRoundResult(currentPlayer);
                if (player.score === 3 || ai.score === 3) {
                    DisplayController.showGameWinner(currentPlayer);
                } else {
                    document.getElementById('next-round').style.display = 'block';
                }
                return true;
            }
        }

        if (!board.includes('')) {
            isGameActive = false;
            DisplayController.showRoundResult(null); // Draw
            document.getElementById('next-round').style.display = 'block';
            return true;
        }

        return false;
    };

    const handleCellClick = (index, isAI = false) => {
        if (!isGameActive || (currentPlayer !== player && !isAI)) return;

        if (GameBoard.setCell(index, currentPlayer.marker)) {
            DisplayController.updateBoard();
            if (!checkWinner()) {
                switchPlayer();
                if (currentPlayer === ai) {
                    AIMove.makeMove();
                }
            }
        }
    };

    const nextRound = () => {
        GameBoard.resetBoard();
        round++;
        isGameActive = true;
        currentPlayer = round % 2 === 0 ? ai : player;
        DisplayController.updateBoard();
        DisplayController.updateRoundDisplay(round);
        if (currentPlayer === ai) {
            AIMove.makeMove();
        }
    };

    const resetGame = () => {
        GameBoard.resetBoard();
        player.score = 0;
        ai.score = 0;
        round = 1;
        isGameActive = true;
        currentPlayer = player;
        DisplayController.updateBoard();
        DisplayController.updateRoundDisplay(round);
        DisplayController.updatePlayerScore(player.score);
        DisplayController.updateAIScore(ai.score);
        document.getElementById('winner-modal').style.display = 'none';
        document.getElementById('next-round').style.display = 'none';
    };

    return { initializeGame, handleCellClick, nextRound, resetGame };
})();


const DisplayController = (() => {
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('restart');
    const nextRoundButton = document.getElementById('next-round');

    cells.forEach((cell, index) => {
        cell.addEventListener('click', () => {
            GameController.handleCellClick(index);
        });
    });

    resetButton.addEventListener('click', () => {
        GameController.resetGame();
    });

    nextRoundButton.addEventListener('click', () => {
        GameController.nextRound();
        nextRoundButton.style.display = 'none';
        document.getElementById('result-message').style.display = 'none';
    });

    const updateBoard = () => {
        const board = GameBoard.getBoard();
        cells.forEach((cell, index) => {
            const cellImg = cell.querySelector('.cell-img');
            if (board[index] === 'X') {
                cellImg.src = 'img/X.svg';
                cellImg.style.display = 'block';
            } else if (board[index] === 'O') {
                cellImg.src = 'img/O.svg';
                cellImg.style.display = 'block';
            } else {
                cellImg.src = '';
                cellImg.style.display = 'none';
            }
        });
    };

    const updateRoundDisplay = (round) => {
        document.getElementById('round-display').textContent = `Round ${round}`;
    };

    const updatePlayerScore = (score) => {
        document.getElementById('player-score').textContent = score;
    };

    const updateAIScore = (score) => {
        document.getElementById('ai-score').textContent = score;
    };

    const showRoundResult = (winner) => {
        document.getElementById('result-message').style.display = 'block';
        const resultMessage = document.getElementById('result-message');
        if (winner) {
            resultMessage.textContent = `${winner.name} wins this round!`;
        } else {
            resultMessage.textContent = "It's a draw!";
        }
    };

    const showGameWinner = (winner) => {
        document.getElementById('result-message').style.display = 'none';
        const winnerMessage = document.getElementById('winner-message');
        winnerMessage.textContent = `${winner.name} wins the game!`;
        document.getElementById('winner-modal').style.display = 'flex';
        nextRoundButton.style.display = 'none';  
    };

    return { updateBoard, updateRoundDisplay, updatePlayerScore, updateAIScore, showRoundResult, showGameWinner };
})();

document.getElementById('play-vs-ai').addEventListener('click', () => {
    document.getElementById('home-screen').style.display = 'none';
    document.getElementById('player-setup').style.display = 'grid';
});

document.getElementById('start-game').addEventListener('click', () => {
    const playerName = document.getElementById('player-name').value;
    const playerMarker = document.querySelector('input[name="marker"]:checked').value;
    GameController.initializeGame(playerName, playerMarker);
});
