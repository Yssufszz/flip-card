// Game configuration
const config = {
    easy: { rows: 3, cols: 4 },
    medium: { rows: 4, cols: 4 },
    hard: { rows: 4, cols: 5 }
};

// Game state
let cards = [];
let firstCard = null;
let secondCard = null;
let lockBoard = false;
let gameRunning = false;
let timer = null;
let startTime = null;
let difficulty = 'easy';
let score = 0;
let moves = 0;
let matchedPairs = 0;

// DOM Elements
const gameBoard = document.getElementById('game-board');
const startBtn = document.getElementById('start');
const stopBtn = document.getElementById('stop');
const restartBtn = document.getElementById('restart');
const playAgainBtn = document.getElementById('play-again');
const timeElement = document.getElementById('time');
const movesElement = document.getElementById('moves-count');
const scoreElement = document.getElementById('score');
const resultScreen = document.getElementById('result-screen');
const overlay = document.getElementById('overlay');
const resultTimeElement = document.getElementById('result-time');
const resultMovesElement = document.getElementById('result-moves');
const resultScoreElement = document.getElementById('result-score');
const difficultyBtns = document.querySelectorAll('.difficulty-btn');

// Card icons for matching
const icons = [
    'fa-heart',
    'fa-star',
    'fa-snowflake',
    'fa-bolt',
    'fa-sun',
    'fa-moon',
    'fa-cloud',
    'fa-fire',
    'fa-rocket',
    'fa-leaf',
    'fa-crown',
    'fa-ghost',
    'fa-bell',
    'fa-bomb',
    'fa-cube',
    'fa-key',
    'fa-gift',
    'fa-camera',
    'fa-music',
    'fa-car'
];

// Initialize game
function initGame() {
    resetGame();
    createCards();
    attachEventListeners();
}

// Create cards based on difficulty
function createCards() {
    gameBoard.innerHTML = '';
    cards = [];
    
    const { rows, cols } = config[difficulty];
    const totalCards = rows * cols;
    const totalPairs = totalCards / 2;
    
    // Set grid layout based on difficulty
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    // Select icons for this game
    const gameIcons = [];
    for (let i = 0; i < totalPairs; i++) {
        gameIcons.push(icons[i]);
    }
    
    const cardValues = [...gameIcons, ...gameIcons];
    
    // Shuffle cards
    const shuffledCards = cardValues.sort(() => Math.random() - 0.5);
    
    // Create DOM elements for cards
    shuffledCards.forEach((icon, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = icon;
        card.dataset.index = index;
        
        const front = document.createElement('div');
        front.classList.add('front');
        
        const iconElement = document.createElement('i');
        iconElement.classList.add('fas', icon, 'icon');
        front.appendChild(iconElement);
        
        const back = document.createElement('div');
        back.classList.add('back');
        
        card.appendChild(front);
        card.appendChild(back);
        
        card.addEventListener('click', flipCard);
        
        gameBoard.appendChild(card);
        cards.push(card);
    });
    
    // Briefly show cards at start
    showAllCards();
}

// Show all cards briefly
function showAllCards() {
    cards.forEach(card => card.classList.add('flipped'));
    
    setTimeout(() => {
        cards.forEach(card => {
            if (!card.classList.contains('matched')) {
                card.classList.remove('flipped');
            }
        });
        lockBoard = false;
    }, 5000); // Menampilkan kartu selama 5 detik
}

// Reset game state
function resetGame() {
    firstCard = null;
    secondCard = null;
    lockBoard = true;
    score = 0;
    moves = 0;
    matchedPairs = 0;
    updateStats();
    
    // Reset timer display
    timeElement.textContent = '00:00';
    
    // Hide result screen
    resultScreen.classList.remove('show');
    overlay.classList.remove('show');
}

// Handle card flipping
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;
    if (this.classList.contains('matched')) return;
    
    this.classList.add('flipped');
    
    if (!firstCard) {
        firstCard = this;
        return;
    }
    
    secondCard = this;
    moves++;
    updateStats();
    checkForMatch();
}

// Check if flipped cards match
function checkForMatch() {
    let isMatch = firstCard.dataset.value === secondCard.dataset.value;
    
    if (isMatch) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

// Handle matching cards
function handleMatch() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    
    // Pastikan kartu tetap terbuka
    firstCard.classList.add('flipped');
    secondCard.classList.add('flipped');
    
    matchedPairs++;
    score += 10;
    updateStats();
    
    // Add score animation
    const scoreAnimation = document.createElement('div');
    scoreAnimation.classList.add('score-animation');
    scoreAnimation.textContent = '+10';
    scoreAnimation.style.position = 'absolute';
    scoreAnimation.style.left = `${firstCard.getBoundingClientRect().left + firstCard.offsetWidth / 2}px`;
    scoreAnimation.style.top = `${firstCard.getBoundingClientRect().top}px`;
    scoreAnimation.style.color = 'var(--success)';
    scoreAnimation.style.fontSize = '1.5rem';
    scoreAnimation.style.fontWeight = 'bold';
    scoreAnimation.style.pointerEvents = 'none';
    scoreAnimation.style.animation = 'scoreFloat 1s ease-out forwards';
    document.body.appendChild(scoreAnimation);
    
    setTimeout(() => {
        document.body.removeChild(scoreAnimation);
    }, 1000);
    
    resetBoard();
    
    // Check if game is complete
    const { rows, cols } = config[difficulty];
    const totalPairs = (rows * cols) / 2;
    
    if (matchedPairs === totalPairs) {
        gameComplete();
    }
}

