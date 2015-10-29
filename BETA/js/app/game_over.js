var game = game,
    score = score,
    Game_Over = {

        preload: function () {
            'use strict';
            // Load the needed image for this game screen.
        },

        create: function () {
            'use strict';
            // Create button to start game like in Menu.
            this.add.button(180, 200, 'gameover', this.startGame, this);
        },

        startGame: function () {
            'use strict';
            // Change the state back to Game.
            this.state.start('Game');

        }
    };