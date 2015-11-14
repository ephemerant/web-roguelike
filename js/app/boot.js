/*globals define*/

define(['Phaser', 'preload', 'start', 'game', 'game_over', 'loading'], function (Phaser, Preload, Start, Game, Game_Over, Loading) {
    'use strict';

    var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio,
        SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio,
        
        game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen');
    game.state.add('Loading', Loading);
    game.state.add('Preload', Preload);
    game.state.add('Start', Start);
    game.state.add('Game', Game);
    game.state.add('Game_Over', Game_Over);
    game.state.start('Loading');
});