/*globals define*/

define(['Phaser', 'game'], function (Phaser, Game) {
    'use strict';

    var width = (800) / 2 - 150,
        height = (600) / 2 - 100,

        Start = {
            create: function () {
                this.add.sprite(0, 0, 'splash');
                this.add.button(width, height, 'play', this.startGame, this);
            },

            startGame: function () {
                this.state.start('Game');
            }
        };
    return Start;
});