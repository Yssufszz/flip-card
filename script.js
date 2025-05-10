let cards = [];
let flippedCards = [];
let matchedCards = [];
let gameActive = false;
let timer;
let seconds = 0;
let minutes = 0;
let moves = 0;
let score = 0;
let difficulty = 'easy';
let gridSizes = {
    'easy': { rows: 3, cols: 4 },
    'medium': { rows: 4, cols: 4 },
    'hard': { rows: 4, cols: 5 }
};

const cardIcons = [
    'fas fa-heart',
    'fas fa-star',
    'fas fa-smile',
    'fas fa-bolt',
    'fas fa-bell',
    'fas fa-moon',
    'fas fa-sun',
    'fas fa-leaf',
    'fas fa-apple-alt',
    'fas fa-lemon',
    'fas fa-car',
    'fas fa-plane',
    'fas fa-rocket',
    'fas fa-football-ball',
    'fas fa-basketball-ball',
    'fas fa-baseball-ball',
    'fas fa-volleyball-ball',
    'fas fa-compass',
    'fas fa-dice',
    'fas fa-chess-knight'
];

const gameBoard = document.getElementById('game-board');
const movesCount = document.getElementById('moves-count');
const timeValue = document.getElementById('time');
const scoreValue = document.getElementById('score');
const startButton = document.getElementById('start');
const stopButton = document.getElementById('stop');
const restartButton = document.getElementById('restart');
const resultScreen = document.getElementById('result-screen');
const resultTime = document.getElementById('result-time');
const resultMoves = document.getElementById('result-moves');
const resultScore = document.getElementById('result-score');
const playAgainButton = document.getElementById('play-again');
const overlay = document.getElementById('overlay');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

function initializeGame() {
    const { rows, cols } = gridSizes[difficulty];
    const totalCards = rows * cols;
    const pairsNeeded = totalCards / 2;
    
    const shuffledIcons = [...cardIcons]
        .sort(() => Math.random() - 0.5)
        .slice(0, pairsNeeded);
    
    const cardPairs = [...shuffledIcons, ...shuffledIcons];
    
    cards = cardPairs
        .sort(() => Math.random() - 0.5)
        .map((icon, index) => ({ id: index, icon, matched: false }));
    
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    
    gameBoard.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.id = card.id;
        
        cardElement.innerHTML = `
            <div class="front">
                <i class="${card.icon} icon"></i>
            </div>
            <div class="back"></div>
        `;
        
        cardElement.addEventListener('click', () => flipCard(cardElement, card));
        
        gameBoard.appendChild(cardElement);
    });
}

function flipCard(cardElement, card) {
    if (!gameActive || card.matched || flippedCards.length === 2 || cardElement.classList.contains('flipped')) {
        return;
    }
    
    cardElement.classList.add('flipped');
    flippedCards.push({ element: cardElement, card });
    
    if (flippedCards.length === 2) {
        moves++;
        movesCount.textContent = moves;
        checkForMatch();
    }
}

function checkForMatch() {
    const [first, second] = flippedCards;
    
    if (first.card.icon === second.card.icon) {
        first.element.classList.add('matched');
        second.element.classList.add('matched');
        first.card.matched = true;
        second.card.matched = true;
        matchedCards.push(first, second);
        
        score += 10;
        scoreValue.textContent = score;
        
        flippedCards = [];
        
        if (matchedCards.length === cards.length) {
            const timeBonus = Math.max(0, 300 - (minutes * 60 + seconds));
            const movesBonus = Math.max(0, 100 - moves);
            const totalBonus = timeBonus + movesBonus;
            score += totalBonus;
            scoreValue.textContent = score;
            
            setTimeout(() => {
                endGame();
            }, 1000);
        }
    } else {
        setTimeout(() => {
            first.element.classList.remove('flipped');
            second.element.classList.remove('flipped');
            first.element.classList.add('wrong');
            second.element.classList.add('wrong');
            
            setTimeout(() => {
                first.element.classList.remove('wrong');
                second.element.classList.remove('wrong');
                flippedCards = [];
            }, 500);
        }, 1000);
    }
}

function startGame() {
    gameActive = false;
    flippedCards = [];
    matchedCards = [];
    moves = 0;
    seconds = 0;
    minutes = 0;
    score = 0;
    
    movesCount.textContent = moves;
    timeValue.textContent = '00:00';
    scoreValue.textContent = score;
    
    initializeGame();
    
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => card.classList.add('flipped'));
    
    let countDown = 5;
    const previewTimer = setInterval(() => {
        countDown--;
        timeValue.textContent = `00:0${countDown}`;
        
        if (countDown <= 0) {
            clearInterval(previewTimer);
            
            // Balik kembali semua kartu
            allCards.forEach(card => card.classList.remove('flipped'));
            
            // Mulai timer permainan
            startTimer();
            
            // Aktifkan permainan
            gameActive = true;
            
            // Reset tampilan waktu
            timeValue.textContent = '00:00';
        }
    }, 1000);
    
    // Nonaktifkan tombol mulai dan aktifkan tombol berhenti
    startButton.disabled = true;
    stopButton.disabled = false;
}

// Hentikan permainan
function stopGame() {
    gameActive = false;
    clearInterval(timer);
    
    // Aktifkan tombol mulai dan nonaktifkan tombol berhenti
    startButton.disabled = false;
    stopButton.disabled = true;
}

// Mulai timer
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
        
        // Format waktu
        const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timeValue.textContent = formattedTime;
    }, 1000);
}

// Akhiri permainan
function endGame() {
    gameActive = false;
    clearInterval(timer);
    
    // Tampilkan layar hasil
    resultTime.textContent = timeValue.textContent;
    resultMoves.textContent = moves;
    resultScore.textContent = score;
    
    resultScreen.classList.add('show');
    overlay.classList.add('show');
    
    // Aktifkan tombol mulai dan nonaktifkan tombol berhenti
    startButton.disabled = false;
    stopButton.disabled = true;
}

// Ganti tingkat kesulitan
function changeDifficulty(newDifficulty) {
    difficulty = newDifficulty;
    
    // Update tombol yang aktif
    difficultyButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.difficulty === newDifficulty) {
            button.classList.add('active');
        }
    });
    
    // Jika sedang bermain, mulai ulang game
    if (gameActive) {
        restartGame();
    } else {
        initializeGame();
    }
}

// Restart permainan
function restartGame() {
    stopGame();
    startGame();
}

// Event Listeners
startButton.addEventListener('click', startGame);
stopButton.addEventListener('click', stopGame);
restartButton.addEventListener('click', restartGame);
playAgainButton.addEventListener('click', () => {
    resultScreen.classList.remove('show');
    overlay.classList.remove('show');
    restartGame();
});

// Event listeners untuk tombol tingkat kesulitan
difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
        changeDifficulty(button.dataset.difficulty);
    });
});

// Inisialisasi game saat halaman dimuat
window.onload = () => {
    initializeGame();
    stopButton.disabled = true;
};