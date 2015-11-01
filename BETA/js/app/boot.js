/*globals define*/

define(['Phaser', 'preload', 'start', 'game'], function (Phaser, Preload, Start, Game) {
    'use strict';

    var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio,
        SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio,
        
        game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen');

    game.state.add('Preload', Preload);
    game.state.add('Start', Start);
    game.state.add('Game', Game);

    game.state.start('Preload');

});