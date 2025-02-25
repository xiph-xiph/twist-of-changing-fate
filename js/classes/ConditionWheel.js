export default class ConditionWheel {
    constructor(wheelSize = 350, gameManager, config) {
        this.gameManager = gameManager;
        this.conditions = config.conditions;
        this.wheelSize = wheelSize;
        this.spinCost = config.spinCost;
        this.linkElements();
        this.spinWheel(true, true);
        this.rotateAnimation();
    }


    spinWheel(free = false, firstSpin = false) {
        if (!(free || this?.playsUntilFreeSpin === 0)) {
            this.gameManager.updateScore(this.spinCost);
        } else if (!firstSpin) {
            // if the spin was free, remove the current condition from the list of possible conditions
            // so that it can't be selected again for the rest of the game
            this.conditions = this.conditions.filter((condition) => condition.name !== this.currentCondition.name);
        }

        let totalWeights = 0;
        for (let condition of this.conditions) {
            if (condition.name === this.currentCondition?.name) {
                // skip the current condition
                continue;
            }
            if (firstSpin && condition.startingWeight) {
                totalWeights += condition.startingWeight;
            } else {
                totalWeights += condition.weight;
            }
        }
        let randomWeight = Math.floor(Math.random() * totalWeights);
        for (let condition of this.conditions) {
            if (condition.name === this?.currentCondition?.name) {
                continue;
            }
            if (firstSpin && condition.startingWeight) {
                randomWeight -= condition.startingWeight;
            } else {
                randomWeight -= condition.weight;
            }
            if (randomWeight <= 0) {
                this.currentCondition = condition;
                break;
            }
        }
        this.playsUntilForcedSpin = this.currentCondition?.playsUntilForcedSpin || -1;
        this.playsUntilFreeSpin = this.currentCondition?.playsUntilFreeSpin || -1;
        this.updateElements();
        this.gameManager.hand.updatePlayButton();
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
            case "Wildcard":
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
        this.canvasContext.rotate(0.007);
        this.drawArcs();
        this.drawCircle();
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