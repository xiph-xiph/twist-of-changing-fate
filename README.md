# Twist of Changing Fate

Welcome!

**Twist of Changing Fate** is an engaging browser-based card game developed purely using JavaScript, HTML, and CSS. This game is both lightweight and engaging, suitable for play on desktop and mobile platforms. **Twist of Changing Fate** challenges players to manage their hand of cards strategically to win by adapting to ever-changing game conditions.  
Experience the thrill of the game by playing it live [here](https://xiph-xiph.github.io/twist-of-changing-fate/).

## Game Overview

The challenge is simple yet strategic: play all the cards in your hand onto the table by matching the conditions set by the Turntable of Fate. This requires wit, patience, and perhaps a little bit of luck!

### Gameplay Rules

1. **Objective**: Play all the cards in your hand onto the table.  
2. **Card Matching**: You can place a card on the table if it matches the condition specified by the Turntable of Fate. This condition is visible on the right side of the game interface.  
3. **Drawing and Spinning**:  
   - If you're unable to play a card, you have two options:  
     - **Draw a card**: Click on the deck (located on the left) to draw a card. Note that each draw will cost you points as defined in the game configuration.  
     - **Spin the Turntable of Fate**: This action may provide a playable condition for your current cards. Spinning also incurs a points cost.  
4. **Losing Condition**: The game ends in a loss if you can't play any cards and lack sufficient points to draw from the deck or spin the Turntable of Fate.

## Project Structure

This project follows a clean and organized structure for ease of development and maintenance:




```plaintext

root/

├── js/

│   ├── events.js          // Handles user interaction events

│   ├── main.js            // Main game logic

│   ├── classes/           // Object-oriented classes for game components

│   │   ├── Card.js        // Card class represents individual cards

│   │   ├── CardStack.js   // Manages stacks of cards

│   │   ├── Deck.js        // Represents the deck of cards

│   │   ├── GameManager.js // Oversees the game state and progress

│   │   ├── Hand.js        // Represents the player's hand

│   │   ├── ConditionWheel.js // Manages the Turntable of Fate

├── style/

│   ├── style.css          // Styles for the game interface

├── config/

│   ├── config.json        // Game configuration file for customizable parameters

├── img/

│   ├── cards.png          // Image sprites for the cards

├── index.html             // Entry HTML file

├── LICENSE                // License information

```



## Configuration

### `config/config.json`

This file allows for easy customization of game parameters on your own deployment of the game. Modify settings such as the points cost for drawing cards or spinning the Turntable of Fate.

```json
{
  "drawCost": [Your Value Here],
  "spinCost": [Your Value Here]
}

```



# How to Play



To start playing the game, visit the [live version](https://xiph-xiph.github.io/twist-of-changing-fate/). Whether you're using a desktop browser or a mobile device, the game utilizes adaptive design to ensure a seamless gaming experience with mouse or touch input. Both landscape and portrait modes are available.



## License



This project is distributed under the terms specified in the [LICENSE](LICENSE) file. You are free to use, modify, and distribute this game, provided adherence to stated conditions.



---



Enjoy playing **Twist of Changing Fate**! May you master the Turntable of Fate and emerge victorious with all cards played and strategy unmatched. If you have any questions, suggestions, or feedback, feel free to reach out. Happy playing!

