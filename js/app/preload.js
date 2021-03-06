/*globals define*/
/*jslint nomen: true */

define(['Phaser', 'dungeon'], function (Phaser, dungeon) {
    'use strict';
    var creatures = dungeon.creatures,
        items = dungeon.items,
        TILE_SIZE = dungeon.TILE_SIZE,
        //loadingscreen = this.load.image('load', 'assets/loading.png'),
        // TODO: Move this list to a player.js file or something of the sort
        classes = ['Warrior', 'Engineer', 'Mage', 'Paladin', 'Rogue'],

        Preload = {
            // Import assets
            preload: function () {
                // Used to avoid conflicts
                var vm = this;
                // Add loading text for player to wait
                vm.add.text(800 / 2, 600 / 2, 'Loading . . .', {
                    font: 'bold 20pt "Lucida Sans Typewriter"',
                    fill: 'white',
                    align: 'center'
                }).anchor.setTo(0.5);

                vm.load.image('splash', 'assets/splash.png');
                vm.load.spritesheet('removeItem', 'assets/removeItem.png', 24, 24);
                vm.load.image('fullscreen', 'assets/fs.png');
                vm.load.image('dungeon', 'assets/Wall.png');
                vm.load.image('inventoryTile', 'assets/inventoryTile.png');
                vm.load.image('shadow', 'assets/shadow.png');
                vm.load.image('spriteCard', 'assets/spriteCard.png');
                vm.load.image('scroll', 'assets/Scroll.png');

                //status effects
                vm.load.image('STAT_poison', 'assets/GUI/poison.png');

                vm.load.spritesheet('door', 'assets/Door.png', TILE_SIZE, TILE_SIZE);
                vm.load.spritesheet('door_open', 'assets/Door_Open.png', TILE_SIZE, TILE_SIZE);
                vm.load.spritesheet('objects', 'assets/Objects.png', TILE_SIZE, TILE_SIZE);

                // Load player sprites
                classes.forEach(function (name) {
                    vm.load.spritesheet(name.toLowerCase(), 'assets/' + name + '.png', TILE_SIZE, TILE_SIZE);
                });
                // Load monster sprites
                creatures._sprites.forEach(function (sprite) {
                    Preload.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/monsters/' + sprite, TILE_SIZE, TILE_SIZE);
                });

                // Load item sprites
                items._sprites.forEach(function (sprite) {
                    Preload.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/items/' + sprite, TILE_SIZE, TILE_SIZE);
                });

                // Load Sound Effects
                vm.load.audio('SND_door_open', 'assets/sounds/Door.wav');
                vm.load.audio('SND_hit', 'assets/sounds/Hit.wav');
                vm.load.audio('SND_teleport', ['assets/sounds/Teleport.ogg', 'assets/sounds/Teleport.wav']);
                vm.load.audio('SND_item', 'assets/sounds/Item.wav');
                vm.load.audio('SND_potion', 'assets/sounds/Potion.wav');
                vm.load.audio('SND_click', 'assets/sounds/Click.wav');
                // Load Music
                vm.load.audio('MUS_dungeon1', ['assets/music/Adventure_Meme.ogg', 'assets/music/Adventure_Meme.mp3']);
                vm.load.audio('MUS_dungeon2', ['assets/music/Wonderful_Nightmare.ogg', 'assets/music/Wonderful_Nightmare.mp3']);

                // Fonts
                vm.load.bitmapFont('wingsofDarkness', 'assets/Fonts/Wings_of_Darkness.png', 'assets/Fonts/Wings_of_Darkness.fnt');
                vm.load.bitmapFont('fleshWound', 'assets/Fonts/Flesh Wound.png', 'assets/Fonts/Flesh Wound.fnt');
            },

            create: function () {
                this.state.start('Start');
            }
        };
    return Preload;

});
