define(['Phaser', 'lodash', 'dungeon', 'ROT'], function(Phaser, _, dungeon, ROT) {

  // Dictionary of tilesheet indexes
  var tiles = dungeon.tiles;

  // Creature types
  var creatures = dungeon.creatures;

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

  var INPUT_DELAY = 80;

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
  // Square that follows mouse
  var marker;

  // The player sprite
  var player;

  // TODO: Make a player/creature variable
  // Currently automatically moving?
  var is_pathing = false;

  // Dictionary of door sprites by (x,y)
  var doors = {};

  // List of monster sprites
  var monsters = [];

  //These variables are for volume control.
  //TODO: Allow user to choose volume.
  var sound_volume = 0.4;
  var music_volume = 0.1;
  //Sounds
  var SND_door_open;
  var SND_teleport;
  //Music
  var MUS_dungeon1;
  var MUS_dungeon2;

  var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'screen', {
    preload: preload,
    create: create,
    update: update,
    render: render
  });

  // Import assets
  function preload() {
    // TODO: Loading screen?
    game.load.image('dungeon', 'assets/Wall.png');
    game.load.spritesheet('door', 'assets/Door.png', TILE_SIZE, TILE_SIZE);
    game.load.spritesheet('door_open', 'assets/Door_Open.png', TILE_SIZE, TILE_SIZE);

    // TODO: Move this list to a player.js file or something of the sort
    var classes = ['Warrior', 'Engineer', 'Mage', 'Paladin', 'Rogue'];

    // Load player sprites
    classes.forEach(function(name) {
      game.load.spritesheet(name.toLowerCase(), 'assets/' + name + '.png', TILE_SIZE, TILE_SIZE);
    });

    // Load monster sprites
    creatures._sprites.forEach(function(sprite) {
      game.load.spritesheet(sprite.toLowerCase().replace('.png', ''), 'assets/monsters/' + sprite, TILE_SIZE, TILE_SIZE);
    });

    game.load.audio('SND_door_open', 'assets/sounds/Door.wav');
    game.load.audio('SND_teleport', ['assets/sounds/Teleport.ogg', 'assets/sounds/Teleport.wav']);
    game.load.audio('MUS_dungeon1', ['assets/music/Adventure_Meme.ogg', 'assets/music/Adventure_Meme.mp3']);
    game.load.audio('MUS_dungeon2', ['assets/music/Wonderful_Nightmare.ogg', 'assets/music/Wonderful_Nightmare.mp3']);
  }

  function create() {
    // // Increase bounds so camera can move outside the map boundaries
    game.world.setBounds(-DUNGEON_WIDTH, -DUNGEON_HEIGHT, DUNGEON_WIDTH * 3, DUNGEON_HEIGHT * 3);

    game.stage.backgroundColor = '#050505';

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

    // Our painting marker
    marker = game.add.graphics();
    marker.lineStyle(2, '#050505', 1);
    marker.drawRect(0, 0, 32, 32);

    game.input.addMoveCallback(updateMarker, this);
    game.input.onDown.add(mouseClicked, this);

    // Create Sounds
    SND_door_open = game.add.audio('SND_door_open');
    SND_teleport = game.add.audio('SND_teleport');
    SND_teleport.volume = SND_door_open.volume = sound_volume;

    // Create Music
    MUS_dungeon1 = game.add.audio('MUS_dungeon1');
    MUS_dungeon1.loop = true;
    MUS_dungeon1.volume = music_volume;
    MUS_dungeon1.play();
    MUS_dungeon2 = game.add.audio('MUS_dungeon2');
    MUS_dungeon2.loop = true;
    MUS_dungeon2.volume = music_volume;
  }

  function updateMarker() {
    marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
    marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;
  }

  function mouseClicked() {
    // Cancel current path, if there is one
    if (is_pathing) {
      is_pathing = false;
      return;
    }
    // Standard procedure
    var x = layer.getTileX(game.input.activePointer.worldX);
    var y = layer.getTileY(game.input.activePointer.worldY);

    is_pathing = true;

    moveToTile(x, y);
  }

  // Attempt to traverse the entire path to (x, y)
  function moveToTile(x, y) {
    if (player.isMoving ||
      (dungeon.player.x === x && dungeon.player.y === y) ||
      dungeon.tiles[x + ',' + y] === undefined ||
      is_pathing === false) {
      is_pathing = false;
      return;
    }

    // Recursively move towards the tile
    moveTowardsTile(x, y).then(function() {
      moveToTile(x, y);
    });

  }

  // Move one step towards (x, y), if it is a valid tile
  function moveTowardsTile(x, y) {
    return new Promise(function(resolve, reject) {
      if (player.isMoving || dungeon.tiles[x + ',' + y] === undefined) {
        resolve();
        return;
      }

      // Input callback informs about map structure
      var passableCallback = function(x, y) {
        return (dungeon.tiles[x + "," + y] !== undefined);
      };

      // Prepare path towards tile
      var astar = new ROT.Path.AStar(x, y, passableCallback, {
        topology: 4
      });

      var count = 0;

      // Compute from player
      astar.compute(dungeon.player.x, dungeon.player.y, function(x, y) {

        count += 1;

        // Only move once
        if (count === 2) {
          var _x = x - dungeon.player.x,
            _y = y - dungeon.player.y;

          movePlayer(_x, _y).then(resolve);
        }
      });
    });
  }

  // Move player one step towards the stairs (used to test pathing)
  function autoPilot() {
    moveTowardsTile(dungeon.stairs.x, dungeon.stairs.y);
  }

  function createWorld() {
    dungeon.level = 1;
    createDungeon();
    createPlayer();
  }

  function createDungeon() {
    is_pathing = false;

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
      var door = game.add.sprite(xy[0] * TILE_SIZE, xy[1] * TILE_SIZE, 'door', 0);

      // Door of a vertical wall?
      if (dungeon.tiles[(+xy[0] + 1) + ',' + (+xy[1])] !== undefined && dungeon.tiles[(+xy[0] - 1) + ',' + (+xy[1])] !== undefined)
        door.frame = 1;

      doors[key] = door;
    });

    // Place monsters

    // TEMPORARY, for testing
    (function() {
      var keys = Object.keys(dungeon.tiles);
      var tile = keys[1].split(',');
      var x = +tile[0],
        y = +tile[1];
      var monster = game.add.sprite(x * TILE_SIZE, y * TILE_SIZE, 'reptile0', 38);
      monsters.push(monster);
    })();

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

    player = game.add.sprite(dungeon.player.x * TILE_SIZE, dungeon.player.y * TILE_SIZE, playerClass, 0);
    player.animations.add('left', [4, 5, 6, 7], 10, true);
    player.animations.add('right', [8, 9, 10, 11], 10, true);
    player.animations.add('up', [12, 13, 14, 15], 10, true);
    player.animations.add('down', [0, 1, 2, 3], 10, true);
    game.camera.follow(player);
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
    _.each(doors, function(sprite, key) {
      sprite.destroy();
    });

    // Monsters
    monsters.forEach(function(sprite) {
      sprite.destroy();
    });

    doors = {};
    monsters = [];
  }

  // Add (x, y) to the player's position if it is a valid move
  function movePlayer(x, y) {
    return new Promise(function(resolve, reject) {
      if (player.isMoving || (x === 0 && y === 0)) {
        resolve();
        return;
      }

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
          // Remove the door from the model
          dungeon.doors.splice(dungeon.doors.indexOf(key), 1);
          // Change door's appearance to open
          var door = doors[key];
          door.loadTexture('door_open', door.frame);

          SND_door_open.play();
          // Add delay to move again
          setTimeout(function() {
            player.isMoving = false;
            resolve();
          }, INPUT_DELAY);
          return;
        }

        dungeon.player.x += x;
        dungeon.player.y += y;

        // Entering stairs
        if (dungeon.player.x === dungeon.stairs.x && dungeon.player.y === dungeon.stairs.y) {
          // TODO: Swap stairs out with a portal?
          is_pathing = false;
          SND_teleport.play();
          dungeon.level += 1;
          createDungeon();

          if (dungeon.level > 5) {
            if (MUS_dungeon2.isPlaying === false) {
              MUS_dungeon1.stop();
              MUS_dungeon2.play();
            }
          }
        }

        // Slide the player to their new position
        game.add.tween(player).to({
          x: dungeon.player.x * TILE_SIZE,
          y: dungeon.player.y * TILE_SIZE
        }, INPUT_DELAY, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function() {
          player.isMoving = false;
          resolve();
        }, this);
      } else {
        resolve();
      }
    });
  }

  // Handle input / animations
  function update() {
    if (cursors.left.isDown) {
      is_pathing = false;
      movePlayer(-1, 0);
    } else if (cursors.right.isDown) {
      is_pathing = false;
      movePlayer(1, 0);
    } else if (cursors.up.isDown) {
      is_pathing = false;
      movePlayer(0, -1);
    } else if (cursors.down.isDown) {
      is_pathing = false;
      movePlayer(0, 1);
    } else if (autopilot_key.isDown) {
      is_pathing = false;
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