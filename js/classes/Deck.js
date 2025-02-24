import Card from "./Card.js";
import CardStack from "./CardStack.js";

export default class Deck extends CardStack {
    constructor(position = { left: "0%", bottom: "0%" }, showAsFan = false, drawFaceDown = false, transformOrigin = "center", allowSelection = false) {
        super(position, showAsFan, drawFaceDown, transformOrigin, allowSelection);
        for (let suit = 1; suit <= 4; suit++) {
            for (let rank = 1; rank <= 13; rank++) {
                this.cards.push(new Card(suit, rank, 0, this));
            }
        }
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
        this.topCard.onClickCallback = func;
    }


    // Transfers the click handler that's on the top card to the one below that
    transferClickHandler() {
        if (!this.secondCard) {
            console.log("No card under this one");
            this.topCard.onClickCallback = null;
            return;
        }
        this.secondCard.onClickCallback = this.topCard.onClickCallback;
        this.topCard.onClickCallback = null;
    }
}