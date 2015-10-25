var game,
    Menu = {

        preload: function () {
            'use strict';
            // Loading images is required so that later on we can create sprites based on the them.
            // The first argument is how our image will be refered to, 
            // the second one is the path to our file.
        },

        create: function () {
            'use strict';
            // Add menu screen.
            // It will act as a button to start the game.
            this.add.button(300, 250, 'menu', this.startGame, this);
        },
        
        startGame: function () {
            'use strict';
            // Change the state to the actual game.
            this.state.start('Game');

        }

    };
