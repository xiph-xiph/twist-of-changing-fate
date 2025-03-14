export default class ConditionWheel {
    constructor(gameManager, config) {
        this.gameManager = gameManager;
        this.config = config;
        this.conditions = config.conditions;
        this.wheelSegments = config.wheelSegments;
        this.unplayableRespinChance = config.unplayableRespinChance;
        this.unplayableRespinChanceFirstSpin = config.unplayableRespinChanceFirstSpin;
        this.linkElements();
        this.updateElements();
        this.updateTextElements
        this.spinWheel(true);
        this.rotationSpeed = 0;
        this.rotationSlowdown = 0.0001;
    }


    spinWheel(firstSpin = false) {
        let totalWeights = 0;
        for (let condition of this.conditions) {
            if (condition.name === this.currentCondition?.name) {
                // skip the current condition
                console.log(`${condition.name} is the same as ${this.currentCondition.name}`);
                continue;
            }
            if (firstSpin && condition.startingWeight) {
                totalWeights += condition.startingWeight;
            } else if (condition.weight) {
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
            } else if (condition.weight) {
                randomWeight -= condition.weight;
            }
            if (randomWeight <= 0) {
                this.currentCondition = condition;
                break;
            }
        }
        this.playsUntilForcedSpin = this.currentCondition?.playsUntilForcedSpin || -1;
        this.playsUntilFreeSpin = this.currentCondition?.playsUntilFreeSpin || -1;
        this.updateTextElements();
        this.gameManager.hand.updatePlayButton();
    }

    // checks if the wheel should be respun, then respins the wheel if necessary
    respinWheel(firstSpin = false) {
        while (this.shouldRespin(firstSpin)) {
            this.spinWheel(firstSpin);
        }
        this.spinAnimation();
    }


    shouldRespin(firstSpin) {
        if (!this.anyCardIsPlayableInStack(this.gameManager.hand)) {
            const random = Math.random();
            if (firstSpin) {
                if (this.unplayableRespinChanceFirstSpin >= random) {
                    return true;
                }
                return false;
            } else {
                if (this.unplayableRespinChance >= random) {
                    return true;
                }
                return false;
            }
        }
    }

    anyCardIsPlayableInStack(cardStack) {
        for (let card of cardStack.cards) {
            if (this.canPlayCard(card, this.gameManager.table)) {
                return true;
            }
        }
        return false;
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
        if (this.gameManager.landscape) {
            this.wheelSize = this.config.landscape.wheelSize;
        } else {
            this.wheelSize = this.config.portrait.wheelSize;
        }
        this.conditionWheelContainer = document.getElementById("conditionWheelContainer");
        this.conditionTextContainer = document.getElementById("conditionTextContainer");
        this.conditionNameTextElement = document.getElementById("conditionNameText");
        this.conditionDescriptionTextElement = document.getElementById("conditionDescriptionText");
        this.turnsUntilFreeSpinTextElement = document.getElementById("freeSpinText");
        this.turnUntilForcedSpinTextElement = document.getElementById("forcedSpinText");
        this.canvasElement = document.getElementById("conditionWheelCanvas");
        this.spinButton = document.getElementById("spinButton");
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
        this.canvasContext.clearRect(-this.wheelSize * 3, -this.wheelSize * 3, this.wheelSize * 6, this.wheelSize * 6);
        for (let i = 0; i < this.wheelSegments; i++) {
            if (i % 2) {
                this.canvasContext.fillStyle = color1;
            } else {
                this.canvasContext.fillStyle = color2;
            }
            const arcSegment = 2 * Math.PI / this.wheelSegments;
            this.canvasContext.beginPath();
            this.canvasContext.moveTo(0, 0);
            this.canvasContext.arc(0, 0, this.wheelSize / 2, i * arcSegment, (i + 1) * arcSegment);
            this.canvasContext.fill();
        };
    }

    drawCircle() {
        this.canvasContext.beginPath();
        this.canvasContext.arc(0, 0, this.wheelSize / 2 - 2, 0, 2 * Math.PI);
        this.canvasContext.lineWidth = 4;
        this.canvasContext.strokeStyle = "black";
        this.canvasContext.stroke();
    }

    spinAnimation(lockControls = true, first = true) {
        if (lockControls) {
            this.gameManager.lockControls();
        }
        if (first) {
            this.rotationSpeed = 0.03;
            this.updateTextElements();
        }
        this.canvasContext.rotate(this.rotationSpeed);
        this.drawArcs();
        this.drawCircle();
        if (this.rotationSpeed > 0) {
            this.rotationSpeed -= this.rotationSlowdown;
            requestAnimationFrame(() => this.spinAnimation(lockControls, false));
        } else {
            this.rotationSpeed = 0;
            if (lockControls) {
                this.gameManager.unlockControls();
                this.updateTextElements();
            }
        }
    }

    updateElements() {
        this.canvasContext.clearRect(-this.wheelSize / 2, -this.wheelSize / 2, this.wheelSize, this.wheelSize);
        if (this.gameManager.landscape) {
            this.wheelSize = this.config.landscape.wheelSize;
            this.conditionWheelContainer.style.right = "";
            this.conditionWheelContainer.style.top = "";
            this.conditionWheelContainer.style.transform = "";
            this.conditionWheelContainer.appendChild(this.conditionTextContainer);
            this.conditionTextContainer.style.transform = "";
            this.conditionTextContainer.style.position = "";
            this.conditionTextContainer.style.right = "";
            this.conditionTextContainer.style.bottom = "";
        } else {
            this.wheelSize = this.config.portrait.wheelSize;
            this.conditionWheelContainer.style.right = this.config.portrait.wheelPosition.right;
            this.conditionWheelContainer.style.top = this.config.portrait.wheelPosition.top;
            this.conditionWheelContainer.style.transform = "translate(50%, -50%)";
            this.gameManager.gameContainer.appendChild(this.conditionTextContainer);
            this.conditionTextContainer.style.transform = "translateX(60%)";
            this.conditionTextContainer.style.position = "absolute";
            this.conditionTextContainer.style.right = "35%";
            this.conditionTextContainer.style.bottom = "40%";
        }
        this.canvasElement.width = this.wheelSize;
        this.canvasElement.height = this.wheelSize;
        this.canvasContext = this.canvasElement.getContext("2d");
        this.canvasContext.translate(this.wheelSize / 2, this.wheelSize / 2);
        this.drawArcs();
        this.drawCircle();
    }

    updateTextElements() {
        if (this.playsUntilFreeSpin === 0) {
            this.spinButton.classList.add("free-spin-button");
            this.spinButton.innerText = "Free Spin!";
        } else {
            this.spinButton.classList.remove("free-spin-button");
            this.spinButton.innerText = "Spin";
        }

        if (this.currentCondition) {
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
        else {
            if (this.conditionNameTextElement) {
                this.conditionNameTextElement.innerText = "";
                this.conditionDescriptionTextElement.innerText = "";
                this.turnsUntilFreeSpinTextElement.innerText = "";
                this.turnUntilForcedSpinTextElement.innerText = "";
            }
        }

        if (this.gameManager.controlsAreLocked) {
            this.conditionNameTextElement.innerText = "";
            this.conditionDescriptionTextElement.innerText = "";
            this.turnsUntilFreeSpinTextElement.innerText = "";
            this.turnUntilForcedSpinTextElement.innerText = "";
        }
    }
}