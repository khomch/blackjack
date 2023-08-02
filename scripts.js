const TOTAL_NUM_OF_CARDS = 52;

// select elements
const firstPlayerCardsDiv = document.querySelector(".first-player_cards");
const firstPlayerCardsCounterDiv = document.querySelector(".first-player_counter");
const secondPlayerCardsDiv = document.querySelector(".second-player_cards");
const secondPlayerCardsCounterDiv = document.querySelector(".second-player_counter");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const playAgainModalButton = document.getElementById("play-again-modal");
const playAgainButton = document.getElementById("play-again");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal__text");
const totalScore = document.getElementById("total_score");

const state = {
  cardsBeenUsed : {},
  score: { dealer: 0, user: 0 },
}

class Player {
  constructor(name) {
    this.name = name;
    this.values = {
      aces: [],
      other: [],
    };
    this.counter = { count: 0 };
    this.cards = [];
  }

  updateCounter() {
    const scoreWithoutAces = this.values.other.reduce((acc, curr) => {
      let value;
      if (curr <= 8) {
        value = curr + 1;
      }
      if (curr > 8) {
        value = 10;
      }
      return acc + value;
    }, 0);

    const scoreOfAces = this.values.aces.reduce((acc, curr) => {
      let value;
      if (scoreWithoutAces + 11 > 21) {
        value = 1;
      } else {
        value = 11;
      }
      return acc + value;
    }, 0);

    this.counter.count = scoreWithoutAces + scoreOfAces;
  }

  getCount() {
    this.updateCounter();
    return this.counter.count;
  }

  addValue(card) {
    this.cards.push(card);
    card.value === 13 ? this.values.aces.push(card.value) : this.values.other.push(card.value);
  }

  getName() {
    return this.name;
  }

  startNewGame() {
    this.cards = [];
    this.values = {
      aces: [],
      other: [],
    };
    this.counter = { count: 0 };
  }
}

const user = new Player('user');
const dealer = new Player('dealer');

const transformValueToCard = (value) => {
  const tableOfValues = {
    1: "2",
    2: "3",
    3: "4",
    4: "5",
    5: "6",
    6: "7",
    7: "8",
    8: "9",
    9: "10",
    10: "J",
    11: "Q",
    12: "K",
    13: "A",
  }

  return tableOfValues[value];
}

