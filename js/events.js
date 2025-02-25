const acesCheckbox = document.getElementById("acesAreHigh");
const sortTypeCheckbox = document.getElementById("sortBySuit");
const shuffleButton = document.getElementById("shuffleButton");
const sortButton = document.getElementById("sortButton");
const spinButton = document.getElementById("spinButton");
const helpButton = document.getElementById("helpButton");
const resetButton = document.getElementById("resetButton");

let acesAreHigh = acesCheckbox.checked;
let sortBySuit = sortTypeCheckbox.checked;


export default function setupEvents(game) {
    acesCheckbox.addEventListener("change", () => { acesAreHigh = acesCheckbox.checked });
    sortTypeCheckbox.addEventListener("change", () => { sortBySuit = sortTypeCheckbox.checked });
    shuffleButton.addEventListener("click", () => { game.shuffleHand() });
    sortButton.addEventListener("click", () => { game.sortHand(sortBySuit, acesAreHigh) });
    spinButton.addEventListener("click", () => { game.tryToSpinWheel(false) });
    helpButton.addEventListener("click", () => { game.showHelp() });
    resetButton.addEventListener("click", () => { game.restartGame() });
    window.addEventListener("resize", () => { game.updateZoom(); });
    document.addEventListener("keydown", (event) => {
        if (event.key === " " || event.key === "Enter") {
            game.playCard();
        }
    });
}

