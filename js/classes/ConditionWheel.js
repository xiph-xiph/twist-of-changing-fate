export default class ConditionWheel {
    constructor(wheelSize = 400, gameManager) {
        this.gameManager = gameManager;
        this.conditions = [
            { name: "SameRankOrSuit", description: "You can play a card with the same rank or the same suit as the card above.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 3, weight: 8 },
            { name: "RankAscendingOrDescending", description: "You can play a card that is one rank higher or lower than the card above.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 8 },
            { name: "OddRank", description: "You can only play cards with odd ranks.", playsUntilForcedSpin: 5, playsUntilFreeSpin: 3, weight: 2 },
            { name: "EvenRank", description: "You can only play cards with even ranks.", playsUntilForcedSpin: 5, playsUntilFreeSpin: 3, weight: 2 },
            { name: "SameColor", description: "You can only play cards of the same color (red or black).", playsUntilForcedSpin: 5, playsUntilFreeSpin: 3, weight: 2 },
            { name: "PrimeRank", description: "You can only play cards with prime-numbered ranks (2, 3, 5, or 7).", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 2 },
            { name: "FaceCardsOnly", description: "You can only play face cards (Jack, Queen, King).", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 1 },
            { name: "LowerOrHigherByTwo", description: "You must play a card that is exactly two ranks higher or lower than the card above.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 4 },
            { name: "NoRepeatSuit", description: "You cannot play a card if its suit has been played before.", playsUntilForcedSpin: 3, playsUntilFreeSpin: 2, weight: 1 },
            { name: "OnlyAces", description: "You can only play aces.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 1, weight: 1 },
            { name: "OnlyClubs", description: "You can only play Clubs.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 1 },
            { name: "OnlyDiamonds", description: "You can only play Diamonds.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 1 },
            { name: "OnlyHearts", description: "You can only play Hearts.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 1 },
            { name: "OnlySpades", description: "You can only play Spades.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 1 },
            { name: "MultipleOfThreeRank", description: "You can only play cards with ranks that are multiples of 3 (3, 6, or 9).", playsUntilForcedSpin: -1, playsUntilFreeSpin: 1, weight: 2 },
            { name: "MustBeLower", description: "You can only play a card with a lower rank than the card above.", playsUntilForcedSpin: 6, playsUntilFreeSpin: 3, weight: 2 },
            { name: "MustBeHigher", description: "You can only play a card with a higher rank than the card above.", playsUntilForcedSpin: 6, playsUntilFreeSpin: 3, weight: 2 },
            { name: "SumToTen", description: "The rank of the played card and the card above must sum to 10.", playsUntilForcedSpin: -1, playsUntilFreeSpin: 2, weight: 3 },
            { name: "Wildcard1", description: "For your next play, you can play any card.", playsUntilForcedSpin: 1, playsUntilFreeSpin: -1, weight: 3 },
            { name: "Wildcard2", description: "For your next two plays, you can play any card.", playsUntilForcedSpin: 2, playsUntilFreeSpin: -1, weight: 1 },
            { name: "Wildcard3", description: "For your next three plays, you can play any card.", playsUntilForcedSpin: 3, playsUntilFreeSpin: -1, weight: 1 },
            { name: "Wildcard4", description: "For your next four plays, you can play any card.", playsUntilForcedSpin: 4, playsUntilFreeSpin: -1, weight: 1 }
        ];
        this.wheelSize = wheelSize;
        this.linkElements();
        this.spinWheel(true);
    }


    // always lands on another condition
    spinWheel(free = false) {
        if (!(free || this?.playsUntilFreeSpin === 0)) {
            this.gameManager.updateScore(-15);
        }
        const oldCondition = this.currentCondition;
        let totalWeights = 0;
        for (let condition of this.conditions) {
            if (condition.name === this.currentCondition?.name) {
                continue;
            }
            totalWeights += condition.weight;
        }
        let randomWeight = Math.floor(Math.random() * totalWeights);
        for (let condition of this.conditions) {
            if (condition.name === this?.currentCondition?.name) {
                continue;
            }
            randomWeight -= condition.weight;
            if (randomWeight <= 0) {
                this.currentCondition = condition;
                break;
            }
        }
        this.playsUntilForcedSpin = this.currentCondition.playsUntilForcedSpin;
        this.playsUntilFreeSpin = this.currentCondition.playsUntilFreeSpin;
        this.updateElements();
    }

    canPlayCard(cardInHand, tableStack) {
        const cardOnTable = tableStack.topCard;
        switch (this.currentCondition.name) {
            case "SameRankOrSuit":
                return cardInHand.rank === cardOnTable.rank || cardInHand.suit === cardOnTable.suit;
            case "RankAscendingOrDescending":
                return Math.abs(cardInHand.rank - cardOnTable.rank) === 1 || Math.abs(cardInHand.rank - cardOnTable.rank) === 12;
            case "OddRank":
                return cardInHand.rank % 2 && cardInHand.rank <= 10;
            case "EvenRank":
                return !(cardInHand.rank % 2) && cardInHand.rank <= 10;
            case "SameColor":
                return cardInHand.suit + cardOnTable.suit === 5 || cardInHand.suit === cardOnTable.suit;
            case "PrimeRank":
                return cardInHand.rank === 2 || cardInHand.rank === 3 || cardInHand.rank === 5 || cardInHand.rank === 7;
            case "FaceCardsOnly":
                return cardInHand.rank === 11 || cardInHand.rank === 12 || cardInHand.rank === 13;
            case "LowerOrHigherByTwo":
                return Math.abs(cardInHand.rank - cardOnTable.rank) === 2 || Math.abs(cardInHand.rank - cardOnTable.rank) === 11;
            case "NoRepeatSuit":
                for (let card of tableStack.cards) {
                    if (cardInHand.suit === card.suit) {
                        return false;
                    }
                }
                return true;
            case "OnlyAces":
                return cardInHand.rank === 1;
            case "OnlyClubs":
                return cardInHand.suit === 1;
            case "OnlyDiamonds":
                return cardInHand.suit === 2;
            case "OnlyHearts":
                return cardInHand.suit === 3;
            case "OnlySpades":
                return cardInHand.suit === 4;
            case "MultipleOfThreeRank":
                return cardInHand.rank === 3 || cardInHand.rank === 6 || cardInHand.rank === 9;
            case "MustBeLower":
                return cardInHand.rank < cardOnTable.rank || cardOnTable.rank === 1 && cardOnTable !== 1;
            case "MustBeHigher":
                return cardInHand.rank > cardOnTable.rank || cardInHand.rank === 1 && cardOnTable !== 1;
            case "SumToTen":
                return cardInHand.rank + cardOnTable.rank === 10;
            case "Wildcard1":
            case "Wildcard2":
            case "Wildcard3":
            case "Wildcard4":
            default:
                return true;
        }
    }

    linkElements() {
        this.conditionNameTextElement = document.getElementById("conditionNameText");
        this.conditionDescriptionTextElement = document.getElementById("conditionDescriptionText");
        this.turnsUntilFreeSpinTextElement = document.getElementById("freeSpinText");
        this.turnUntilForcedSpinTextElement = document.getElementById("forcedSpinText");
        this.canvasElement = document.getElementById("conditionWheelCanvas");
        this.canvasElement.width = this.wheelSize;
        this.canvasElement.height = this.wheelSize;
        this.canvasContext = this.canvasElement.getContext("2d");
        this.canvasContext.translate(this.wheelSize / 2, this.wheelSize / 2);
        this.drawArcs();
        this.drawCircle();
    }

    drawArcs() {
        const color1 = "rgb(223, 54, 39)";
        const color2 = "white";
        this.canvasContext.clearRect(-this.wheelSize / 2, -this.wheelSize / 2, this.wheelSize, this.wheelSize);
        this.conditions.forEach((condition, index) => {
            if (index % 2) {
                this.canvasContext.fillStyle = color1;
            } else {
                this.canvasContext.fillStyle = color2;
            }
            const arcSegment = 2 * Math.PI / this.conditions.length;
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(0, 0);
            this.canvasContext.arc(0, 0, this.wheelSize / 2, index * arcSegment, (index + 1) * arcSegment);
            this.canvasContext.fill();
        });
    }

    drawCircle() {
        this.canvasContext.beginPath();
        this.canvasContext.arc(0, 0, this.wheelSize / 2 - 2, 0, 2 * Math.PI);
        this.canvasContext.lineWidth = 4;
        this.canvasContext.strokeStyle = "black";
        this.canvasContext.stroke();
    }

    rotateAnimation() {
        this.canvasContext.rotate(0.01);
        this.drawArcs();
        requestAnimationFrame(() => this.rotateAnimation());
    }

    updateElements() {
        console.log("Updating elements");
        this.conditionNameTextElement.innerText = this.currentCondition.name + ":";
        this.conditionDescriptionTextElement.innerText = this.currentCondition.description;

        if (this.playsUntilFreeSpin < 0) {
            this.turnsUntilFreeSpinTextElement.innerText = "";
        } else if (this.playsUntilFreeSpin === 0) {
            this.turnsUntilFreeSpinTextElement.innerText = "Free Spin!";
        } else {
            this.turnsUntilFreeSpinTextElement.innerText = "Free Spin in " + this.playsUntilFreeSpin + " play(s)";

        }
        if (this.playsUntilForcedSpin < 0) {
            this.turnUntilForcedSpinTextElement.innerText = "";
        } else {
            this.turnUntilForcedSpinTextElement.innerText = "Forced Spin in " + this.playsUntilForcedSpin + " play(s)";
        }
    }
}