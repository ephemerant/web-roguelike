/*globals define, Promise*/
/*jslint nomen: true */

define(['Phaser', 'lodash', 'dungeon', 'ROT'], function(Phaser, _, Dungeon, ROT) {

    'use strict';

    // Dictionary of tilesheet indexes
    var tiles = Dungeon.tiles,
        // Creature types
        creatures = Dungeon.creatures,
        // Item types
        items = Dungeon.loot,
        // How wide / tall each tile is
        TILE_SIZE = Dungeon.TILE_SIZE,
        // Our ROT-based dungeon model
        dungeon = Dungeon.dungeon,

        // Width / height of the actual window
        // TODO: Completely fill window with game screen?
        SCREEN_WIDTH = 800,
        SCREEN_HEIGHT = 600,

        DUNGEON_WIDTH = dungeon.width * TILE_SIZE,
        DUNGEON_HEIGHT = dungeon.width * TILE_SIZE,

        INPUT_DELAY = 80,

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
        // Key to go fullscreen
        fullscreen_key,
        // Square that follows mouse
        marker,

        // TODO: Make a player/creature variable
        // Currently automatically moving?
        is_pathing = false,

        // Dictionary of door sprites by (x,y)
        doors = {},
        bones = {},
        loot = {},

        //These variables are for volume control.
        //TODO: Allow user to choose volume.
        sound_volume = 0.4,
        music_volume = 0.1,
        //Sounds
        SND_door_open,
        SND_teleport,
        SND_hit,
        SND_item,
        //Music
        MUS_dungeon1,
        MUS_dungeon2,
        //
        text_health,
        text_mana,

        Game = {

            /**
             * @module  game
             */

            /**
             * Initialize the phaser game
             * @function create
             */
            create: function() {
                // Used to avoid conflicts
                var vm = this,
                    style;
                // Increase bounds so camera can move outside the map boundaries
                vm.world.setBounds(-DUNGEON_WIDTH, -DUNGEON_HEIGHT,
                    DUNGEON_WIDTH * 3,
                    DUNGEON_HEIGHT * 3);

                vm.stage.backgroundColor = '#050505';

                // Creates a blank tilemap
                map = vm.add.tilemap(null, TILE_SIZE, TILE_SIZE);

                // Add a Tileset image to the map
                map.addTilesetImage('dungeon');

                // Creates a new blank layer and sets the map dimensions.
                layer = map.create('level1',
                    dungeon.width,
                    dungeon.height,
                    TILE_SIZE,
                    TILE_SIZE);

                // Create Music
                MUS_dungeon1 = vm.add.audio('MUS_dungeon1');
                MUS_dungeon1.loop = true;
                MUS_dungeon1.volume = music_volume;
                MUS_dungeon2 = vm.add.audio('MUS_dungeon2');
                MUS_dungeon2.loop = true;
                MUS_dungeon2.volume = music_volume;

                vm.createWorld();

                cursors = vm.input.keyboard.createCursorKeys();

                autopilot_key = vm.input.keyboard.addKey(Phaser.Keyboard.A);

                reset_key = vm.input.keyboard.addKey(Phaser.Keyboard.R);
                reset_key.onDown.add(vm.createWorld, this);

                fullscreen_key = vm.input.keyboard.addKey(Phaser.Keyboard.F);
                fullscreen_key.onDown.add(vm.gofull, this);
                vm.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;

                // Our painting marker
                marker = vm.add.graphics();
                marker.lineStyle(2, '#050505', 1);
                marker.drawRect(0, 0, 32, 32);

                vm.input.addMoveCallback(vm.updateMarker, this);
                vm.input.onDown.add(vm.mouseClicked, this);

                // Create Sounds
                SND_door_open = vm.add.audio('SND_door_open');
                SND_teleport = vm.add.audio('SND_teleport');
                SND_hit = vm.add.audio('SND_hit');
                SND_item = vm.add.audio('SND_item');
                SND_hit.volume = SND_teleport.volume = SND_door_open.volume = sound_volume;

                // Text
                style = {
                    font: 'bold 16pt Monospace',
                    fill: 'white',
                    align: 'left'
                };

                // Health
                text_health = Game.add.text(5, 5, '', style);

                text_health.stroke = "#000";
                text_health.strokeThickness = 6;

                // Make text starting at index 3 red
                text_health.addColor('#f20', 3);

                // Move text with camera
                text_health.fixedToCamera = true;

                // Mana
                text_mana = Game.add.text(5, 25, 'MP: 10 / 10', style);

                text_mana.stroke = "#000";
                text_mana.strokeThickness = 6;

                // Make text starting at index 3 red
                text_mana.addColor('#08f', 3);

                // Move text with camera
                text_mana.fixedToCamera = true;



            },

            /**
             * Move the black marker box to the mouse's position in the map
             * @function updateMarker
             */
            updateMarker: function() {
                // Used to avoid conflicts
                var vm = this;
                marker.x = layer.getTileX(vm.input.activePointer.worldX) * 32;
                marker.y = layer.getTileY(vm.input.activePointer.worldY) * 32;
            },

            /**
             * Take action on a tile, or cancel the current action
             * @function mouseClicked
             */
            mouseClicked: function() {
                // Used to avoid conflicts
                var vm = this,
                    x,
                    y;
                // Cancel current path, if there is one
                if (is_pathing) {
                    is_pathing = false;
                    return;
                }
                // Standard procedure
                x = layer.getTileX(vm.input.activePointer.worldX);
                y = layer.getTileY(vm.input.activePointer.worldY);

                is_pathing = true;

                vm.moveToTile(x, y);
            },

            /**
             * Attempt to traverse the entire path to (x, y)
             * @function moveToTile
             * @param  {number} x
             * @param  {number} y
             */
            moveToTile: function(x, y) {
                // Used to avoid conflicts
                var vm = this;
                if (dungeon.player.isMoving ||
                    (dungeon.player.x === x && dungeon.player.y === y) ||
                    dungeon.tiles[x + ',' + y] === undefined ||
                    is_pathing === false) {
                    is_pathing = false;
                    return;
                }

                // Recursively move towards the tile
                vm.moveTowardsTile(x, y).then(function() {
                    Game.moveToTile(x, y);
                });
            },

            /**
             * Move one step towards (x, y), if it is a valid tile
             * @function moveTowardsTile
             * @param  {number} x
             * @param  {number} y
             */
            moveTowardsTile: function(x, y) {
                return new Promise(function(resolve, reject) {
                    if (dungeon.player.isMoving ||
                        dungeon.tiles[x + ',' + y] === undefined) {
                        resolve();
                        return;
                    }

                    // Input callback informs about map structure
                    var passableCallback = function(x, y) {
                            return (dungeon.tiles[x + "," + y] !== undefined);
                        },

                        // Prepare path towards tile
                        astar = new ROT.Path.AStar(x, y, passableCallback, {
                            topology: 4
                        }),

                        count = 0;

                    // Compute from player
                    astar.compute(dungeon.player.x, dungeon.player.y, function($x, $y) {
                        count += 1;
                        // Only move once
                        if (count === 2) {
                            var _x = $x - dungeon.player.x,
                                _y = $y - dungeon.player.y;

                            Game.movePlayer(_x, _y).then(function() {
                                // If we bumped the goal tile, stop
                                // (e.g. bump to open a door, but don't walk into it after)
                                // This will be very useful to avoid
                                // clicking a monster and infinitely attacking it
                                if ($x === x && $y === y) {
                                    is_pathing = false;
                                }

                                resolve();
                            });
                        }
                    });
                });
            },

            /**
             * Move player one step towards the stairs (used to test pathing)
             * @function autoPilot
             */
            autoPilot: function() {
                // Used to avoid conflicts
                var vm = this;
                vm.moveTowardsTile(dungeon.stairs.x, dungeon.stairs.y);
            },

            /**
             * Create the dungeon and player
             * @function createWorld
             */
            createWorld: function() {
                // Used to avoid conflicts
                var vm = this;
                dungeon.level = 1;
                MUS_dungeon2.stop();
                MUS_dungeon1.play();

                if (dungeon.player !== undefined) {
                    dungeon.player.sprite.destroy();
                }

                vm.createDungeon();
                vm.createPlayer();

                // Recreate player
                dungeon.playerStats = creatures.player();
            },

            /**
             * Generate a new floor<br>
             * i.e. place tiles, walls, doors, monsters, items, stairs
             * @function createDungeon
             */
            createDungeon: function() {
                // Used to avoid conflicts
                var vm = this;

                is_pathing = false;

                vm.removeTiles();

                dungeon._init();

                // Place tiles
                _.each(dungeon.tiles, function(tile, key) {
                    var xy = key.split(',');
                    Game.placeTile(tile, xy[0], xy[1]);
                });

                // Place walls
                _.each(dungeon.walls, function(tile, key) {
                    var xy = key.split(',');
                    Game.placeTile(tile, xy[0], xy[1]);
                });

                // Place doors
                _.each(dungeon.doors, function(key) {
                    var xy = key.split(','),
                        door = Game.add.sprite(xy[0] *
                            TILE_SIZE, xy[1] *
                            TILE_SIZE, 'door', 0);

                    // Door of a vertical wall?
                    if (dungeon.tiles[(+xy[0] + 1) + ',' + (+xy[1])] !== undefined &&
                        dungeon.tiles[(+xy[0] - 1) + ',' + (+xy[1])] !== undefined) {
                        door.frame = 1;
                    }
                    doors[key] = door;
                });

                // Place monsters
                dungeon.monsters.forEach(function(monster) {
                    monster.sprite = Game.add.sprite(monster.x * TILE_SIZE,
                        monster.y * TILE_SIZE,
                        monster.sprite,
                        monster.frame);
                });

                // Place items
                dungeon.loot.forEach(function(item) {
                    var key = item.x + ',' + item.y,
                        sprite = Game.add.sprite(item.x * TILE_SIZE,
                            item.y * TILE_SIZE,
                            item.sprite,
                            item.frame);

                    loot[key] = sprite;
                });

                // Place stairs
                vm.placeTile(tiles.stairs, dungeon.stairs.x, dungeon.stairs.y);
            },

            /**
             * Create the player and place its sprite, and attach the camera to it
             * @function createPlayer
             */
            createPlayer: function() {
                // Used to avoid conflicts
                var vm = this,

                    // TODO: Fully implement class system
                    playerClass = ['warrior', 'engineer', 'mage', 'paladin', 'rogue'][_.random(4)];

                dungeon.player.sprite = vm.add.sprite(dungeon.player.x * TILE_SIZE,
                    dungeon.player.y * TILE_SIZE,
                    playerClass, 0);
                dungeon.player.sprite.animations.add('left', [4, 5, 6, 7], 10, true);
                dungeon.player.sprite.animations.add('right', [8, 9, 10, 11], 10, true);
                dungeon.player.sprite.animations.add('up', [12, 13, 14, 15], 10, true);
                dungeon.player.sprite.animations.add('down', [0, 1, 2, 3], 10, true);

                vm.camera.follow(dungeon.player.sprite);
            },

            /**
             * Place a tile at (x, y)
             * @function placeTile
             * @param  {number} tile        tilesheet index
             * @param  {[type]} x
             * @param  {[type]} y
             */
            placeTile: function(tile, x, y) {
                map.putTile(tile, x, y, layer);
            },

            /**
             * Remove all tiles / sprites
             * @function removeTiles
             */
            removeTiles: function() {
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

                // Monsters
                _.each(dungeon.monsters, function(monster, key) {
                    monster.sprite.destroy();
                });

                // Doors
                _.each(doors, function(sprite) {
                    sprite.destroy();
                });

                // Bones
                _.each(bones, function(sprite) {
                    sprite.destroy();
                });

                //items
                _.each(loot, function(sprite) {
                    sprite.destroy();
                });

                doors = {};
                bones = {};
                loot = {};
            },

            /**
             * Add (x, y) to the player's position if it is a valid move
             * @function movePlayer
             * @param  {number} x
             * @param  {number} y
             * @return {promise}
             */
            movePlayer: function(x, y) {
                return new Promise(function(resolve, reject) {
                    if (dungeon.player.isMoving || (x === 0 && y === 0)) {
                        resolve();
                        return;
                    }

                    var newX = dungeon.player.x + x,
                        newY = dungeon.player.y + y,
                        key = newX + ',' + newY,
                        result,
                        door,
                        remitem;

                    if (x === 1) {
                        dungeon.player.sprite.play('right');
                    } else if (x === -1) {
                        dungeon.player.sprite.play('left');
                    }
                    if (y === 1) {
                        dungeon.player.sprite.play('down');
                    } else if (y === -1) {
                        dungeon.player.sprite.play('up');
                    }

                    result = dungeon._moveCreature(dungeon.player, x, y);

                    // The player moved
                    if (result.moved) {
                        dungeon.player.isMoving = true;
                        dungeon.playerStats.turnTick();
                        // Entering stairs
                        if (dungeon.player.x === dungeon.stairs.x && dungeon.player.y === dungeon.stairs.y) {
                            // TODO: Swap stairs out with a portal?
                            is_pathing = false;
                            SND_teleport.play();
                            dungeon.level += 1;
                            Game.createDungeon();
                            if (dungeon.level >= 1 && dungeon.level <= 5) {
                                if (MUS_dungeon1.isPlaying === false) {
                                    MUS_dungeon2.stop();
                                    MUS_dungeon1.play();
                                }
                            }
                            if (dungeon.level > 5) {
                                if (MUS_dungeon2.isPlaying === false) {
                                    MUS_dungeon1.stop();
                                    MUS_dungeon2.play();
                                }
                            }
                        }

                        // Slide the player to their new position
                        Game.add.tween(dungeon.player.sprite).to({
                            x: dungeon.player.x * TILE_SIZE,
                            y: dungeon.player.y * TILE_SIZE
                        }, INPUT_DELAY, Phaser.Easing.Quadratic.InOut, true).onComplete.add(function() {
                            dungeon.player.isMoving = false;
                            resolve();
                        }, this);
                        // The player opened a door
                    } else if (result.door) {
                        dungeon.player.isMoving = true;
                        // Change door's appearance to open
                        door = doors[key];
                        door.loadTexture('door_open', door.frame);
                        // Play a sound effect
                        SND_door_open.play();
                        // Add delay until the next action
                        setTimeout(function() {
                            dungeon.player.isMoving = false;
                            resolve();
                        }, INPUT_DELAY);
                        // Combat occurred
                    } else if (result.combat) {
                        SND_hit.play();
                        is_pathing = false;

                        // Was a monster killed?
                        if (result.kill) {
                            // Remove its sprite - can add a special condition for skeletons
                            result.kill.sprite.destroy();

                            // Add bones                            
                            var kill_key = result.kill.x + ',' + result.kill.y;

                            if (bones[kill_key] === undefined) {
                                bones[kill_key] = Game.add.sprite(result.kill.x * TILE_SIZE, result.kill.y * TILE_SIZE, 'objects', 24);
                                dungeon.player.sprite.bringToTop();
                            }
                        }
                        // Add delay for next attack

                        dungeon.player.isMoving = true;

                        setTimeout(function() {
                            dungeon.player.isMoving = false;
                            resolve();
                        }, INPUT_DELAY);
                    } else {
                        is_pathing = false;
                        resolve();
                    }
                    if (result.item) {
                        SND_item.play();
                        remitem = loot[key];
                        remitem.destroy();
                    }
                });
            },

            /**
             * Full screen
             * @function gofull
             */
            gofull: function() {
                // Used to avoid conflicts
                var vm = this;
                if (vm.scale.isFullScreen) {
                    vm.scale.stopFullScreen();
                } else {
                    vm.scale.startFullScreen(false);
                }

            },

            gameOver: function() {
                if (MUS_dungeon1.isPlaying === true) {
                    MUS_dungeon1.stop();
                } else {
                    MUS_dungeon2.stop();
                }
                dungeon.player.isMoving = false;

                // Recreate player
                dungeon.playerStats = creatures.player();

                this.state.start('Game_Over');
            },

            /**
             * Handle input / animations
             * @function update
             */
            update: function() {
                // Used to avoid conflicts
                var vm = this;

                // Check keyboard input
                if (cursors.left.isDown) {
                    is_pathing = false;
                    vm.movePlayer(-1, 0);
                } else if (cursors.right.isDown) {
                    is_pathing = false;
                    vm.movePlayer(1, 0);
                } else if (cursors.up.isDown) {
                    is_pathing = false;
                    vm.movePlayer(0, -1);
                } else if (cursors.down.isDown) {
                    is_pathing = false;
                    vm.movePlayer(0, 1);
                } else if (autopilot_key.isDown) {
                    is_pathing = false;
                    vm.autoPilot();
                } else {
                    if (!dungeon.player.isMoving) {
                        dungeon.player.sprite.animations.stop();
                    }
                }

                if (dungeon.playerStats.hp === 0) {
                    this.gameOver();
                }
            },

            /**
             * Where each frame is rendered
             * @function render
             */
            render: function() {
                text_health.text = 'HP: ' + dungeon.playerStats.hp + ' / ' + dungeon.playerStats.max_hp;
                text_health.bringToTop();
            }
        };

    return Game;
});