var game,
    // Our ROT-based dungeon model
    dungeon = dungeon,
    // How wide / tall each tile is
    TILE_SIZE = TILE_SIZE,
    Preload = {

        preload: function () {
            'use strict';
            // Loading images is required so that later on we can create sprites based on the them.
            // The first argument is how our image will be refered to, 
            // the second one is the path to our file.
            game.load.image('menu', './assets/images/play.png');
            game.load.image('gameover', './assets/images/gameover.png');
            game.load.image('dungeon', './assets/images/Wall.png');
            game.load.spritesheet('warrior', './assets/images/Warrior.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('engineer', './assets/images/Engineer.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('mage', './assets/images/Mage.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('paladin', './assets/images/Paladin.png', TILE_SIZE, TILE_SIZE);
            game.load.spritesheet('rogue', './assets/images/Rogue.png', TILE_SIZE, TILE_SIZE);
            game.load.audio('SND_door_open', './assets/Sounds/Door.wav');
            game.load.audio('SND_teleport', ['./assets/Sounds/Teleport.ogg', 'assets/Sounds/Teleport.wav']);
            game.load.audio('MUS_dungeon1', ['./assets/Music/Adventure_Meme.ogg', 'assets/Music/Adventure_Meme.mp3']);
            game.load.audio('MUS_dungeon2', ['./assets/Music/Wonderful_Nightmare.ogg', 'assets/Music/Wonderful_Nightmare.mp3']);
        },

        create: function () {
            'use strict';
            this.state.start('Menu');
        }

    };
