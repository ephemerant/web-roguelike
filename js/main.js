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
		items: '../app/items',
		dungeon: '../app/dungeon',
        game: '../app/game',
        start: '../app/start',
        loading: '../app/loading',
        preload: '../app/preload',
        game_over: '../app/game_over',
        creator: '../app/creator'
	}
});

// Start the app
requirejs(['../app/boot']);
