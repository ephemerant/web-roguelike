// Load modules
require.config({
  baseUrl: 'js/lib',
  paths: {
    Phaser: 'phaser.min',
    lodash: 'lodash.min',
    ROT: 'rot.min',
    QUnit: 'QUnit',
    creatures: '../app/creatures',
    dungeon: '../app/dungeon'
  }
});

// Start the app
require(['../app/tests']);