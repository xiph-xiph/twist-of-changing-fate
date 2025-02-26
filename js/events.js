const acesCheckbox = document.getElementById("acesAreHigh");
const sortTypeCheckbox = document.getElementById("sortBySuit");
const shuffleButton = document.getElementById("shuffleButton");
const sortButton = document.getElementById("sortButton");
const spinButton = document.getElementById("spinButton");
const helpButton = document.getElementById("helpButton");
const resetButton = document.getElementById("resetButton");
const cycleDeckButton = document.getElementById("cycleDeckButton");

let acesAreHigh = acesCheckbox.checked;
let sortBySuit = sortTypeCheckbox.checked;


export default function setupEvents(game) {
    acesCheckbox.addEventListener("change", () => { acesAreHigh = acesCheckbox.checked });
    sortTypeCheckbox.addEventListener("change", () => { sortBySuit = sortTypeCheckbox.checked });
    shuffleButton.addEventListener("click", () => { game.shuffleHand() });
    sortButton.addEventListener("click", () => { game.sortHand(sortBySuit, acesAreHigh) });
    spinButton.addEventListener("click", () => { game.tryToSpinWheel(false) });
    helpButton.addEventListener("click", () => { game.showHelp() });
    resetButton.addEventListener("click", () => { if (game.canReset && confirm("Are you sure you want to reset the current game?")) game.restartGame() });
    cycleDeckButton.addEventListener("click", () => { game.cycleDeck() });
    window.addEventListener("resize", () => { game.updateZoom(); });
    document.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
            game.playCard();
        }
    });
    game.wheel.rotateAnimation();
}

