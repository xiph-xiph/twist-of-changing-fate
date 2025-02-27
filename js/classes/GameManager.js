import CardStack from "./CardStack.js";
import Deck from "./Deck.js";
import Hand from "./Hand.js"
import ConditionWheel from "./ConditionWheel.js";

export default class GameManager {
    constructor() {
        this.boundPlayCallback = this.playCard.bind(this);
        this.gameContainer = document.querySelector('.game-container');
        this.feedbackLink = document.getElementById("feedbackLink");
        this.handControlsContainer = document.getElementById("handControlsContainer");
        this.checkboxContainer = document.getElementById("checkboxContainer");
    }

    async initialize() {
        // getting the config file
        try {
            // github pages path
            const response = await fetch("/twist-of-changing-fate/config/config.json");
            if (!response.ok) throw new Error('github path failed');
            this.config = await response.json();
        } catch (error) {
            console.warn(error);
            try {
                // local path
                const response = await fetch("../../config/config.json");
                if (!response.ok) throw new Error('local path failed');
                this.config = await response.json();
            } catch (error) {
                console.error('Error loading JSON:', error);
            }
        }

        this.setupGame();
    }

    setupGame() {
        const resetButton = document.getElementById("resetButton");
        resetButton.classList.add("button-unclickable");
        this.canReset = false;
        console.log(this.landscape);
        const handPosition = this.landscape ? this.config.landscape.handPosition : this.config.portrait.handPosition;
        const deckPosition = this.landscape ? this.config.landscape.deckPosition : this.config.portrait.deckPosition;
        const tablePosition = this.landscape ? this.config.landscape.tablePosition : this.config.portrait.tablePosition;
        this.score = this.config.startingScore;
        this.hand = new Hand(handPosition, false, "center bottom", this);
        this.table = new CardStack(tablePosition, false, "center top");
        this.deck = new Deck(deckPosition, true, "center top", this);
        this.wheel = new ConditionWheel(this, this.config);
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
        this.checkForLoss();
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
        if (this.score < 5) {
            alert("It costs 5 points to draw a card! You don't have enough left!");
            return;
        }
        if (destination === this.hand && this.hand.size >= this.config.maxHandSize) {
            alert(`You can't have more than ${this.config.maxHandSize} cards in your hand!`);
            return;
        }
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
                if (this.wheel.currentCondition.scoreForPlaying) {
                    this.updateScore(this.wheel.currentCondition.scoreForPlaying);
                }
                this.table.addCards(this.hand.detachCard(this.hand.selectedCard));
                this.table.updateElements();
                this.wheel.playsUntilForcedSpin--;
                if (this.wheel.playsUntilForcedSpin == 0) {
                    this.tryToSpinWheel(true);
                }
                if (!this.wheel.playsUntilFreeSpin == 0) {
                    this.wheel.playsUntilFreeSpin--;
                }
                this.wheel.updateElements();
            } else {
                return;
            }
        }
        this.hand.updateCallbacks(this.boundPlayCallback);
        if (!this.checkForWin()) {
            this.checkForLoss();
        }
    }

    tryToSpinWheel(forceFree = false) {
        let free = this.wheel.playsUntilFreeSpin === 0 || forceFree;
        if (this.score < 15 && !free) {
            alert("It costs 15 points to spin the wheel! You don't have enough left!");
            return;
        }
        if (!free) {
            this.updateScore(this.config.spinCost);
        }
        this.wheel.spinWheel(false);
        this.wheel.respinWheel(false);
        this.wheel.updateElements()
    }

    checkForWin() {
        if (this.hand.size === 0) {
            this.showWinScreen()
            return true;
        }
        return false;
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
                card.deletePlayButton();
            }
        });
        this.wheel.currentCondition = null;
        this.wheel.updateElements();
        this.setupGame();
        this.startGame();
    }

    checkForLoss() {
        if (this.score < 5 && !this.wheel.anyCardIsPlayableInStack(this.hand) && !(this.wheel.playsUntilForcedSpin === 0 || this.wheel.playsUntilFreeSpin === 0)) {
            console.log(this.score);
            console.log(this.wheel.anyCardIsPlayableInStack(this.hand));
            console.log(this.wheel.playsUntilForcedSpin);
            console.log(this.wheel.playsUntilFreeSpin);
            setTimeout(() => {
                alert("You have no playable cards left! You lose! Click OK to start over.");
                this.restartGame();
            }, 800);
        }
    }

    startGame() {
        this.deck.createElements();
        this.distributeCards();
        setTimeout(() => { this.sortHand() }, this.config.initialHandSize * 300 + 300);
        setTimeout(() => { this.enableControls() }, this.config.initialHandSize * 300 + 300);
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
        for (let i = 0; i < this.config.initialHandSize; i++) {
            setTimeout(() => {
                this.drawCard(this.hand, true);
            }, i * 300);
        }
        setTimeout(() => {
            this.drawCard(this.table, true);
            this.wheel.respinWheel(true);
            this.wheel.updateElements();
        }, this.config.initialHandSize * 300);
    }

    enableControls() {
        const resetButton = document.getElementById("resetButton");

        this.deck.assignClickHandler(this.drawCard.bind(this, this.hand, false));
        this.hand.updateCallbacks(this.boundPlayCallback);
        this.canReset = true;
        resetButton.classList.remove("button-unclickable");
    }

    updateLayout() {
        if (window.innerWidth < window.innerHeight) {
            // portrait layout
            this.landscape = false;
            this.gameContainer.style.zoom = window.innerHeight / 1080;
            this.deck?.updateElements(this.config.portrait.deckPosition);
            this.table?.updateElements(this.config.portrait.tablePosition);
            this.feedbackLink.style.bottom = "64%";
            this.feedbackLink.style.right = "16%";
            this.handControlsContainer.style.bottom = "17%";
            this.handControlsContainer.style.left = "43%";
            this.gameContainer.appendChild(this.checkboxContainer);
            this.checkboxContainer.style.position = "absolute";
            this.checkboxContainer.style.transformOrigin = "left center";
            this.checkboxContainer.style.transform = "translateX(50%)";
            this.checkboxContainer.style.right = "15%";
            this.checkboxContainer.style.bottom = "26%";
        } else {
            // landscape layout
            this.landscape = true;
            this.gameContainer.style.zoom = window.innerWidth / 1920;
            this.deck?.updateElements(this.config.landscape.deckPosition);
            this.table?.updateElements(this.config.landscape.tablePosition);
            this.feedbackLink.style.bottom = "";
            this.feedbackLink.style.right = "";
            this.handControlsContainer.style.bottom = "";
            this.handControlsContainer.style.left = "";
            this.handControlsContainer.appendChild(this.checkboxContainer);
            this.checkboxContainer.style.position = "";
            this.checkboxContainer.style.transformOrigin = "";
            this.checkboxContainer.style.transform = "";
            this.checkboxContainer.style.right = "";
            this.checkboxContainer.style.bottom = "";

        }
        if (this.hand) {
            this.hand.updateElements();
        }
        let hasTouchScreen = false;
        if ("maxTouchPoints" in navigator) {
            hasTouchScreen = navigator.maxTouchPoints > 0;
        }
        if (hasTouchScreen && landscape) {
            document.body.style.transform = "translateY(20%)";
            document.body.style.overflowY = "scroll";
            window.scrollTo(0, document.body.scrollHeight);
        }
        if (this.wheel) {
            this.wheel.updateElements();
        }

    }
}