// Handle mismatched cards
function handleMismatch() {
    lockBoard = true;
    
    firstCard.classList.add('wrong');
    secondCard.classList.add('wrong');
    
    setTimeout(() => {
        firstCard.classList.remove('flipped', 'wrong');
        secondCard.classList.remove('flipped', 'wrong');
        resetBoard();
    }, 1000);
}

// Reset board for next selection
function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

// Start game timer
function startTimer() {
    startTime = new Date();
    
    timer = setInterval(() => {
        const currentTime = new Date();
        const elapsedTime = Math.floor((currentTime - startTime) / 1000);
        
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');
        
        timeElement.textContent = `${minutes}:${seconds}`;
    }, 1000);
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
    timer = null;
}

// Update game statistics
function updateStats() {
    movesElement.textContent = moves;
    scoreElement.textContent = score;
}

// Game complete
function gameComplete() {
    stopTimer();
    gameRunning = false;
    
    // Calculate bonus based on time and moves
    const timeTaken = Math.floor((new Date() - startTime) / 1000);
    const { rows, cols } = config[difficulty];
    const totalCards = rows * cols;
    
    let timeBonus = 0;
    let movesBonus = 0;
    
    // Time bonus: faster completion = more points
    const expectedTime = totalCards * 5; // 5 seconds per card expected
    if (timeTaken < expectedTime) {
        timeBonus = Math.floor((expectedTime - timeTaken) * 2);
    }
    
    // Moves bonus: fewer moves = more points
    const expectedMoves = totalCards * 0.8;
    if (moves < expectedMoves) {
        movesBonus = Math.floor((expectedMoves - moves) * 5);
    }
    
    // Update final score
    score += timeBonus + movesBonus;
    scoreElement.textContent = score;
    
    // Show result screen
    resultTimeElement.textContent = timeElement.textContent;
    resultMovesElement.textContent = moves;
    resultScoreElement.textContent = score;
    
    setTimeout(() => {
        resultScreen.classList.add('show');
        overlay.classList.add('show');
    }, 1000);
}

// Start the game
function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    resetGame();
    createCards();
    
    // Tambahkan pesan untuk pengguna
    const messageElement = document.createElement('div');
    messageElement.textContent = 'Hafalkan posisi kartu! (5 detik)';
    messageElement.style.position = 'fixed';
    messageElement.style.top = '50%';
    messageElement.style.left = '50%';
    messageElement.style.transform = 'translate(-50%, -50%)';
    messageElement.style.background = 'rgba(0,0,0,0.8)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '15px 30px';
    messageElement.style.borderRadius = '10px';
    messageElement.style.fontSize = '1.5rem'; 
    messageElement.style.zIndex = '999';
    messageElement.style.fontWeight = 'bold';
    document.body.appendChild(messageElement);
    
    setTimeout(() => {
        document.body.removeChild(messageElement);
        startTimer();
    }, 5000);
}

// Stop the game
function stopGame() {
    if (!gameRunning) return;
    
    gameRunning = false;
    stopTimer();
    
    // Confirm before stopping
    if (confirm('Apakah Anda yakin ingin menghentikan permainan?')) {
        resetGame();
    } else {
        gameRunning = true;
        startTimer();
    }
}

// Restart the game
function restartGame() {
    stopTimer();
    resetGame();
    createCards();
    
    if (gameRunning) {
        startTimer();
    }
}

// Change difficulty
function changeDifficulty(e) {
    const newDifficulty = e.target.dataset.difficulty;
    if (newDifficulty === difficulty) return;
    
    // Update active button
    difficultyBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Set new difficulty
    difficulty = newDifficulty;
    
    // Reset and create new board
    resetGame();
    createCards();
}

// Attach event listeners
function attachEventListeners() {
    startBtn.addEventListener('click', startGame);
    stopBtn.addEventListener('click', stopGame);
    restartBtn.addEventListener('click', restartGame);
    playAgainBtn.addEventListener('click', () => {
        resultScreen.classList.remove('show');
        overlay.classList.remove('show');
        startGame();
    });
    
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', changeDifficulty);
    });
}

// Add score animation
const styleSheet = document.styleSheet || (function() {
    const style = document.createElement('style');
    document.head.appendChild(style);
    return style.sheet;
})();

// Add keyframe animation
const keyframesRule = `
@keyframes scoreFloat {
    0% {
        transform: translateY(0);
        opacity: 1;
    }
    100% {
        transform: translateY(-50px);
        opacity: 0;
    }
}`;

// Append keyframes to document if not already added
if (!document.getElementById('game-animations')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'game-animations';
    styleEl.textContent = keyframesRule;
    document.head.appendChild(styleEl);
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);

// Prevent context menu on game board
gameBoard.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
});