/*globals define*/

define(['Phaser', 'game'], function (Phaser, Game) {
    'use strict';

    var Game_Over = {
        
        create: function () {
            var width = (800) / 2,
                height = (600) / 2,

                retry_button = this.add.text(width, height, 'Retry', {
                    font: '30pt wingsofDarkness',
                    fill: 'white',
                    align: 'center'
                });

            retry_button.inputEnabled = true;
            retry_button.events.onInputUp.add(this.startGame, this);
            retry_button.anchor.setTo(0.5);

            this.add.text(width, height - 100, 'GAME OVER', {
                font: '50pt wingsofDarkness',
                fill: 'red',
                align: 'center'
            }).anchor.setTo(0.5);
        },

        /**
         * changes the game to the Start state
         * @function startGame
         */
        startGame: function () {
            // Change the state back to Start.
            this.state.start('Start');

        }
    };

    return Game_Over;

});