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

        // Keys
        // Arrow keys
        cursors,
        // Key to start a new game [R]
        reset_key,
        // Key that when held, moves the player towards the end of the level [A]
        autopilot_key,
        // Key to go fullscreen
        fullscreen_key,
        // Key to open inventory
        inventory_key,

        fullscreen_button,
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
        // UI
        text_health,
        text_mana,

        inventory = {
            item: [],
            inventoryTiles: [],
            label: [],
            menuIsOpen: false
        },

        shadows = {},

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

                vm.stage.backgroundColor = 'black';

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

                // Set Keys
                cursors = vm.input.keyboard.createCursorKeys();
                autopilot_key = vm.input.keyboard.addKey(Phaser.Keyboard.A);
                reset_key = vm.input.keyboard.addKey(Phaser.Keyboard.R);
                reset_key.onDown.add(vm.createWorld, this);
                fullscreen_key = vm.input.keyboard.addKey(Phaser.Keyboard.F);
                fullscreen_key.onDown.add(vm.gofull, this);
                vm.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
                inventory_key = vm.input.keyboard.addKey(Phaser.Keyboard.I);
                inventory_key.onDown.add(vm.openInventory, this);

                // Our painting marker
                marker = vm.add.graphics();
                marker.lineStyle(2, 'black', 1);
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
                    font: 'bold 16pt "Lucida Sans Typewriter"',
                    fill: 'white',
                    align: 'left'
                };

                // Health
                text_health = Game.add.text(5, 5, '', style);
                text_health.stroke = "black";
                text_health.strokeThickness = 6;
                // Make text starting at index 3 red
                text_health.addColor('red', 3);
                // Move text with camera
                text_health.fixedToCamera = true;

                // Mana
                text_mana = Game.add.text(5, 25, '', style);
                text_mana.stroke = "black";
                text_mana.strokeThickness = 6;
                // Make text starting at index 3 blue
                text_mana.addColor('blue', 3);
                // Move text with camera
                text_mana.fixedToCamera = true;

                fullscreen_button = Game.add.button(SCREEN_WIDTH - 64, 0, 'fullscreen', this.gofull, this);
                fullscreen_button.fixedToCamera = true;
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
                if (is_pathing || inventory.menuIsOpen) {
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
                // Recreate player
                dungeon.playerStats = creatures.player();

                vm.createDungeon();
                vm.createPlayer();

                vm.lightPath(dungeon.player.x, dungeon.player.y, dungeon.playerStats.vision * TILE_SIZE);
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

                // Place shadows
                vm.renderShadow();
            },

            /**
             * Create the player and place its sprite, and attach the camera to it
             * @function createPlayer
             */
            createPlayer: function() {
                // Used to avoid conflicts
                var vm = this;

                dungeon.player.sprite = vm.add.sprite(dungeon.player.x * TILE_SIZE,
                    dungeon.player.y * TILE_SIZE,
                    dungeon.playerStats.class, 0);

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

            displayText: function(value, x, y, style, fixed, speed, rise) {

                if (speed === undefined) {
                    speed = 1;
                }

                var text = Game.add.text(x, y, value, style);
                text.stroke = "black";
                text.strokeThickness = 6;

                if (fixed === true) {
                    text.fixedToCamera = true;
                }

                text.anchor.setTo(0.5);
                text.alpha = 0;

                // Fade text in, wait, fade it out, delete it
                Game.add.tween(text).to({
                    alpha: 1
                }, 750 * speed, 'Linear', true).onComplete.add(function() {
                    setTimeout(function() {
                        Game.add.tween(text).to({
                            alpha: 0
                        }, 1000 * speed, 'Linear', true).onComplete.add(function() {
                            text.destroy();
                        });
                    }, 500 * speed);
                });

                if (rise === true) {
                    if (fixed === true) {
                        Game.add.tween(text.cameraOffset).to({
                            y: text.cameraOffset.y - 20
                        }, 750 * speed, 'Linear', true);
                    } else {
                        Game.add.tween(text).to({
                            y: text.y - 20
                        }, 750 * speed, 'Linear', true);
                    }
                }

                //
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
                        result = dungeon._moveCreature(dungeon.player, x, y),
                        door,
                        remitem,
                        turn,
                        kill_key;

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

                    // The player moved
                    if (result.moved) {
                        dungeon.player.isMoving = true;
                        turn = dungeon.playerStats.turnTick();
                        if (turn.poison) {
                            // Display poison damage
                            Game.displayText(turn.poison, SCREEN_WIDTH / 2 + 15, SCREEN_HEIGHT / 2, {
                                font: 'bold 18pt "Lucida Sans Typewriter"',
                                fill: 'green',
                                align: 'center'
                            }, true, 0.5, true);
                        }

                        // Entering stairs
                        if (dungeon.player.x === dungeon.stairs.x && dungeon.player.y === dungeon.stairs.y) {
                            // TODO: Swap stairs out with a portal?
                            is_pathing = false;
                            SND_teleport.play();
                            dungeon.level += 1;
                            Game.createDungeon();
                            Game.displayText('LEVEL ' + dungeon.level, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 3, {
                                font: 'bold 36pt "Lucida Sans Typewriter"',
                                fill: 'white',
                                align: 'center'
                            }, true);
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
                    } else {
                        is_pathing = false;
                        resolve();
                    }

                    if (result.combat) {
                        SND_hit.play();
                        is_pathing = false;

                        if (result.monster !== undefined) {
                            // Display damage to monster
                            Game.displayText(result.damageToMonster,
                                             result.monster.x * TILE_SIZE + 15,
                                             result.monster.y * TILE_SIZE, {
                                font: 'bold 18pt "Lucida Sans Typewriter"',
                                fill: 'red',
                                align: 'center'
                            }, false, 0.5, true);
                            // Was the monster killed?
                            if (result.kill) {
                                // Remove its sprite - can add a special condition for skeletons

                                result.monster.sprite.destroy();

                                // Add bones
                                kill_key = result.monster.x + ',' + result.monster.y;

                                if (bones[kill_key] === undefined) {
                                    bones[kill_key] = Game.add.sprite(result.monster.x *
                                        TILE_SIZE, result.monster.y *
                                        TILE_SIZE, 'objects', 24);
                                    bones[kill_key].sendToBack();
                                    bones[kill_key].moveUp();
                                }
                            }
                        }

                        // Add delay for next attack - longer than movement delay to avoid accidental attacks
                        dungeon.player.isMoving = true;

                        setTimeout(function() {
                            dungeon.player.isMoving = false;
                            resolve();
                        }, INPUT_DELAY * 4);

                    }

                    if (result.drop === true) {
                        // Monster dropped an item
                        loot[key] = Game.add.sprite(newX * TILE_SIZE,
                            newY * TILE_SIZE,
                            result.droppedItem.sprite,
                            result.droppedItem.frame);
                        loot[key].sendToBack();
                        loot[key].moveUp();
                    }

                    if (result.item) {
                        // Picked up an item
                        SND_item.play();
                        remitem = loot[key];
                        if (remitem) {
                            remitem.destroy();
                        }
                        // Display item found
                        Game.displayText(result.gotitem.name, SCREEN_WIDTH / 2 + 15, SCREEN_HEIGHT / 2, {
                            font: 'bold 18pt "Lucida Sans Typewriter"',
                            fill: 'yellowgreen',
                            align: 'center'
                        }, true, 0.5, true);
                    }

                    if (result.action) {
                        var tick = dungeon._tick();

                        tick.movedMonsters.forEach(function(monster) {
                            Game.add.tween(monster.sprite).to({
                                x: monster.x * TILE_SIZE,
                                y: monster.y * TILE_SIZE
                            }, INPUT_DELAY, Phaser.Easing.Quadratic.InOut, true);
                        });

                        if (tick.damageToPlayer > 0) {
                            Game.displayText(tick.damageToPlayer, SCREEN_WIDTH / 2 + 15, SCREEN_HEIGHT / 2, {
                                font: 'bold 18pt "Lucida Sans Typewriter"',
                                fill: 'yellow',
                                align: 'center'
                            }, true, 0.5, true);
                        }

                    }

                    Game.lightPath(dungeon.player.x, dungeon.player.y, dungeon.playerStats.vision * TILE_SIZE);

                });
            },

            /**
             * adds black tiles over entire dungeon
             * @function renderShadow
             */
            renderShadow: function() {
                var x, y;

                for (x = 0; x < DUNGEON_WIDTH; x += TILE_SIZE) {
                    for (y = 0; y < DUNGEON_HEIGHT; y += TILE_SIZE) {
                        // No point in creating duplicate sprites
                        shadows[dungeon._keyFrom(x, y)] = shadows[dungeon._keyFrom(x, y)] || this.add.sprite(x, y, 'shadow');
                        // Reset shadows on floor changes
                        shadows[dungeon._keyFrom(x, y)].bringToTop();
                        shadows[dungeon._keyFrom(x, y)].alpha = 1;
                    }
                }
            },

            /**
             * Clear all shadow sprites, called on game over
             */
            clearShadows: function() {
                for (var i in shadows) {
                    shadows[i].destroy();
                }
                shadows = {};
            },

            /**
             * lights dungeon around player, called after movement
             * @param  {number} emiterX           The x location of the emiter
             * @param  {number} emiterY           The y location of the emiter
             * @param  {number} range             The radius of the light emited
             * @function lightPath
             */
            lightPath: function(emiterX, emiterY, range) {
                var x, y, alpha;

                // Array of tiles in player's actual FOV
                var canSee = dungeon._fovFrom(emiterX, emiterY, range / TILE_SIZE);

                // calculate tiles within player's visible range
                // TODO: This can be made more efficient
                for (x = emiterX * TILE_SIZE - range; x < emiterX * TILE_SIZE + range; x += TILE_SIZE) {
                    for (y = emiterY * TILE_SIZE - range; y < emiterY * TILE_SIZE + range; y += TILE_SIZE) {
                        if (_.contains(canSee, dungeon._keyFrom(x / TILE_SIZE, y / TILE_SIZE))) {
                            // alpha equals the distance of tile from player, divided by their vision
                            alpha = Math.sqrt(Math.pow(x - emiterX * TILE_SIZE, 2) +
                                              Math.pow(y - emiterY * TILE_SIZE, 2))/range;
                            // In case a shadow somehow hasn't been created yet, create it
                            shadows[dungeon._keyFrom(x, y)] = shadows[dungeon._keyFrom(x, y)] || this.add.sprite(x, y, 'shadow');
                            // Set alpha based on distance from player
                            shadows[dungeon._keyFrom(x, y)].alpha = Math.min(alpha, shadows[dungeon._keyFrom(x, y)].alpha);
                        }
                    }
                }
            },

            /**
             * called by inventory button to use selected item if possible
             * @function useItem
             */
            useItem: function(index) {
              /*
              if(inventory.useItem() === 1){
                return 1;
              }
              else {
                return 0;
              }
              */
            },

            /**
             * View inventory
             * @function openInventory
             */
            openInventory: function() {
                var i, x, y, tempItem, style;
                // Close inventory if it is open, otherwise close it
                if (inventory.menuIsOpen) {
                    for (i = 0; i < dungeon.playerStats.inventory.length; i += 1) {
                        inventory.label[i].destroy();
                        inventory.item[i].destroy();
                        inventory.inventoryTiles[i].destroy();
                    }
                    // Menu is closed
                    inventory.menuIsOpen = false;
                } else {
                    for (i = 0; i < dungeon.playerStats.inventory.length; i += 1) {
                        if (i < 5) {
                            x = 200 + (i * 100);
                            y = 400;
                        } else {
                            x = 200 + ((i - 5) * 100);
                            y = 500;
                        }
                        // Inventory buttons
                        inventory.inventoryTiles[i] = this.add.button(x, y, 'inventoryTile');
                        inventory.inventoryTiles[i].anchor.setTo(0.5, 0.5);
                        inventory.inventoryTiles[i].fixedToCamera = true;
                        // item sprites
                        tempItem = dungeon.playerStats.inventory[i];
                        inventory.item[i] = this.add.sprite(x, y - 15, tempItem.sprite, tempItem.frame);
                        inventory.item[i].anchor.setTo(0.5, 0.5);
                        inventory.item[i].fixedToCamera = true;
                        // Item Labels
                        style = {
                            font: 'bold 12pt "Lucida Sans Typewriter"',
                            fill: 'white',
                            align: 'center',
                            wordWrap: true
                        };
                        inventory.label[i] = Game.add.text(x, y + 15, tempItem.name, style);
                        inventory.label[i] .lineSpacing = -10;
                        inventory.label[i].stroke = "black";
                        inventory.label[i].strokeThickness = 2;
                        inventory.label[i].fixedToCamera = true;
                        inventory.label[i].anchor.setTo(0.5);
                        // Menu is open
                        inventory.menuIsOpen = true;
                    }
                }
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

            /**
             * Game Over on player death
             * @function gameOver
             */
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
                Game.clearShadows();
            },

            /**
             * Handle input / animations
             * @function update
             */
            update: function() {
                // Used to avoid conflicts
                var vm = this;

                // Check keyboard input and if Inventory is open
                if (cursors.left.isDown && !inventory.menuIsOpen) {
                    is_pathing = false;
                    vm.movePlayer(-1, 0);
                } else if (cursors.right.isDown && !inventory.menuIsOpen) {
                    is_pathing = false;
                    vm.movePlayer(1, 0);
                } else if (cursors.up.isDown && !inventory.menuIsOpen) {
                    is_pathing = false;
                    vm.movePlayer(0, -1);
                } else if (cursors.down.isDown && !inventory.menuIsOpen) {
                    is_pathing = false;
                    vm.movePlayer(0, 1);
                } else if (autopilot_key.isDown && !inventory.menuIsOpen) {
                    is_pathing = false;
                    vm.autoPilot();
                } else if (!dungeon.player.isMoving) {
                    dungeon.player.sprite.animations.stop();
                }

                if (inventory.menuIsOpen === true){
                  //inventory.inventoryTiles[i]
                  inventory.inventoryTiles.forEach(function(item) {
                      //console.log(item.name);
                  });
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
                text_mana.text = 'MP: ' + dungeon.playerStats.mp + ' / ' + dungeon.playerStats.max_mp;
                text_mana.bringToTop();
                fullscreen_button.bringToTop();
            }
        };

    return Game;
});
