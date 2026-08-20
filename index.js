const gridContainer = document.querySelector(".grid-container");
const movesDisplay = document.querySelector(".moves");
const timerDisplay = document.querySelector(".timer");
const winMessage = document.querySelector(".win-message");

let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let totalPairs = 0;

let timerInterval = null;
let seconds = 0;
let timerStarted = false;

movesDisplay.textContent = moves;
timerDisplay.textContent = seconds;

fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
        totalPairs = data.length;
        cards = [...data, ...data];
        shuffleCards();
        generateCards();
    });

function shuffleCards() {
    let currentIndex = cards.length,
        randomIndex,
        temporaryValue;

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
        <img class="front-image" src=${card.image} />
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

  startTimer();

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
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  matchedPairs++;

  resetBoard();

  if (matchedPairs === totalPairs) {
    stopTimer();
    winMessage.textContent = `🎉 Congratulations! You won in ${moves} moves and ${seconds} seconds!`;
  }
}

function unflipCards() {
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

function restartGame() {
  gridContainer.innerHTML = "";
  cards = [];
  firstCard = null;
  secondCard = null;
  lockBoard = false;
  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  movesDisplay.textContent = moves;
  timerDisplay.textContent = seconds;
  winMessage.textContent = "";
  stopTimer();

  fetch("./data/cards.json")
    .then((res) => res.json())
    .then((data) => {
      totalPairs = data.length;
      cards = [...data, ...data];
      shuffleCards();
      generateCards();
    });
}
