const gridContainer = document.querySelector(".grid-container");
const movesDisplay = document.querySelector(".moves");
const timerDisplay = document.querySelector(".timer");
const scoreDisplay = document.querySelector(".score");
const winMessage = document.querySelector(".win-message");
const feedbackDisplay = document.querySelector(".feedback");

const PAIRS_PER_GAME = 14; // 14 cards uniques = 14 paires = 28 cartes (grille 7x4)
const POINTS_MATCH = 100;
const POINTS_MISS = 10;

let allCards = [];
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let score = 0;
let matchedPairs = 0;
let totalPairs = 0;

let timerInterval = null;
let seconds = 0;
let timerStarted = false;

updateDisplays();

fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
        allCards = data;
        startNewGame();
    });

function updateDisplays() {
    movesDisplay.textContent = moves;
    timerDisplay.textContent = seconds;
    scoreDisplay.textContent = score;
}

function startNewGame() {
    // pick random fruits for this game, then duplicate them to make pairs
    const selection = [...allCards].sort(() => Math.random() - 0.5).slice(0, PAIRS_PER_GAME);
    totalPairs = selection.length;
    cards = [...selection, ...selection];
    shuffleCards();
    generateCards();
}

function shuffleCards() {
    let currentIndex = cards.length, randomIndex, temporaryValue;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = cards[currentIndex];
        cards[currentIndex] = cards[randomIndex];
        cards[randomIndex] = temporaryValue;
    }
}

function generateCards() {
    for (let card of cards) {
        const cardElement = document.createElement("div");
        cardElement.classList.add("card");
        cardElement.setAttribute("data-name", card.name);
        cardElement.innerHTML = `
          <div class="front">
            <img class="front-image" src="${card.image}" alt="${card.name}" />
          </div>
          <div class="back"></div>
        `;
        gridContainer.appendChild(cardElement);
        cardElement.addEventListener("click", flipCard);
    }
}

function startTimer() {
    if (timerStarted) return;
    timerStarted = true;
    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = seconds;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerStarted = false;
}

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    startTimer(); // timer starts on the first move

    this.classList.add("flipped");

    if (!firstCard) {
        firstCard = this;
        return;
    }
    secondCard = this;

    moves++;
    movesDisplay.textContent = moves;
    lockBoard = true;

    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.dataset.name === secondCard.dataset.name;
    isMatch ? disableCards() : unflipCards();
}

function disableCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);

    matchedPairs++;
    score += POINTS_MATCH;
    scoreDisplay.textContent = score;

    resetBoard();

    if (matchedPairs === totalPairs) {
        endGame();
    }
}

function unflipCards() {
    score = Math.max(0, score - POINTS_MISS);
    scoreDisplay.textContent = score;

    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function getFeedback() {
    // partie parfaite = 14 coups
    if (moves <= totalPairs + 4) return "🏆 Excellent! Amazing memory!";
    if (moves <= totalPairs + 10) return "👏 Good job! You can do even better.";
    return "💪 Keep practicing, your memory will improve!";
}

function endGame() {
    stopTimer();
    winMessage.textContent = `🎉 Congratulations! You won in ${moves} moves and ${seconds} seconds! Final score: ${score}`;
    feedbackDisplay.textContent = getFeedback();
}

function restartGame() {
    stopTimer();
    gridContainer.innerHTML = "";
    cards = [];
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    score = 0;
    matchedPairs = 0;
    seconds = 0;
    winMessage.textContent = "";
    feedbackDisplay.textContent = "";
    updateDisplays();
    startNewGame();
}
