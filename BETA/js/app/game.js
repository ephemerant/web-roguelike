/*jslint nomen: true */
/*globals _, Promise, ROT, Phaser, game */

// Our ROT-based dungeon model
var dungeon = dungeon,
    // Dictionary of tilesheet indexes
    tiles = dungeon.width,
    // How wide / tall each tile is
    TILE_SIZE = 32,
    // Phaser map where tiles are drawn
    map,
    // A distinct graphical layer on the map
    // TODO: Use multiple layers for tiles, objects, and creatures
    layer,
    
    // Arrow keys
    cursors,
    // Key to start a new game [R]
    reset_key,
    // Key that when held, moves the player towards the end of the level [A]
    autopilot_key,
    // key that toggles fullscreen
    fullscreen_key,
    // key to pause game
    pause_key,
    
    // Square that follows mouse
    marker,
    // The player sprite
    player,
    is_pathing = false,
    // Dictionary of door sprites by (x,y)
    doors = {},
    
    //These variables are for volume control.
    //TODO: Allow user to choose volume.
    sound_volume = 0.4,
    music_volume = 0.1,
    //Sounds
    SND_door_open,
    SND_teleport,
    //Music
    MUS_dungeon1,
    MUS_dungeon2,
    
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
            pause_key = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
            game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            fullscreen_key = game.input.keyboard.addKey(Phaser.Keyboard.ESC);
            fullscreen_key.onDown.add(this.gofull, this);

            reset_key = game.input.keyboard.addKey(Phaser.Keyboard.R);
            reset_key.onDown.add(this.createWorld, this);

            // Our painting marker
            marker = game.add.graphics();
            marker.lineStyle(2, '#050505', 1);
            marker.drawRect(0, 0, 32, 32);

            game.input.addMoveCallback(this.updateMarker, this);
            game.input.onDown.add(this.mouseClicked, this);

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

        updateMarker: function () {
            'use strict';
            marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
            marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;
        },

        mouseClicked: function () {
            'use strict';
            // Cancel current path, if there is one
            if (is_pathing) {
                is_pathing = false;
                return;
            // Add a input listener that can help us return from being paused
            } else if (game.paused) {
                game.paused = false;
            }
            // Standard procedure
            var x = layer.getTileX(game.input.activePointer.worldX),
                y = layer.getTileY(game.input.activePointer.worldY);
            is_pathing = true;
            this.moveToTile(x, y);
        },

        // Attempt to traverse the entire path to (x, y)
        moveToTile: function (x, y) {
            'use strict';
            if (player.isMoving ||
                    (dungeon.player.x === x && dungeon.player.y === y) ||
                    dungeon.tiles[x + ',' + y] === undefined ||
                    is_pathing === false) {
                is_pathing = false;
                return;
            }

            // Recursively move towards the tile
            this.moveTowardsTile(x, y).then(function () {
                this.moveToTile(x, y);
            });

        },

        // Move one step towards (x, y), if it is a valid tile
        moveTowardsTile: function (x, y) {
            'use strict';
            return new Promise(function (resolve, reject) {
                if (player.isMoving || dungeon.tiles[x + ',' + y] === undefined) {
                    resolve();
                    return;
                }
                // Input callback informs about map structure
                var passableCallback = function (x, y) {
                        return (dungeon.tiles[x + "," + y] !== undefined);
                    },
                    // Prepare path towards tile
                    astar = new ROT.Path.AStar(x, y, passableCallback, {
                        topology: 4
                    }),
                    count = 0;
                // Compute from player
                astar.compute(dungeon.player.x, dungeon.player.y, function (x, y) {
                    count += 1;
                    // Only move once
                    if (count === 2) {
                        var _x = x - dungeon.player.x,
                            _y = y - dungeon.player.y;
                        this.movePlayer(_x, _y).then(resolve);
                    }
                });
            });
        },

        // Move player one step towards the stairs (used to test pathing)
        autoPilot: function () {
            'use strict';
            this.moveTowardsTile(dungeon.stairs.x, dungeon.stairs.y);
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
                var xy = key.split(','),
                    door = game.add.sprite(xy[0] * TILE_SIZE, xy[1] * TILE_SIZE, 'door', 0);

                // Door of a vertical wall?
                if (dungeon.tiles[(+xy[0] + 1) + ',' + (+xy[1])] !== undefined && dungeon.tiles[(+xy[0] - 1) + ',' + (+xy[1])] !== undefined) {
                    door.frame = 1;
                }

                doors[key] = door;
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

            player = game.add.sprite(dungeon.player.x * TILE_SIZE, dungeon.player.y * TILE_SIZE, playerClass, 0);
            player.animations.add('left', [4, 5, 6, 7], 10, true);
            player.animations.add('right', [8, 9, 10, 11], 10, true);
            player.animations.add('up', [12, 13, 14, 15], 10, true);
            player.animations.add('down', [0, 1, 2, 3], 10, true);
            game.camera.follow(player);
        },

        placeTile: function (tile, x, y) {
            'use strict';
            map.putTile(tile, x, y, layer);
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
            _.each(doors, function (sprite, key) {
                sprite.destroy();
            });

            doors = {};
        },

        // Add (x, y) to the player's position if it is a valid move
        movePlayer: function (x, y) {
            'use strict';
            return new Promise(function (resolve, reject) {
                if (player.isMoving || (x === 0 && y === 0)) {
                    resolve();
                    return;
                }

                var newX = dungeon.player.x + x,
                    newY = dungeon.player.y + y,
                    key = newX + ',' + newY,
                    door;

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
                        door = doors[key];
                        door.loadTexture('door_open', door.frame);

                        SND_door_open.play();
                        // Add delay to move again
                        setTimeout(function () {
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
                        resolve();
                    }, this);
                } else {
                    resolve();
                }
            });
        },

        // Handle input / animations
        update: function () {
            'use strict';
            if (cursors.left.isDown) {
                is_pathing = false;
                this.movePlayer(-1, 0);
            } else if (cursors.right.isDown) {
                is_pathing = false;
                this.movePlayer(1, 0);
            } else if (cursors.up.isDown) {
                is_pathing = false;
                this.movePlayer(0, -1);
            } else if (cursors.down.isDown) {
                is_pathing = false;
                this.movePlayer(0, 1);
            } else if (autopilot_key.isDown) {
                is_pathing = false;
                this.autoPilot();
            } else if (pause_key.isDown) {
                game.paused = true;
            } else {
                if (!player.isMoving) {
                    player.animations.stop();
                }
            }
            // Stretch to fill
            //game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
            //game.input.onDown.add(this.gofull, this);
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
        }
    };