const getRandomCard = () => {
  return Math.ceil(Math.random() * TOTAL_NUM_OF_CARDS);
}
const generateCard = () => {
  let randomCard = getRandomCard();
  let card = {};
  if (state.cardsBeenUsed[randomCard]) {
    while (state.cardsBeenUsed[randomCard]) {
      randomCard = getRandomCard();
      if (Object.keys(state.cardsBeenUsed).length === TOTAL_NUM_OF_CARDS) {
        return { suit: '', value: 'No more cards'};
      }
    }
  }
  state.cardsBeenUsed[randomCard] = true;
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

const updateCounter = (counterDiv, player) => {
  const count = player.getCount();
  counterDiv.innerText = `Score: ${count}`;
}

const renderCards = (card, player, target) => {
  const cardDiv = document.createElement("li");
  const cardContent = document.createTextNode(transformValueToCard(card.value));
  cardDiv.classList.add("card");
  if (player.getName() !== 'user'){
    if (player.cards.length === 1) {
      cardDiv.classList.add(card.suit);
      cardDiv.appendChild(cardContent);
    } else {
      cardDiv.classList.add("dealer");
    }
  } else {
    cardDiv.classList.add(card.suit);
    cardDiv.appendChild(cardContent);
  }
  target.append(cardDiv);
}

const giveCard = (target, player, counterDiv) => {
  const card = generateCard();
  player.addValue(card);
  renderCards(card,  player, target)
  updateCounter(counterDiv, player);
}

const handleAIMove = (firstPlayerCardsDiv, user, firstPlayerCardsCounterDiv) => {
  const possibility = Math.ceil(Math.random() * 100);
  if (user.counter.count < 12) {
    giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
  } else if (user.counter.count > 12 && user.counter.count < 18) {
    (possibility < 30) && giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
  } else {
    (possibility < 10) && giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
  }
}

const checkIfWinnerFound = (e, firstPlayer, secondPlayer) => {
  const firstPlayerCount = firstPlayer.getCount();
  const secondPlayerCount = secondPlayer.getCount();
  if (firstPlayerCount < 21 && secondPlayerCount < 21 && e.target.id !== 'stand') return null;
  if (firstPlayerCount > 21 && secondPlayerCount <= 21) return secondPlayer.getName();
  if (firstPlayerCount <= 21 && secondPlayerCount > 21) return firstPlayer.getName();
  if (firstPlayerCount === 21 && secondPlayerCount === 21) return 'even';
  if (firstPlayerCount === 21) return firstPlayer.getName();
  if (secondPlayerCount === 21) return secondPlayer.getName();
  if (e.target.id === 'stand') {
    if (firstPlayerCount <= 21 && secondPlayerCount <= 21) {
      if (firstPlayerCount > secondPlayerCount) {
        return firstPlayer.getName();
      } else if (firstPlayerCount < secondPlayerCount) {
        return secondPlayer.getName();
      } else {
        return 'even';
      }
    }
  }
  return 'no-winner';
}

const updateTotalScore = () => {
  totalScore.textContent = `DEALER: ${state.score.dealer}, USER: ${state.score.user}`;
}

const showPlayAgain = () => {
  hitButton.classList.add('button_hidden');
  standButton.classList.add('button_hidden');
  playAgainButton.classList.remove('button_hidden');
}

const showControls = () => {
  hitButton.classList.remove('button_hidden');
  standButton.classList.remove('button_hidden');
  playAgainButton.classList.add('button_hidden');
}

const isDeckLengthExceeded = () => {
  let text;
  if (Object.keys(state.cardsBeenUsed).length === TOTAL_NUM_OF_CARDS) {
    modalText.classList.add('no-one_wins');
    text = 'No more cards left in the deck. Please reload the page.';
    modalText.textContent = text;
    openModal(modal);
    return true;
  }
  return false;
}

const handleWin = (e, user, dealer) => {
  let winner = checkIfWinnerFound(e, user, dealer);
  let text;
  if(!isDeckLengthExceeded() && winner){
    showDealerCards();
    if (winner === 'dealer') {
      text = 'Dealer wins!';
      modalText.classList.add('dealer_wins');
      state.score.dealer++;
    } else if (winner === 'user') {
      text = 'You win!'
      modalText.classList.add('user_wins');
      state.score.user++;
    } else {
      text = 'No winner! Go again!'
      modalText.classList.add('no-one_wins');
    }
    updateTotalScore();
    modalText.textContent = text;
    showPlayAgain();
    firstPlayerCardsCounterDiv.classList.remove('counter_hidden');
    openModal(modal)
  }
}

const showDealerCards = () => {
  const dealerCards = document.querySelectorAll('.dealer');
  let i = 1;
  dealerCards.forEach(card  => {
    card.classList.remove('dealer');
    const cardContent = document.createTextNode(transformValueToCard(dealer.cards[i].value));
    card.appendChild(cardContent);
    card.classList.add(dealer.cards[i].suit);
    i++;
  })
}

const handleHitClick = (e) => {
  e.preventDefault();
  if (!isDeckLengthExceeded())
  {
    giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
    setTimeout(() => handleAIMove(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv), 500);
    setTimeout(() => handleWin(e, user, dealer), 1000);
  }
}

const handleStand = (e) => {
  e.preventDefault();
  handleWin(e, user, dealer);
}
const openModal = (modal) => {
  modal.classList.add('modal_opened');
}
const closeModal = (modal) => {
  modal.classList.remove('modal_opened');
}

const handleModalOverlayClick = (e) => {
  e.preventDefault();
  if (e.target === e.currentTarget) {
    closeModal(modal);
  }
}

const handlePlayAgainButtonClick = (e) => {
  e.preventDefault();
  user.startNewGame();
  dealer.startNewGame();
  firstPlayerCardsDiv.childNodes.forEach(node => {
    node.replaceWith('');
  })
  secondPlayerCardsDiv.childNodes.forEach(node => {
    node.replaceWith('');
  })
  if (!isDeckLengthExceeded()) {
    giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
    giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
  }
  modalText.classList.remove('dealer_wins', 'user_wins', 'no-one_wins');
  showControls();
  firstPlayerCardsCounterDiv.classList.add('counter_hidden');
  closeModal(modal);
}


// first move
handleAIMove(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
updateTotalScore();

// set handlers
hitButton.addEventListener('click', handleHitClick);
standButton.addEventListener('click', handleStand);
playAgainModalButton.addEventListener('click', handlePlayAgainButtonClick);
playAgainButton.addEventListener('click', handlePlayAgainButtonClick);
modal.addEventListener('click', handleModalOverlayClick);
