/*globals define*/

define(['Phaser'], function (Phaser) {
    'use strict';

    var width = (800) / 2 - 160,
        height = (600) / 2 - 50,
        
        Game_Over = {
            create: function () {
                // Create button to start game like in Menu.
                this.add.button(width, height, 'gameover', this.startGame, this);
            },

            startGame: function () {
                // Change the state back to Game.
                this.state.start('Game');

            }
        };
    return Game_Over;

});