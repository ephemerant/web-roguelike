/*globals Phaser, Preload, Menu, Game, Game_Over*/

// Create a new game instance 800px wide and 600px tall:
var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen');

// First parameter is how our state will be called.
// Second parameter is an object containing the needed methods for state functionality
game.state.add('Preload', Preload);
game.state.add('Menu', Menu);
game.state.add('Game', Game);
game.state.add('Game_Over', Game_Over);

game.state.start('Preload');