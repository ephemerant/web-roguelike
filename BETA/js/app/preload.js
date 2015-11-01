/*globals define*/
/*jslint nomen: true */

define(['Phaser', 'game', 'dungeon'], function (Phaser, Game, dungeon) {
    'use strict';
    var creatures = dungeon.creatures,
        // TODO: Move this list to a player.js file or something of the sort
        classes = ['Warrior', 'Engineer', 'Mage', 'Paladin', 'Rogue'],
        TILE_SIZE = dungeon.TILE_SIZE,

        Preload = {
            // Import assets
            preload: function () {
                // TODO: Loading screen?
                this.load.image('splash', 'assets/splash.png');
                this.load.image('play', 'assets/play.png');
                this.load.image('fullscreen', 'assets/fs.png');
                this.load.image('dungeon', 'assets/Wall.png');
                this.load.spritesheet('door', 'assets/Door.png', TILE_SIZE, TILE_SIZE);
                this.load.spritesheet('door_open', 'assets/Door_Open.png', TILE_SIZE, TILE_SIZE);

                // Load player sprites
                classes.forEach(function (name) {
                    Preload.load.spritesheet(name.toLowerCase(), 'assets/' + name + '.png', TILE_SIZE, TILE_SIZE);
                });
                // Load monster sprites
                creatures._sprites.forEach(function (sprite) {
                    Preload.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/monsters/' + sprite, TILE_SIZE, TILE_SIZE);
                });

                // Load Sound Effects
                this.load.audio('SND_door_open', 'assets/sounds/Door.wav');
                this.load.audio('SND_teleport', ['assets/sounds/Teleport.ogg', 'assets/sounds/Teleport.wav']);

                // Load Music
                this.load.audio('MUS_dungeon1', ['assets/music/Adventure_Meme.ogg', 'assets/music/Adventure_Meme.mp3']);
                this.load.audio('MUS_dungeon2', ['assets/music/Wonderful_Nightmare.ogg', 'assets/music/Wonderful_Nightmare.mp3']);
            },

            create: function () {
                this.state.start('Start');
            }
        };
    return Preload;
});