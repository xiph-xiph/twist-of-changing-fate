"use strict";

import events from "./events.js";
import GameManager from "./classes/GameManager.js";

async function start() {
    const game = new GameManager();
    await game.initialize();
    events(game);
    game.startGame();
}

start();