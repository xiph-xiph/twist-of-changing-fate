import CardStack from "./CardStack.js";
import Deck from "./Deck.js";
import Hand from "./Hand.js"
import ConditionWheel from "./ConditionWheel.js";

export default class GameManager {
    constructor() {
        this.boundPlayCallback = this.playCard.bind(this);
    }

    async initialize() {
        try {
            const response = await fetch("../../config/config.json");
            this.config = await response.json();
            this.setupGame();
        } catch (error) {
            console.error('Error loading JSON:', error);
        }
    }

    setupGame() {
        this.score = this.config.startingScore;
        this.hand = new Hand({ left: "50%", bottom: "10px" }, false, "center bottom", this);
        this.table = new CardStack({ left: "50%", bottom: "calc(100% - 340px - 10px)" }, false, "center top");
        this.deck = new Deck({ left: "20%", bottom: "calc(50% - 170px)" }, true, "center");
        this.wheel = new ConditionWheel(350, this, this.config);
        this.allCards = Array.from(this.deck.cards);
        this.updateScore();
    }

    shuffleHand() {
        this.hand.shuffle();
        this.hand.updateElements();
    }

    cycleDeck() {
        this.allCards.forEach(card => {
            card.cycleCardBack();
        });
    }

    updateScore(deltaScore = 0) {
        this.score += deltaScore;
        document.getElementById("scoreText").innerText = "Score: " + this.score;
    }

    sortHand(sortBySuit, acesAreHigh) {
        if (sortBySuit) {
            this.hand.sortBySuit(acesAreHigh);
        } else {
            this.hand.sortByRank(acesAreHigh);
        }
        this.hand.updateElements();
    }

    drawCard(destination = this.hand, free = false) {
        this.deck.transferClickHandler();
        destination.addCards(this.deck.drawCards(1));
        destination.updateElements();
        this.deck.createElements()
        this.hand.updateCallbacks(this.boundPlayCallback);
        if (!free) {
            this.updateScore(this.config.drawCost);
        }
    }

    playCard() {
        if (this.hand.selectedCard) {
            if (this.wheel.canPlayCard(this.hand.selectedCard, this.table)) {
                console.log("Playing " + this.hand.selectedCard.name);
                this.table.addCards(this.hand.detachCard(this.hand.selectedCard));
                this.table.updateElements();
                this.wheel.playsUntilForcedSpin--;
                if (this.wheel.playsUntilForcedSpin == 0) {
                    this.wheel.spinWheel(true);
                }
                if (!this.wheel.playsUntilFreeSpin == 0) {
                    this.wheel.playsUntilFreeSpin--;
                }
                this.wheel.updateElements();
            } else {
                console.log(this.hand.selectedCard.name + " can not be played");
                return;
            }
        } else {
            console.log("No card selected");
        }
        this.hand.updateCallbacks(this.boundPlayCallback);
        this.checkForWin();
    }

    checkForWin() {
        if (this.hand.size === 0) {
            this.showWinScreen()
        }
    }

    showWinScreen() {
        setTimeout(() => {
            alert("YOU WIN!!!!!!!!!!");
            alert("Your score was: " + this.score);
            alert("Thanks for playing my game! Click the link on the bottom right to submit feedback.");
            alert("Click OK to start over");
            this.restartGame();
        }, 600);
    }

    restartGame() {
        this.allCards.forEach((card) => {
            if (card.element) {
                card.element.remove();
            }
        });
        this.setupGame();
        this.startGame();
    }

    startGame() {
        this.deck.createElements();
        this.distributeCards();
        setTimeout(() => { this.sortHand() }, 2400);
        setTimeout(() => { this.enableControls() }, 2400);
    }

    showHelp() {
        alert(`Welcome to Twist of Changing Fate! The goal is to play all the cards in your hand (on the bottom) onto the table (on the top).`);
        alert(`You can play a card if it matches the condition decided by the Turntable of Fate. (on the right)`);
        alert(`If you can't play a card, you can draw a card from the deck (on the left) by clicking it, or you can spin the Turntable of Fate, to be able to play other cards.`);
        alert(`You can see your score on the bottom left.`)
        alert(`It costs you 5 points to draw a card, and 15 points to spin the Turntable of Fate.`);
        alert(`If you play enough cards on the current rule, you will get a free spin!`);
        alert(`Sometimes, you will be forced to spin the Turntable of Fate after a certain number of plays.`);
        alert(`You can also sort your hand by rank or suit, or shuffle it to get a fresh look.`)
        alert(`Good luck!`);
    }

    // Draws 7 cards from deck to hand, and then one card from deck to table
    distributeCards() {
        for (let i = 0; i < 7; i++) {
            setTimeout(() => {
                this.drawCard(this.hand, true);
            }, i * 300);
        }
        setTimeout(() => { this.drawCard(this.table, true); }, 2100);
    }

    enableControls() {
        this.deck.assignClickHandler(this.drawCard.bind(this, this.hand, false));
        this.hand.updateCallbacks(this.boundPlayCallback);
    }
}