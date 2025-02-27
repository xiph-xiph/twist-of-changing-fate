import CardStack from "./CardStack.js";

export default class Hand extends CardStack {
    constructor(position = { left: "0%", bottom: "0%" }, drawFaceDown = false, transformOrigin = "center", gameManager) {
        super(position, drawFaceDown, transformOrigin, gameManager);
        this.selectedCard = null;
        this.updateHandWidth();
    }

    // Deselect the selected card, and then select given card if it was a different card, and return it.
    // Return null if card is not in hand, or if selected card was the same as given card.
    selectCard(card) {
        if (!this.cards.includes(card)) {
            console.error("Card is not in hand");
            return null;
        }

        if (this.deselectCard() === card) {
            return null;
        }
        card.selected = true;
        card.element.classList.add("selected");
        card.updateElement({ zIndex: card.zIndex });
        card.createPlayButton();
        this.selectedCard = card;
        this.updatePlayButton();
        return card;
    }

    // Updates the play button of the selected card to show whether it is playable or not
    updatePlayButton() {
        if (!this.selectedCard) {
            return;
        }
        if (this.cardIsPlayable(this.selectedCard)) {
            this.selectedCard.playButton.classList.add("playable");
        } else {
            this.selectedCard.playButton.classList.remove("playable");
        }
    }

    // Deselect the selected card, and return it. Return null if no card was selected.
    deselectCard() {
        if (!this.selectedCard) {
            return null;
        }
        const card = this.selectedCard;
        card.selected = false;
        card.element.classList.remove("selected");
        card.updateElement({ zIndex: card.zIndex });
        card.deletePlayButton();
        this.selectedCard = null;
        return card;
    }

    cardIsPlayable(card) {
        return this.gameManager.wheel.canPlayCard(card, this.gameManager.table);
    }

    // Create the DOM elements of the hand and return them. Return null if no cards in hand.
    // This is different from CardStack.createElements, here the cards are fanned out.
    createElements() {
        this.updateHandWidth();
        if (this.size === 0) {
            return null;
        }
        if (this.size === 1) {
            return super.createElements(true);
        }
        const elements = [];
        this.cards.forEach((card, i) => {
            const bottom = this.position.bottom;
            const left = `calc(${this.position.left} + ${(i - (this.size - 1) / 2) * (this.handWidth / (this.size - 1))}px)`;
            const element = card.createElement({
                position: { bottom, left },
                zIndex: i,
                drawFaceDown: this.drawFaceDown,
                transformOrigin: this.transformOrigin,
                allowSelection: true
            });
            elements.push(element);
        })
        return elements;
    }


    // Refresh the DOM elements of the hand and return them. Return null if no cards in hand.
    // This is different from CardStack.updateElements, here the cards are fanned out.
    updateElements() {
        this.updateHandWidth();
        if (this.size === 0) {
            return null;
        }
        if (this.size === 1) {
            return super.updateElements();
        }
        const elements = [];
        this.cards.forEach((card, i) => {
            const bottom = this.position.bottom;
            const left = `calc(${this.position.left} + ${(i - (this.size - 1) / 2) * (this.handWidth / (this.size - 1))}px)`;
            const element = card.updateElement({
                position: { bottom, left },
                zIndex: i,
                drawFaceDown: this.drawFaceDown,
                transformOrigin: this.transformOrigin,
                allowSelection: true
            });
            elements.push(element);
        })
    }

    updateCallbacks(onPlayCallback = null) {
        this.cards.forEach((card) => {
            card.onPlayCallback = onPlayCallback;
            card.onClickCallback = this.selectCard.bind(this, card);
        });
    }

    updateHandWidth() {
        if (this.gameManager.landscape) {
            this.handWidth = this.gameManager.config.landscape.handWidth;
        } else {
            this.handWidth = window.innerWidth * 0.8;
        }
    }
}