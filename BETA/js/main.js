/*globals requirejs*/

// Load modules
requirejs.config({
	baseUrl: 'js/lib',
	paths: {
        // Libraries
		Phaser: 'phaser.min',
		lodash: 'lodash.min',
		ROT: 'rot.min',
        
        // Game Files
		creatures: '../app/creatures',
		dungeon: '../app/dungeon',
        game: '../app/game',
        start: '../app/start',
        preload: '../app/preload',
        game_over: '../app/game_over',
        player: '../app/player'
	}
});

// Start the app
requirejs(['../app/boot']);