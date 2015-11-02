// Load modules
require.config({
	baseUrl: 'js/lib',
	paths: {
		Phaser: 'phaser.min',
		lodash: 'lodash.min',
		ROT: 'rot.min',
		creatures: '../app/creatures',
		dungeon: '../app/dungeon'
	}
});

// Start the app
require(['../app/game']);
