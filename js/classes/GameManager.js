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
        this.currentComboBonus = 0;
        this.buttons = {
            resetButton: document.getElementById("resetButton"),
            spinButton: document.getElementById("spinButton"),
            helpButton: document.getElementById("helpButton"),
            cycleDeckButton: document.getElementById("cycleDeckButton"),
            shuffleButton: document.getElementById("shuffleButton"),
            sortButton: document.getElementById("sortButton")
        };
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
        this.lockControls();
        const handPosition = this.landscape ? this.config.landscape.handPosition : this.config.portrait.handPosition;
        const deckPosition = this.landscape ? this.config.landscape.deckPosition : this.config.portrait.deckPosition;
        const tablePosition = this.landscape ? this.config.landscape.tablePosition : this.config.portrait.tablePosition;
        this.score = this.config.startingScore;
        this.hand = new Hand(handPosition, false, "center bottom", this);
        this.table = new CardStack(tablePosition, false, "center top");
        this.deck = new Deck(deckPosition, true, "center top", this);
        this.wheel = new ConditionWheel(this, this.config);
        this.wheel.drawArcs();
        this.wheel.drawCircle();
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
        if (this.score < -this.config.drawCost && !free) {
            this.showMessage(`It costs ${-this.config.drawCost} points to draw a card! You don't have enough left!`);
            return;
        }
        if (destination === this.hand && this.hand.size >= this.config.maxHandSize) {
            this.showMessage(`You can't have more than ${this.config.maxHandSize} cards in your hand!`);
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
                    this.updateScore(this.wheel.currentCondition.scoreForPlaying + this.currentComboBonus);
                    this.currentComboBonus += this.wheel.currentCondition.comboScore;
                }
                this.table.addCards(this.hand.detachCard(this.hand.selectedCard));
                this.table.updateElements();
                this.wheel.playsUntilForcedSpin--;
                if (this.wheel.playsUntilForcedSpin == 0) {
                    this.wheel.respinWheel(false);
                }
                if (!this.wheel.playsUntilFreeSpin == 0) {
                    this.wheel.playsUntilFreeSpin--;
                }
            } else {
                return;
            }
        }
        this.wheel.updateTextElements();
        this.hand.updateCallbacks(this.boundPlayCallback);
        if (!this.checkForWin()) {
            this.checkForLoss();
        }
    }

    tryToSpinWheel(forceFree = false) {
        let free = this.wheel.playsUntilFreeSpin === 0 || forceFree;
        if (this.score < -this.config.spinCost && !free) {
            this.showMessage(`It costs ${-this.config.spinCost} points to spin the wheel! You don't have enough left!`);
            return;
        }
        if (!free) {
            this.updateScore(this.config.spinCost);
        }
        this.wheel.respinWheel(false);
        this.currentComboBonus = 0;
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
            this.showMessage(`YOU WIN!!!!!!!!!!
            Your score was: ${this.score}
            Thanks for playing my game! Click the link on the bottom right to submit feedback.
            Click OK to start over`, false, this.restartGame.bind(this));
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
        this.wheel.updateTextElements();
        this.setupGame();
        this.startGame();
    }

    checkForLoss() {
        if ((this.score < this.config.drawCost && this.hand.size == this.config.maxHandSize) && !this.wheel.anyCardIsPlayableInStack(this.hand) && !(this.wheel.playsUntilForcedSpin === 0 || this.wheel.playsUntilFreeSpin === 0)) {
            setTimeout(() => {
                this.showMessage("You have no playable cards left! You lose! Click OK to start over.", this.restartGame);
            }, 800);
        }
    }

    startGame() {
        this.deck.createElements();
        this.distributeCards();
        setTimeout(() => { this.sortHand() }, this.config.initialHandSize * 300 + 300);
        setTimeout(() => { this.unlockControls() }, this.config.initialHandSize * 300 + 300);

    }

    showHelp() {
        this.showMessage(`Welcome to Twist of Changing Fate! The goal is to play all the cards in your hand (on the bottom) onto the table (on the top).
        You can play a card if it matches the condition decided by the Turntable of Fate (on the right).
        If you can't play a card, you can draw a card from the deck (on the left) by clicking it, or you can spin the Turntable of Fate, to be able to play other cards.
        It costs you ${-this.config.drawCost} points to draw a card, and ${-this.config.spinCost} points to spin the Turntable of Fate.
        Good luck!`);
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
        }, this.config.initialHandSize * 300);
    }

    lockControls() {
        for (let button in this.buttons) {
            this.buttons[button].classList.add("button-unclickable");
        }
        this.controlsAreLocked = true;

    }

    showMessage(message = "message", allowCancel = false, callback = null) {
        const messageBox = document.getElementById("messageBox");
        const messageText = document.getElementById("messageText");
        const messageButtonOk = document.getElementById("messageButtonOk");
        const messageButtonCancel = document.getElementById("messageButtonCancel");
        messageBox.style.display = "flex";
        messageText.innerText = message;
        if (allowCancel) {
            messageButtonCancel.style.display = "block";
            messageButtonCancel.onclick = () => {
                this.hideMessage();
                this.unlockControls();
            }
        }
        this.lockControls();
        messageButtonOk.onclick = () => {
            this.hideMessage();
            this.unlockControls();
            if (callback) {
                callback();
            }
        }
    }

    hideMessage() {
        const messageBox = document.getElementById("messageBox");
        const messageButtonCancel = document.getElementById("messageButtonCancel");
        messageButtonCancel.style.display = "";
        messageBox.style.display = "none";
    }

    unlockControls() {
        this.deck.assignClickHandler(this.drawCard.bind(this, this.hand, false));
        this.hand.updateCallbacks(this.boundPlayCallback);
        for (let button in this.buttons) {
            this.buttons[button].classList.remove("button-unclickable");
        }
        this.controlsAreLocked = false;
    }

    updateLayout() {
        if (window.innerWidth < window.innerHeight) {
            // portrait layout
            this.gameContainer.style.zoom = window.innerHeight / 1080;
            this.deck?.updateElements(this.config.portrait.deckPosition);
            this.table?.updateElements(this.config.portrait.tablePosition);
            if (this.landscape) {
                this.landscape = false;
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
                if (this.wheel) {
                    this.wheel.updateElements(true);
                }
            }
        } else {
            // landscape layout
            this.gameContainer.style.zoom = window.innerWidth / 1920;
            this.deck?.updateElements(this.config.landscape.deckPosition);
            this.table?.updateElements(this.config.landscape.tablePosition);
            if (!this.landscape) {
                this.landscape = true;
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
                if (this.wheel) {
                    this.wheel.updateElements(true);
                }
            }
        }
        if (this.hand) {
            this.hand.updateElements();
        }
        let hasTouchScreen = false;
        if ("maxTouchPoints" in navigator) {
            hasTouchScreen = navigator.maxTouchPoints > 0;
        }
        if (hasTouchScreen && this.landscape) {
            document.body.style.transform = "translateY(20%)";
            document.body.style.overflowY = "scroll";
        } else {
            document.body.style.transform = "";
            document.body.style.overflowY = "";
        }

    }
}