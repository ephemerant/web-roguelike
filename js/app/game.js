define(['Phaser', 'lodash', 'dungeon', 'ROT'], function(Phaser, _, dungeon, ROT) {

  // Dictionary of tilesheet indexes
  var tiles = dungeon.tiles;

  // How wide / tall each tile is
  var TILE_SIZE = dungeon.TILE_SIZE;

  // Our ROT-based dungeon model
  dungeon = dungeon.dungeon;

  // Width / height of the actual window
  // TODO: Completely fill window with game screen?
  var SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio;
  var SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio;

  var DUNGEON_WIDTH = dungeon.width * TILE_SIZE;
  var DUNGEON_HEIGHT = dungeon.width * TILE_SIZE;

  var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  // Import assets
  function preload() {
    game.load.image('dungeon', 'assets/Wall.png');
    game.load.spritesheet('warrior', 'assets/Warrior.png', TILE_SIZE, TILE_SIZE);
    game.load.spritesheet('engineer', 'assets/Engineer.png', TILE_SIZE, TILE_SIZE);
    game.load.spritesheet('mage', 'assets/Mage.png', TILE_SIZE, TILE_SIZE);
    game.load.spritesheet('paladin', 'assets/Paladin.png', TILE_SIZE, TILE_SIZE);
    game.load.spritesheet('rogue', 'assets/Rogue.png', TILE_SIZE, TILE_SIZE);
    game.load.audio('SND_door_open', 'assets/Sounds/Door.wav');
    game.load.audio('MUS_dungeon1',['assets/Music/Adventure_Meme.mp3','assets/Music/Adventure_Meme.ogg']);
    game.load.audio('MUS_dungeon2',['assets/Music/Wonderful_Nightmare.mp3','assets/Music/Wonderful_Nightmare.ogg']);
  }

  // Phaser map where tiles are drawn
  var map;
  // A distinct graphical layer on the map
  // TODO: Use multiple layers for tiles, objects, and creatures
  var layer;

  // Arrow keys
  var cursors;
  // Key to start a new game [R]
  var reset_key;
  // Key that when held, moves the player towards the end of the level [A]
  var autopilot_key;

  // The player sprite
  var player;

  //These variables are for volume control.
  //TODO: Allow user to choose volume.
  var sound_volume = 1;
  var music_volume = .4;
  //Sounds
  var SND_door_open;
  //Music
  var MUS_dungeon1;
  var MUS_dungeon2;

  function create() {
    // // Increase bounds so camera can move around
    game.world.setBounds(-DUNGEON_WIDTH, -DUNGEON_HEIGHT, DUNGEON_WIDTH * 3, DUNGEON_HEIGHT * 3);

    game.stage.backgroundColor = '#050505';

    game.stage.smoothed = false;

    // Creates a blank tilemap
    map = game.add.tilemap(null, TILE_SIZE, TILE_SIZE);

    // Add a Tileset image to the map
    map.addTilesetImage('dungeon');

    // Creates a new blank layer and sets the map dimensions.
    layer = map.create('level1', dungeon.width, dungeon.height, TILE_SIZE, TILE_SIZE);

    createWorld();

    cursors = game.input.keyboard.createCursorKeys();

    autopilot_key = game.input.keyboard.addKey(Phaser.Keyboard.A);

    reset_key = game.input.keyboard.addKey(Phaser.Keyboard.R);
    reset_key.onDown.add(createWorld, this);

    //create Sounds
    SND_door_open = game.add.audio('SND_door_open');
    SND_door_open.volume = sound_volume;
    //create Music
    MUS_dungeon1 = game.add.audio('MUS_dungeon1');
    MUS_dungeon1.loop = true;
    MUS_dungeon1.volume = music_volume;
    MUS_dungeon1.play();
    MUS_dungeon2 = game.add.audio('MUS_dungeon2');
    MUS_dungeon2.loop = true;
    MUS_dungeon2.volume = music_volume;
  }

  // Move player one step towards the stairs (used to test pathing)
  function autoPilot() {
    if (player.isMoving) return;

    // Input callback informs about map structure
    var passableCallback = function(x, y) {
      return (dungeon.tiles[x + "," + y] !== undefined);
    };

    // Prepare path to stairs
    var astar = new ROT.Path.AStar(dungeon.stairs.x, dungeon.stairs.y, passableCallback, {
      topology: 4
    });

    var exit = 0;

    // Compute from player
    astar.compute(dungeon.player.x, dungeon.player.y, function(x, y) {

      exit += 1;
      // Only move once
      if (exit !== 2) return;

      var _x = x - dungeon.player.x,
        _y = y - dungeon.player.y;

      movePlayer(_x, _y);
    });
  }

  function createWorld() {
    dungeon.level = 1;
    createDungeon();
    createPlayer();
  }

  function createDungeon() {
    removeTiles();

    dungeon._init();

    // Place tiles
    _.each(dungeon.tiles, function(tile, key) {
      var xy = key.split(',');
      placeTile(tile, xy[0], xy[1]);
    });

    // Place walls
    _.each(dungeon.walls, function(tile, key) {
      var xy = key.split(',');
      placeTile(tile, xy[0], xy[1]);
    });

    // Place doors
    _.each(dungeon.doors, function(key) {
      var xy = key.split(',');
      placeTile(tiles.door, xy[0], xy[1]);
    });

    // Place stairs
    placeTile(tiles.stairs, dungeon.stairs.x, dungeon.stairs.y);
  }

  function createPlayer() {
    // In the case you're starting a new game, delete the old player sprite
    if (player) {
      player.destroy();
    }

    // TODO: Fully implement class system
    var playerClass = ['warrior', 'engineer', 'mage', 'paladin', 'rogue'][_.random(4)];

    player = game.add.sprite(0, 0, playerClass, 0);
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);
    game.camera.follow(player);

    player.x = dungeon.player.x * TILE_SIZE;
    player.y = dungeon.player.y * TILE_SIZE;
  }

  function placeTile(tile, x, y) {
    map.putTile(tile, x, y, layer);
  }

  // Clear the map of all tiles
  function removeTiles() {
    // Tiles
    _.each(dungeon.tiles, function(tile, key) {
      var xy = key.split(',');
      map.removeTile(xy[0], xy[1], layer);
    });

    // Walls
    _.each(dungeon.walls, function(tile, key) {
      var xy = key.split(',');
      map.removeTile(xy[0], xy[1], layer);
    });

    // Doors
    _.each(dungeon.doors, function(key) {
      var xy = key.split(',');
      map.removeTile(xy[0], xy[1], layer);
    });
  }

  // Add (x, y) to the player's position if it is a valid move
  function movePlayer(x, y) {
    if (player.isMoving) return;

    if (x === 0 && y === 0) return;

    var newX = dungeon.player.x + x,
      newY = dungeon.player.y + y;

    var key = newX + ',' + newY;

    if (x === 1) {
      player.play('right');
    } else if (x === -1) {
      player.play('left');
    }
    if (y === 1) {
      player.play('down');
    } else if (y === -1) {
      player.play('up');
    }

    // Valid tile
    if (dungeon.tiles[key] !== undefined) {

      player.isMoving = true;

      if (_.contains(dungeon.doors, key)) {
        // Remove the door
        dungeon.doors.splice(dungeon.doors.indexOf(key), 1);
        // Overwrite door tile
        // TODO: Use sprites for doors
        placeTile(tiles.floor, newX, newY);
        SND_door_open.play();
        // Add delay to move again
        setTimeout(function() {
          player.isMoving = false;
        }, 100)
        return;
      }

      dungeon.player.x += x;
      dungeon.player.y += y;

      // Entering stairs
      if (dungeon.player.x === dungeon.stairs.x && dungeon.player.y === dungeon.stairs.y) {
        dungeon.level += 1;
        createDungeon();
        if (dungeon.level >5){
          if(MUS_dungeon2.isPlaying=== false){
            MUS_dungeon1.stop();
            MUS_dungeon2.play();
          }
        }
      }

      // Slide the player to their new position
      game.add.tween(player).to({
        x: dungeon.player.x * TILE_SIZE,
        y: dungeon.player.y * TILE_SIZE
      }, 80, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function() {
        player.isMoving = false;
      }, this);
    }
  }

  // Handle input / animations
  function update() {
    if (cursors.left.isDown) {
      movePlayer(-1, 0);
      player.play('left');
    } else if (cursors.right.isDown) {
      movePlayer(1, 0);
      player.play('right');
    } else if (cursors.up.isDown) {
      movePlayer(0, -1);
      player.play('up');
    } else if (cursors.down.isDown) {
      movePlayer(0, 1);
      player.play('down');
    } else if (autopilot_key.isDown) {
      autoPilot();
    } else {
      if (!player.isMoving) {
        player.animations.stop();
      }
    }
  }

  // Where each frame is rendered
  function render() {
    game.debug.text('Level ' + dungeon.level, 16, 30);

    game.debug.text('Use the ARROW KEYS to move', 16, game.height - 90);
    game.debug.text('Press R to start a new game', 16, game.height - 60);
    game.debug.text('Hold A for auto-pilot', 16, game.height - 30);
  }
});
