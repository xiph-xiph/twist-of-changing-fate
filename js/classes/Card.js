export default class Card {
    constructor(suit, rank, cardBack, parentStack = null) {
        this.suit = suit; // Clubs = 1, Diamonds = 2, Hearts = 3, Spades = 4
        this.rank = rank; // Ace = 1, Jack = 11, Queen = 12, King = 13
        this.cardBack = cardBack;
        this.selected = false;
        this.drawFaceDown = false;
        this.onClickCallback = null;
        this.onPlayCallback = null;
        this.gameContainer = document.querySelector('.game-container');
    }

    get name() {
        const ranks = {
            1: "Ace",
            2: "Two",
            3: "Three",
            4: "Four",
            5: "Five",
            6: "Six",
            7: "Seven",
            8: "Eight",
            9: "Nine",
            10: "Ten",
            11: "Jack",
            12: "Queen",
            13: "King"
        }

        const suits = {
            1: "Clubs",
            2: "Diamonds",
            3: "Hearts",
            4: "Spades"
        }
        return ranks[this.rank] + " of " + suits[this.suit];
    }

    get imgPos() {
        return {
            x: this.rank * 242 - 242,
            y: this.suit * 340 - 340
        }
    }

    cycleCardBack() {
        this.cardBack += 1;
        if (this.cardBack > 3) { this.cardBack = 0 }
        this.updateElement({ drawFaceDown: this.drawFaceDown });
    }

    onClick() {
        if (this.onClickCallback) {
            this.onClickCallback();
        } else {
            console.error("onClickCallback does not exist");
        }
    }

    playCard() {
        if (this.onPlayCallback) {
            this.onPlayCallback();
        } else {
            console.error("onPlayCallback does not exist");
        }
    }

    createPlayButton() {
        this.playButton = document.createElement("button");
        this.playButton.classList.add("play-button");
        this.playButton.innerText = "Play";
        this.playButton.style.bottom = this.element.style.bottom;
        this.playButton.style.left = this.element.style.left;
        this.gameContainer.appendChild(this.playButton);
        this.playButton.addEventListener("click", () => this.playCard());
    }

    deletePlayButton() {
        if (this.playButton) {
            this.playButton.remove();
            this.playButton = null;
        }
    }

    // Create the DOM element of the card and return it
    createElement({ position = { left: "0%", bottom: "0%" }, zIndex = 0, drawFaceDown = false, transformOrigin = "center bottom", allowSelection = false }) {
        this.element = document.createElement("div");
        this.element.classList.add("card");
        this.updateElement({ position: position, zIndex: zIndex, drawFaceDown: drawFaceDown, transformOrigin: transformOrigin, allowSelection: allowSelection });
        this.gameContainer.appendChild(this.element);
        this.element.addEventListener("click", () => this.onClick());
    }

    // Refresh the DOM element of the card and return it. If the element does not exist, return null 
    // Omitted arguments are ignored
    updateElement({ position, zIndex, drawFaceDown, transformOrigin }) {
        this.drawFaceDown = drawFaceDown;
        if (this.element) {
            if (drawFaceDown !== undefined) {
                if (drawFaceDown) {
                    this.element.style.backgroundPosition = `-3146px -${340 * this.cardBack}px`; // Back of the card
                } else {
                    this.element.style.backgroundPosition = `-${this.imgPos.x}px -${this.imgPos.y}px`;
                }
            }
            if (zIndex !== undefined) {
                this.element.style.zIndex = zIndex;
                this.zIndex = zIndex;
                if (this.selected) {
                    this.element.style.zIndex = 100;
                }
            }
            if (transformOrigin !== undefined) {
                this.element.style.transformOrigin = transformOrigin;
            }
            if (position !== undefined) {
                this.element.style.bottom = position.bottom;
                this.element.style.left = position.left;
                if (this.playButton) {
                    this.playButton.style.bottom = this.element.style.bottom;
                    this.playButton.style.left = this.element.style.left;
                }
            }
            return this.element;
        } else return null;
    }

    deleteElement() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }
}