/*jslint nomen: true */
/*globals _ */

var map,
    // A distinct graphical layer on the map
    // TODO: Use multiple layers for tiles, objects, and creatures
    layer,
    // Arrow keys
    cursors,
    // Key to start a new game [R]
    reset_key,
    // Key that when held, moves the player towards the end of the level [A]
    autopilot_key,
    // The player sprite
    player,
    //These variables are for volume control.
    //TODO: Allow user to choose volume.
    sound_volume = 0.75,
    music_volume = 0.15,
    //Sounds
    SND_door_open,
    SND_teleport,
    //Music
    MUS_dungeon1,
    MUS_dungeon2,
    game = game,
    Phaser = Phaser,
    ROT = ROT,
    // Our ROT-based dungeon model
    dungeon = dungeon,
    // Dictionary of tilesheet indexes
    tiles = dungeon.width,
    // How wide / tall each tile is
    TILE_SIZE = 32,
    // Width / height of the actual window
    // TODO: Completely fill window with game screen?
    SCREEN_WIDTH = window.innerWidth * window.devicePixelRatio,
    SCREEN_HEIGHT = window.innerHeight * window.devicePixelRatio,
    DUNGEON_WIDTH = dungeon.width * TILE_SIZE,
    DUNGEON_HEIGHT = dungeon.width * TILE_SIZE,
    INPUT_DELAY = 80,
    TILESHEET_WIDTH = 640,
    TILE_UNIT = TILESHEET_WIDTH / TILE_SIZE,
    // Wall group to use from Wall.png
    WALL_GROUP_UNIT,
    tiles = this.calculateTiles(),
    // List of cross tiles, used for auto-joining
    crosses = [tiles.wall_cross_bottom,
               tiles.wall_cross_top,
               tiles.wall_cross_left,
               tiles.wall_cross_right,
               tiles.wall_cross],

    Game = {

        preload: function () {
            'use strict';
            // Here we load all the needed resources for the level.
        },

        create: function () {
            'use strict';
            // Increase bounds so camera can move around
            game.world.setBounds(-DUNGEON_WIDTH, -DUNGEON_HEIGHT, DUNGEON_WIDTH * 3, DUNGEON_HEIGHT * 3);
            game.stage.backgroundColor = '#050505';
            game.stage.smoothed = false;

            // Creates a blank tilemap
            map = game.add.tilemap(null, TILE_SIZE, TILE_SIZE);

            // Add a Tileset image to the map
            map.addTilesetImage('dungeon');

            // Creates a new blank layer and sets the map dimensions.
            layer = map.create('level1', dungeon.width, dungeon.height, TILE_SIZE, TILE_SIZE);
            this.createWorld();
            cursors = game.input.keyboard.createCursorKeys();
            autopilot_key = game.input.keyboard.addKey(Phaser.Keyboard.A);
            reset_key = game.input.keyboard.addKey(Phaser.Keyboard.R);
            reset_key.onDown.add(this.createWorld, this);

            //create Sounds
            SND_door_open = game.add.audio('SND_door_open');
            SND_teleport = game.add.audio('SND_teleport');
            SND_teleport.volume = SND_door_open.volume = sound_volume;

            //create Music
            MUS_dungeon1 = game.add.audio('MUS_dungeon1');
            MUS_dungeon1.loop = true;
            MUS_dungeon1.volume = music_volume;
            MUS_dungeon1.play();
            MUS_dungeon2 = game.add.audio('MUS_dungeon2');
            MUS_dungeon2.loop = true;
            MUS_dungeon2.volume = music_volume;
        },

        // Move player one step towards the stairs (used to test pathing)
        autoPilot: function () {
            'use strict';
            if (player.isMoving) {
                return;
            }

            // Input callback informs about map structure
            var passableCallback = function (x, y) {
                    return (dungeon.tiles[x + "," + y] !== undefined);
                },
                // Prepare path to stairs
                astar = new ROT.Path.AStar(dungeon.stairs.x, dungeon.stairs.y, passableCallback, {
                    topology: 4
                }),
                exit = 0;

            // Compute from player
            astar.compute(dungeon.player.x, dungeon.player.y, function (x, y) {
                exit += 1;
                // Only move once
                if (exit !== 2) {
                    return;
                }
                var _x = x - dungeon.player.x,
                    _y = y - dungeon.player.y;
                this.movePlayer(_x, _y);
            });
        },

        createWorld: function () {
            'use strict';
            dungeon.level = 1;
            this.createDungeon();
            this.createPlayer();
        },

        createDungeon: function () {
            'use strict';
            this.removeTiles();

            dungeon._init();

            // Place tiles
            _.each(dungeon.tiles, function (tile, key) {
                var xy = key.split(',');
                map.putTile(tile, xy[0], xy[1]);
            });

            // Place walls
            _.each(dungeon.walls, function (tile, key) {
                var xy = key.split(',');
                map.putTile(tile, xy[0], xy[1]);
            });

            // Place doors
            _.each(dungeon.doors, function (key) {
                var xy = key.split(',');
                map.putTile(tiles.door, xy[0], xy[1]);
            });

            // Place stairs
            map.putTile(tiles.stairs, dungeon.stairs.x, dungeon.stairs.y);
        },

        createPlayer: function () {
            'use strict';
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
        },

        // Clear the map of all tiles
        removeTiles: function () {
            'use strict';
            // Tiles
            _.each(dungeon.tiles, function (tile, key) {
                var xy = key.split(',');
                map.removeTile(xy[0], xy[1], layer);
            });

            // Walls
            _.each(dungeon.walls, function (tile, key) {
                var xy = key.split(',');
                map.removeTile(xy[0], xy[1], layer);
            });

            // Doors
            _.each(dungeon.doors, function (key) {
                var xy = key.split(',');
                map.removeTile(xy[0], xy[1], layer);
            });
        },

        // Add (x, y) to the player's position if it is a valid move
        movePlayer: function (x, y) {
            'use strict';
            if (player.isMoving) {
                return;
            }
            if (x === 0 && y === 0) {
                return;
            }
            var newX = dungeon.player.x + x,
                newY = dungeon.player.y + y,
                key = newX + ',' + newY;

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
                    map.putTile(tiles.floor, newX, newY);
                    SND_door_open.play();
                    // Add delay to move again
                    setTimeout(function () {
                        player.isMoving = false;
                    }, INPUT_DELAY);
                    return;
                }

                dungeon.player.x += x;
                dungeon.player.y += y;

                // Entering stairs
                if (dungeon.player.x === dungeon.stairs.x && dungeon.player.y === dungeon.stairs.y) {
                    // TODO: Swap stairs out with a portal?
                    SND_teleport.play();
                    dungeon.level += 1;
                    this.createDungeon();

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
                }, INPUT_DELAY, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function () {
                    player.isMoving = false;
                }, this);
            }
        },

        update: function () {
            'use strict';
            // Handle arrow key presses, while not allowing illegal direction changes that will kill the player.
            if (cursors.left.isDown) {
                this.movePlayer(-1, 0);
                player.play('left');
            } else if (cursors.right.isDown) {
                this.movePlayer(1, 0);
                player.play('right');
            } else if (cursors.up.isDown) {
                this.movePlayer(0, -1);
                player.play('up');
            } else if (cursors.down.isDown) {
                this.movePlayer(0, 1);
                player.play('down');
            } else if (autopilot_key.isDown) {
                this.autoPilot();
            } else {
                if (!player.isMoving) {
                    player.animations.stop();
                }
            }
            // Stretch to fill
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            game.input.onDown.add(this.gofull, this);

        },

        gofull: function () {
            'use strict';
            if (game.scale.isFullScreen) {
                game.scale.stopFullScreen();
            } else {
                game.scale.startFullScreen(false);
            }

        },

        // Where each frame is rendered
        render: function () {
            'use strict';
            game.debug.text('Level ' + dungeon.level, 16, 30);
            game.debug.text('Use the ARROW KEYS to move', 16, game.height - 90);
            game.debug.text('Press R to start a new game', 16, game.height - 60);
            game.debug.text('Hold A for auto-pilot', 16, game.height - 30);
        },

        calculateTiles: function () {
            'use strict';
            return {
                floor: 15,
                door: 30,
                stairs: 34,
                wall_vertical: 20 + WALL_GROUP_UNIT,
                wall_horizontal: 1 + WALL_GROUP_UNIT,
                // Corner pieces
                wall_top_right: 2 + WALL_GROUP_UNIT,
                wall_bottom_right: 42 + WALL_GROUP_UNIT,
                wall_top_left: WALL_GROUP_UNIT,
                wall_bottom_left: 40 + WALL_GROUP_UNIT,
                // Cross pieces
                wall_cross_bottom: 44 + WALL_GROUP_UNIT,
                wall_cross_top: 4 + WALL_GROUP_UNIT,
                wall_cross_left: 23 + WALL_GROUP_UNIT,
                wall_cross_right: 25 + WALL_GROUP_UNIT,
                wall_cross: 24 + WALL_GROUP_UNIT
            };
        }
    };
