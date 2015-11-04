/*globals define*/
/*jslint nomen: true */

define(['Phaser', 'game', 'dungeon', 'player'], function (Phaser, Game, dungeon, player) {
    'use strict';
    var creatures = dungeon.creatures,
        TILE_SIZE = dungeon.TILE_SIZE,

        Preload = {
            // Import assets
            preload: function () {
                // Used to avoid conflicts
                var vm = this;
                // TODO: Loading screen?
                vm.load.image('splash', 'assets/splash.png');
                vm.load.image('play', 'assets/play.png');
                vm.load.image('fullscreen', 'assets/fs.png');
                vm.load.image('dungeon', 'assets/Wall.png');
                vm.load.spritesheet('door', 'assets/Door.png', TILE_SIZE, TILE_SIZE);
                vm.load.spritesheet('door_open', 'assets/Door_Open.png', TILE_SIZE, TILE_SIZE);

                // Load player sprites
                player.sprites.forEach(function (sprite) {
                    Preload.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/' + sprite, TILE_SIZE, TILE_SIZE);
                });
                // Load monster sprites
                creatures._sprites.forEach(function (sprite) {
                    Preload.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/monsters/' + sprite, TILE_SIZE, TILE_SIZE);
                });

                // Load Sound Effects
                vm.load.audio('SND_door_open', 'assets/sounds/Door.wav');
                vm.load.audio('SND_hit', 'assets/sounds/Hit.wav');
                vm.load.audio('SND_teleport', ['assets/sounds/Teleport.ogg', 'assets/sounds/Teleport.wav']);
                // Load Music
                vm.load.audio('MUS_dungeon1', ['assets/music/Adventure_Meme.ogg', 'assets/music/Adventure_Meme.mp3']);
                vm.load.audio('MUS_dungeon2', ['assets/music/Wonderful_Nightmare.ogg', 'assets/music/Wonderful_Nightmare.mp3']);
            },

            create: function () {
                this.state.start('Start');
            }
        };
    return Preload;
});