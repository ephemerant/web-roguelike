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
                    font: '46pt wingsofDarkness',
                    fill: 'white',
                    align: 'center'
                });

            play_button.inputEnabled = true;
            play_button.events.onInputUp.add(this.startCreator, this);
            play_button.anchor.setTo(0.5);

            play_button.stroke = 'black';
            play_button.strokeThickness = 4;
            play_button.setShadow(2, 2, "#000", 2, true, true);

            // Add Game Title
            var title = this.add.text(width, height - 150, 'The Legend of Cheryl', {
                font: '50pt wingsofDarkness',
                fill: '#fff',
                align: 'center'
            });

            title.anchor.setTo(0.5);

            title.stroke = 'black';
            title.strokeThickness = 4;
            title.setShadow(2, 2, "#000", 2, true, true);

            // Add color gradient to text

            var grd = play_button.context.createLinearGradient(0, 0, 0, play_button.height);

            //  Add in 2 color stops
            grd.addColorStop(0, '#fff');   
            grd.addColorStop(1, '#338');

            //  And apply to the Text
            play_button.fill = grd;

            grd = title.context.createLinearGradient(0, 0, 0, title.height);

            //  Add in 2 color stops
            grd.addColorStop(0, '#5f5');   
            grd.addColorStop(1, '#050');

            //  And apply to the Text
            title.fill = grd;

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