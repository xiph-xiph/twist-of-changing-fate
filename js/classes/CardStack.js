export default class CardStack {
    constructor(position = { left: "0%", bottom: "0%" }, drawFaceDown = false, transformOrigin = "center") {
        this.cards = [];
        this.position = position;
        this.drawFaceDown = drawFaceDown;
        this.transformOrigin = transformOrigin;
        this.onClickFunction = null;
    }

    get size() {
        return this.cards.length;
    }

    get topCard() {
        return this.cards[this.size - 1];
    }

    get secondCard() {
        return this.cards[this.size - 2];
    }

    // Fisher-Yates shuffle
    shuffle() {
        for (let i = this.size - 1; i > 0; i--) {
            const randomIndex = Math.floor(Math.random() * i);
            [this.cards[i], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[i]];
        }
        this.updateElements();
    }

    sortByRank(acesAreHigh = false) {
        this.cards.sort((a, b) => {
            let rankDifference = a.rank - b.rank;
            if (rankDifference) {
                if (acesAreHigh && a.rank === 1) {
                    return 1;
                }
                if (acesAreHigh && b.rank === 1) {
                    return -1;
                }
                return rankDifference;
            }
            else {
                return a.suit - b.suit;
            }
        })
    }

    sortBySuit(acesAreHigh = false) {
        this.cards.sort((a, b) => {
            let suitDifference = a.suit - b.suit;
            if (suitDifference) {
                return suitDifference;
            }
            else {
                if (acesAreHigh && a.rank === 1) {
                    return 1;
                }
                if (acesAreHigh && b.rank === 1) {
                    return -1;
                }
                return a.rank - b.rank;
            }
        })
    }


    // Add a card or an array of cards to the stack
    addCards(cards) {
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        cards.forEach(card => {
            card.parentStack = this;
            this.cards.push(card);
        });
        return cards;
    }


    // Create the DOM elements of the stack and return them. Return null if no cards in stack.
    createElements() {
        if (this.size === 0) {
            return null;
        }
        return [this.topCard.createElement({
            position: this.position,
            zIndex: this.size,
            drawFaceDown: this.drawFaceDown,
            transformOrigin: this.transformOrigin
        })];
    }

    // Refresh the DOM elements of the stack and return them. Return null if no cards in stack.
    updateElements() {
        if (this.size === 0) {
            return null;
        }
        // delete every card except the top two
        for (let i = 0; i < this.size - 2; i++) {
            this.cards[i].deleteElement();
        }
        this.topCard.updateElement({
            position: this.position,
            zIndex: this.size,
            drawFaceDown: this.drawFaceDown,
            transformOrigin: this.transformOrigin
        });
    }

    // Remove card from the stack and return it
    detachCard(card) {
        this.deselectCard();
        const index = this.cards.indexOf(card);
        this.cards.splice(index, 1);
        card.parentStack = null;
        this.updateElements();
        return card;
    }
}