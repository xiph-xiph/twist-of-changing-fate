import Card from "./Card.js";
import CardStack from "./CardStack.js";

export default class Deck extends CardStack {
    constructor(position = { left: "0%", bottom: "0%" }, showAsFan = false, drawFaceDown = false, transformOrigin = "center", allowSelection = false, gameManager) {
        super(position, showAsFan, drawFaceDown, transformOrigin, allowSelection, gameManager);
        for (let suit = 1; suit <= 4; suit++) {
            for (let rank = 1; rank <= 13; rank++) {
                this.cards.push(new Card(suit, rank, 0, this));
            }
        }
        this.cycleButton = document.getElementById("cycleDeckButton");
        this.shuffle()
    }

    // Take the top x cards from the deck and return them as an array. If there are not enough cards in the deck, return null
    drawCards(amountOfCards = 1) {
        if (this.size < amountOfCards) {
            console.error("Not enough cards in the deck");
            return null;
        }
        let cards = [];
        for (let i = 0; i < amountOfCards; i++) {
            cards.push(this.cards.pop());
        }
        return cards;
    }

    // Assigns a callback function to be executed when the top card is clicked
    assignClickHandler(func = null) {
        if (!this.topCard) {
            console.error("No top card to assign click handler to.");
            return;
        }
        this.topCard.onClickCallback = func;
    }


    // Transfers the click handler that's on the top card to the one below that
    transferClickHandler() {
        if (!this.secondCard) {
            this.topCard.onClickCallback = null;
            return;
        }
        this.secondCard.onClickCallback = this.topCard.onClickCallback;
        this.topCard.onClickCallback = null;
    }

    updateElements(newPosition = { left: this.position.left, bottom: this.position.bottom }) {
        super.updateElements(newPosition);
        this.cycleButton.style.left = `calc(${newPosition.left} - 10px)`;
        if (this.gameManager.landscape) {
            this.cycleButton.style.bottom = `calc(${newPosition.bottom} + 170px)`;
        } else {
            this.cycleButton.style.bottom = `calc(${newPosition.bottom} - 155px)`;
        }
    }
}