const TOTAL_NUM_OF_CARDS = 52;

class Player {
  constructor() {
    this.cards = {}
  }
}

const computerCards = {
  aces: [],
  other: [],
};
const userCards = {
  aces: [],
  other: [],
};
const computerCardsDiv = document.querySelector(".computer-cards");
const computerCardsCounterDiv = document.querySelector(".computer-counter");
const cardsDiv = document.querySelector(".cards");
const cardsCounterDiv = document.querySelector(".cards-counter");
const hitButton = document.querySelector(".hit");
const standButton = document.querySelector(".stand");
const userCounter = {count: 0};
const computerCounter = {count: 0};
const cardsBeenUsed = {};


const getRandomCard = () => {
  return Math.ceil(Math.random() * TOTAL_NUM_OF_CARDS);
}
const generateCard = () => {
  let randomCard = getRandomCard();
  let card = {};
  if (cardsBeenUsed[randomCard]) {
    while (cardsBeenUsed[randomCard]) {
      randomCard = getRandomCard();
      if (Object.keys(cardsBeenUsed).length === TOTAL_NUM_OF_CARDS) {
        return { suit: '', value: 'No more cards'};
      }
    }
  }
  cardsBeenUsed[randomCard] = true;
  if (randomCard <= 13) {
    card = {
      suit: 'clubs',
      value: randomCard,
    };
  } else if (randomCard > 13 && randomCard <= 26) {
    card = {
      suit: 'diamonds',
      value: randomCard - 13,
    };
  } else if (randomCard > 26 && randomCard <= 39) {
    card = {
      suit: 'hearts',
      value: randomCard - 26,
    };
  } else {
    card = {
      suit: 'spades',
      value: randomCard - 39,
    };
  }
  return card;
}

const updateCounter = (counterDiv, arr, counter) => {
  const scoreWithoutAces = arr.other.reduce((acc, curr) => {
    let value;
    if (curr <= 8) {
      value = curr + 1;
    }
    if (curr > 8) {
      value = 10;
    }
    return acc + value;
  }, 0);

  const scoreOfAces = arr.aces.reduce((acc, curr) => {
    let value;
    if (scoreWithoutAces + 13 > 21) {
      value = 1;
    } else {
      value = 13;
    }
    return acc + value;
  }, 0);

  counter.count = scoreWithoutAces + scoreOfAces;
  counterDiv.innerText = `Score: ${counter.count}`;
}

const giveCard = (target, arr, counterDiv, counter) => {
  const card = generateCard();
  const cardDiv = document.createElement("div");
  const cardContent = document.createTextNode(card.suit + ' ' + card.value);
  card.value === 13 ? arr.aces.push(card.value) : arr.other.push(card.value);
  cardDiv.appendChild(cardContent);
  target.append(cardDiv);
  counter.count = 22;
  updateCounter(counterDiv, arr, counter);
}

const checkIfWinnerFound = (e) => {
  if (userCounter.count > 21 && computerCounter.count <= 21) return 'computer';
  if (userCounter.count <= 21 && computerCounter.count > 21) return 'user';
  if (userCounter.count === 21 && computerCounter.count === 21) return 'even';
  if (userCounter.count === 21) return 'user';
  if (computerCounter.count === 21) return 'computer';
  if (e.target.className === 'stand') {
    if (userCounter.count <= 21 && computerCounter.count <= 21) {
      if (userCounter.count > computerCounter.count) {
        return 'user';
      } else if (userCounter.count < computerCounter.count) {
        return 'computer';
      } else {
        return 'even';
      }
    }
  }
  return null;
}

const handleHitClick = (e) => {
  e.preventDefault();
  giveCard(cardsDiv, userCards, cardsCounterDiv, userCounter);
  giveCard(computerCardsDiv, computerCards, computerCardsCounterDiv, computerCounter);
  console.log(checkIfWinnerFound(e));
}

const handleStand = (e) => {
  e.preventDefault();
  console.log(checkIfWinnerFound(e));
}

giveCard(cardsDiv, userCards, cardsCounterDiv, userCounter);
giveCard(computerCardsDiv, computerCards, computerCardsCounterDiv, computerCounter);
hitButton.addEventListener('click', handleHitClick);
standButton.addEventListener('click', handleStand);
