const TOTAL_NUM_OF_CARDS = 52;

const firstPlayerCardsDiv = document.querySelector(".first-player_cards");
const firstPlayerCardsCounterDiv = document.querySelector(".first-player_counter");
const secondPlayerCardsDiv = document.querySelector(".second-player_cards");
const secondPlayerCardsCounterDiv = document.querySelector(".second-player_counter");
const hitButton = document.getElementById("hit");
const standButton = document.getElementById("stand");
const playAgainButton = document.getElementById("play-again");
const modal = document.getElementById("modal");
const modalText = document.getElementById("modal__text");
const totalScore = document.getElementById("total_score");
const cardsBeenUsed = {};
const score = { dealer: 0, user: 0 };

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

const checkIfWinnerFound = (e, firstPlayer, secondPlayer) => {
  if (firstPlayer.getCount() < 21 && secondPlayer.getCount() < 21 && e.target.id !== 'stand') return null;
  if (firstPlayer.getCount() > 21 && secondPlayer.getCount() <= 21) return secondPlayer.getName();
  if (firstPlayer.getCount() <= 21 && secondPlayer.getCount() > 21) return firstPlayer.getName();
  if (firstPlayer.getCount() === 21 && secondPlayer.getCount() === 21) return 'even';
  if (firstPlayer.getCount() === 21) return firstPlayer.getName();
  if (secondPlayer.getCount() === 21) return secondPlayer.getName();
  if (e.target.id === 'stand') {
    if (firstPlayer.getCount() <= 21 && secondPlayer.getCount() <= 21) {
      if (firstPlayer.getCount() > secondPlayer.getCount()) {
        return firstPlayer.getName();
      } else if (firstPlayer.getCount() < secondPlayer.getCount()) {
        return secondPlayer.getName();
      } else {
        return 'even';
      }
    }
  }
  return 'no-winner';
}

const updateTotalScore = () => {
  totalScore.textContent = `DEALER: ${score.dealer}, USER: ${score.user}`;
}

const handleWin = (e, user, dealer) => {
  let winner = checkIfWinnerFound(e, user, dealer);
  let text;
  if (Object.keys(cardsBeenUsed).length === TOTAL_NUM_OF_CARDS) {
    modalText.classList.add('no-one_wins');
    text = 'No more cards left. Please reload the page.';
    modalText.textContent = text;
    openModal(modal);
  } else if(winner){
    showDealerCards();
    if (winner === 'dealer') {
      text = 'Dealer wins!';
      modalText.classList.add('dealer_wins');
      score.dealer++;
    } else if (winner === 'user') {
      text = 'You win!'
      modalText.classList.add('user_wins');
      score.user++;
    } else {
      text = 'No winner! Go again!'
      modalText.classList.add('no-one_wins');
    }
    updateTotalScore();
    modalText.textContent = text;
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
  giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
  setTimeout(() => giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv), 500);
  setTimeout(() => handleWin(e, user, dealer), 1000);
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
    handlePlayAgainButtonClick(e);
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
  giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
  giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
  modalText.classList.remove('dealer_wins', 'user_wins', 'no-one_wins');
  closeModal(modal);
}

giveCard(firstPlayerCardsDiv, dealer, firstPlayerCardsCounterDiv);
giveCard(secondPlayerCardsDiv, user, secondPlayerCardsCounterDiv);
updateTotalScore();

hitButton.addEventListener('click', handleHitClick);
standButton.addEventListener('click', handleStand);
playAgainButton.addEventListener('click', handlePlayAgainButtonClick);
modal.addEventListener('click', handleModalOverlayClick);
