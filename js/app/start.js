/*globals define*/

define(['Phaser'], function (Phaser) {
    'use strict';

    var Start = {

        create: function () {
            var width = (800) / 2,
                height = (600) / 2,

                splash = this.add.sprite(0, 0, 'splash'),

                // Add Start text to use as button
                play_button = this.add.text(width, height - 20, 'Start', {
                    font: '50pt wingsofDarkness',
                    fill: 'black',
                    align: 'center'
                });

            play_button.inputEnabled = true;
            play_button.events.onInputUp.add(this.startCreator, this);
            play_button.anchor.setTo(0.5);

            // Add Game Title
            this.add.text(width, height - 150, 'The Legend of Cheryl', {
                font: '50pt wingsofDarkness',
                fill: 'darkgreen',
                align: 'center'
            }).anchor.setTo(0.5);
        },

        /**
         * changes the game to the Creator state
         * @function startGame
         */
        startCreator: function () {
            this.state.start('Creator');
        }
    };
    return Start;
});