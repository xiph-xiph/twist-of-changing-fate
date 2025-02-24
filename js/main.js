"use strict";

import events from "./events.js";
import GameManager from "./classes/GameManager.js";

const game = new GameManager();
events(game);
game.startGame();