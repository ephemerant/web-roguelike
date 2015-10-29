/*globals game, TILE_SIZE*/

var Preload = {

        preload: function () {
            'use strict';
            // Loading images is required so that later on we can create sprites based on the them.
            // The first argument is how our image will be refered to, 
            // the second one is the path to our file.
            game.load.image('menu', 'assets/play.png');
            game.load.image('gameover', 'assets/gameover.png');
            game.load.image('dungeon', 'assets/Wall.png');
            game.load.spritesheet('door', 'assets/Door.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('door_open', 'assets/Door_Open.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('warrior', 'assets/Warrior.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('engineer', 'assets/Engineer.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('mage', 'assets/Mage.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('paladin', 'assets/Paladin.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('rogue', 'assets/Rogue.png', TILE_SIZE, TILE_SIZE);
            game.load.audio('SND_door_open', 'assets/Sounds/Door.wav');
            game.load.audio('SND_teleport', ['assets/Sounds/Teleport.ogg', 'assets/Sounds/Teleport.wav']);
            game.load.audio('MUS_dungeon1', ['assets/Music/Adventure_Meme.ogg', 'assets/Music/Adventure_Meme.mp3']);
            game.load.audio('MUS_dungeon2', ['assets/Music/Wonderful_Nightmare.ogg', 'assets/Music/Wonderful_Nightmare.mp3']);
        },

        create: function () {
            'use strict';
            this.state.start('Menu');
        }

    };