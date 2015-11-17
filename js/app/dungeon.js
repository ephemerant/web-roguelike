/*globals define, console*/
/*jslint nomen: true */

define(['ROT', 'lodash', 'creatures', 'items'], function(ROT, _, creatures, items) {

  'use strict';

  /**
   * The main dungeon module
   * @module dungeon
   */

  /**
   * Calcualte and return a subset of tiles within Wall.png
   * @function calculateTiles
   * @param {number} WALL_GROUP_UNIT - A number between 1-8 that hones in on a group of tiles in Wall.png
   * @return {object} Environment-specific group of tiles
   */
  function calculateTiles(WALL_GROUP_UNIT) {
    return {
      floor: 5 + WALL_GROUP_UNIT,
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

  /**
   * Basic distance formula between two ROT rooms
   * @function distance
   * @param  {room} a
   * @param  {room} b
   * @return {number} distance
   */
  function distance(a, b) {
    return Math.sqrt(Math.pow(a._x1 - b._x1, 2) + Math.pow(a._y1 - b._y1, 2));
  }

  var TILESHEET_WIDTH = 640,
    TILE_SIZE = 32,
    TILE_UNIT = TILESHEET_WIDTH / TILE_SIZE,

    /**
     * List of tiles and their corresponding position in the tile sheet
     * @name tiles
     * @type {array}
     */
    tiles = calculateTiles(TILE_UNIT * 3 * _.random(1, 8)),

    /**
     * List of cross tiles, used for auto-joining walls
     * @name  crosses
     * @type {array}
     */
    crosses = [tiles.wall_cross_bottom,
      tiles.wall_cross_top,
      tiles.wall_cross_left,
      tiles.wall_cross_right,
      tiles.wall_cross
    ],


    /**
     * The main dungeon object, generated by _dungeon
     * @name  dungeon
     * @type {object}
     */
    dungeon;

  /**
   * The dungeon factory
   * @function _dungeon
   * @return {object} A distinct dungeon object
   */
  function _dungeon() {
    /**
     * The dungeon factory
     * @module  dungeon/_dungeon
     */
    return {
      width: 60,
      height: 40,
      loot: [],
      playerStats: creatures.player(), //Create player stat array
      level: 1,
      _init: function() {

        // Used to avoid conflicts
        var vm = this,
          // Used to change the 'area' after a certain amount of levels
          area = 7,
          playerRoom;

        if (this.level >= 6) {
          area = 8;
        }

        tiles = calculateTiles(TILE_UNIT * 3 * area);

        crosses = [tiles.wall_cross_bottom,
          tiles.wall_cross_top,
          tiles.wall_cross_left,
          tiles.wall_cross_right,
          tiles.wall_cross
        ];

        ROT.RNG.setSeed(ROT.RNG.getUniform());

        console.log('Using RNG seed:', vm._getSeed());

        vm.tiles = {};

        vm._generate();

        vm._placeDoors();

        vm._placeWalls();

        vm.rooms = vm.digger.getRooms();

        playerRoom = vm.rooms[_.random(vm.rooms.length - 1)];

        // Sort based on distance from player's room
        vm.rooms.sort(function(a, b) {
          return distance(a, playerRoom) - distance(b, playerRoom);
        });

        vm._spawnPlayer(_.random(playerRoom._x1, playerRoom._x2), _.random(playerRoom._y1, playerRoom._y2));

        vm._spawnStairs();

        vm._spawnMonsters();

        vm._spawnItems();
      },

      /**
       * Get ROT's current seed
       * @return {boolean}
       */
      _getSeed: function() {
        return ROT.RNG.getSeed();
      },

      /**
       * Return true if (x, y) exists in this.tiles
       * @param  {number} x
       * @param  {number} y
       * @return {boolean}
       */
      _validTile: function(x, y) {
        // True if (x, y) is present in tile
        return (this.tiles[x + ',' + y] !== undefined);
      },

      /**
       * Return true if a monster is at (x, y)
       * @param  {number} x
       * @param  {number} y
       * @return {boolean}
       */
      _hasMonster: function(x, y) {
        var hasMonster = false;

        this.monsters.forEach(function(monster) {
          if (monster.x === x && monster.y === y && monster.isDead === 0) {
            hasMonster = true;
          }
        });
        return hasMonster;
      },

      /**
       * Return true if an item exists at (x, y)
       * @param  {number}  x
       * @param  {number}  y
       * @return {boolean}
       */
      _hasItem: function(x, y) {
        var hasItem = false;

        if (this.loot) {
          this.loot.forEach(function(item) {
            if (item.x === x && item.y === y) {
              hasItem = true;
            }
          });
        }
        return hasItem;
      },

      /**
       * Return the monster at (x, y), if there is one
       * @param  {number} x
       * @param  {number} y
       * @return {object}
       */
      _getMonster: function(x, y) {
        var foundMonster;

        this.monsters.forEach(function(monster) {
          if (monster.x === x && monster.y === y) {
            foundMonster = monster;
          }
        });
        return foundMonster;
      },

      /**
       * Return the item at (x, y), if there is one
       * @param  {number} x
       * @param  {number} y
       * @return {object}
       */
      _getItem: function(x, y) {
        var foundItem;

        this.loot.forEach(function(item) {
          if (item.x === x && item.y === y) {
            foundItem = item;
          }
        });
        return foundItem;
      },

      /**
       * Return true if a door exists at (x, y)
       * @param  {number}  x
       * @param  {number}  y
       * @return {boolean}
       */
      _hasDoor: function(x, y) {
        return this.doors.indexOf(x + ',' + y) !== -1;
      },

      /**
       * Return true if (x, y) is a valid, unoccupied tile<br>
       * (i.e. it is unoccupied by the player, a monster, or a door, and it's a valid tile)
       * @param  {number}  x
       * @param  {number}  y
       * @return {boolean}
       */
      _isAvailable: function(x, y) {
        return !(this.player.x === x && this.player.y === y) &&
          this._validTile(x, y) && !this._hasMonster(x, y) &&
          !this._hasDoor(x, y) && !this._hasItem(x, y);
      },

      _tick: function() {

        var vm = this;

        var result = {
          movedMonsters: [],
          damageToPlayer: 0
        };

        // Let each monster take an action
        vm.monsters.forEach(function(monster) {
          var action = monster.turnTick(vm);

          if (action.moved) {
            result.movedMonsters.push(monster);
          }

          result.damageToPlayer += action.damage;
        });

        // Apply any effects to the player 

        return result;
      },

      /**
       * Attempt to move add (x, y) to the creature position, and return the outcome
       * @param  {object} creature
       * @param  {number} x
       * @param  {number} y
       * @return {object} Object containing the following boolean value:
       * moved (did the creature move?), door (did they open a door?), combat (did they engage in combat?)
       */
      _moveCreature: function(creature, x, y) {
        var outcome = {
            moved: false,
            door: false,
            combat: false,
            kill: false,
            drop: false,
            action: false,
            droppedItem: ''
          },

          newX = creature.x + x,
          newY = creature.y + y,

          key = newX + ',' + newY,
          monster,
          gotitem,
          i;

        // Basic movement
        if (this._isAvailable(newX, newY)) {
          creature.x = newX;
          creature.y = newY;
          outcome.moved = true;
          outcome.action = true;
          // "Open" a door, i.e. remove it
        } else if (this._hasDoor(newX, newY)) {
          this.doors.splice(this.doors.indexOf(key), 1);
          // Let phaser know we opened the door
          outcome.door = true;
          outcome.action = true;
          // Combat
          // TODO: Place into monster AI
        } else if (this._hasMonster(newX, newY)) {
          monster = this._getMonster(newX, newY);
          outcome.monster = monster;
          if (monster.isDead === 0) {
            outcome.damageToMonster = this.playerStats.attack(monster);
            if (monster.isDead === 0) {
              outcome.damageToPlayer = monster.attack(this.playerStats);
            } else {
              outcome.kill = true;
              // Remove the monster from the dictionary - can add a special condition for skeletons
              if (monster.droppedItem !== 'nothing') {
                outcome.drop = true;
                monster.droppedItem.x = newX;
                monster.droppedItem.y = newY;
                outcome.droppedItem = monster.droppedItem;
                this.loot.push(outcome.droppedItem);
              }
              i = this.monsters.indexOf(monster);
              if (i !== -1) {
                this.monsters.splice(i, 1);
              }
            }
            outcome.combat = true;
            outcome.action = true;
          } else {
            creature.x = newX;
            creature.y = newY;
            outcome.moved = true;
            outcome.action = true;
          }
          // Pick up item
        } else if (this._hasItem(newX, newY)) {
          gotitem = this._getItem(newX, newY);
          outcome.gotitem = gotitem;
          if (this.playerStats.pickup(gotitem) === 1) {
            creature.x = newX;
            creature.y = newY;
            console.log(gotitem.name + ' gotten');
            this.loot.splice(this.loot.indexOf(gotitem), 1);
            outcome.moved = true;
            outcome.item = true;
            outcome.action = true;
          } else {
            creature.x = newX;
            creature.y = newY;
            console.log('No room for item');
            outcome.moved = true;
            outcome.action = true;
          }
        }
        return outcome;
      },

      /**
       * Generate the tiles using ROT's digger
       */
      _generate: function() {
        var digger = new ROT.Map.Digger(this.width, this.height),
          digCallback = function(x, y, value) {
            if (value) {
              return;
            }
            this.tiles[(x) + ',' + (y)] = tiles.floor;
          };
        digger.create(digCallback.bind(this));
        this.digger = digger;
      },

      /**
       * Spawn the player at (x, y)
       * @param  {number} x
       * @param  {number} y
       */
      _spawnPlayer: function(x, y) {
        this.player = this.player || {};
        this.player.x = x;
        this.player.y = y;
      },

      /**
       * Spawn the stairs in the room that was sorted to be furthest from the playher
       */
      _spawnStairs: function() {
        // Put stairs in the farthest room away
        var room = this.rooms[this.rooms.length - 1];
        this.stairs = {
          x: _.random(room._x1, room._x2),
          y: _.random(room._y1, room._y2)
        };
      },

      /**
       * Place a monster in the middle of each room, if the tile is available
       */
      _spawnMonsters: function() {
        var vm = this;
        vm.monsters = [];
        // Spawn monsters
        vm.rooms.forEach(function(room) {
          var w = room._x2 - room._x1,
            h = room._y2 - room._y1,
            area = w * h,
            x,
            y;

          // Larger rooms can spawn multiple monsters - additional chance to spawn per 12 units of area
          while (area > 0) {
            x = _.random(room._x1, room._x2);
            y = _.random(room._y1, room._y2);
            if (vm._isAvailable(x, y) && Math.random() > 0.4) {
              // 60% chance to spawn
              vm.monsters.push(creatures._putCreature(dungeon.level, x, y));
            }
            area -= 12;
          }
        });
      },

      /**
       * Place items throughout the dungeon
       */
      _spawnItems: function() {
        var vm = this;
        vm.loot = [];

        // place items
        vm.rooms.forEach(function(room) {
          var x = _.random(room._x1, room._x2),
            y = _.random(room._y1, room._y2);
          if (vm._isAvailable(x, y) && Math.random() > 0.9) {
            // 10% chance to spawn in a given room
            vm.loot.push(items._putItem(dungeon.level, x, y));
          }
        });
      },

      /**
       * Analyze ROT rooms and place doors
       */
      _placeDoors: function() {
        var doors = [];
        _.each(this.digger.getRooms(), function(room, key) {
          _.each(room._doors, function(door, key) {
            var xy = key.split(','),
              x = +xy[0],
              y = +xy[1];
            // Don't place doors next to each other
            if (!_.contains(doors, (x + 1) + ',' + (y)) &&
              !_.contains(doors, (x) + ',' + (y + 1)) &&
              !_.contains(doors, (x - 1) + ',' + (y)) &&
              !_.contains(doors, (x) + ',' + (y - 1)) &&
              // Avoid duplicates
              !_.contains(doors, key) &&
              ROT.RNG.getPercentage() <= 60) {
              doors.push(key);
            }
          });
        });
        this.doors = doors;
      },

      /**
       * Place and autojoin walls around tiles
       */
      _placeWalls: function() {
        var walls = {},

          myTiles = this.tiles,
          doors = this.doors;

        // Place unjoined walls
        _.each(myTiles, function(tile, key) {

          var xy = key.split(','),

            x = +(xy[0]),
            y = +(xy[1]),

            left = (x - 1) + ',' + (y),
            right = (x + 1) + ',' + (y),
            up = (x) + ',' + (y - 1),
            down = (x) + ',' + (y + 1),
            top_right = (x + 1) + ',' + (y - 1),
            bottom_right = (x + 1) + ',' + (y + 1),
            bottom_left = (x - 1) + ',' + (y + 1),
            top_left = (x - 1) + ',' + (y - 1),

            directions = [left, right, up, down, top_right, bottom_right, bottom_left, top_left];

          _.each(directions, function(direction) {
            if (myTiles[direction] === undefined && walls[direction] === undefined) {
              walls[direction] = true;
            }
          });
        });

        // Join walls
        _.each(walls, function(tile, key) {
          var xy = key.split(','),

            x = +(xy[0]),
            y = +(xy[1]),

            left = (x - 1) + ',' + (y),
            right = (x + 1) + ',' + (y),
            up = (x) + ',' + (y - 1),
            down = (x) + ',' + (y + 1),

            directions = [left, right, up, down],

            nearbyWalls = [];

          // Create list of surrounding walls based on direction
          _.each(directions, function(direction) {
            if (walls[direction] !== undefined || _.contains(doors, direction)) {
              nearbyWalls.push(direction);
            }
          });

          // Crosses
          if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) &&
            _.contains(nearbyWalls, up) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, up)) {
            walls[key] = tiles.wall_cross_bottom;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross_top;
          } else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, up)) {
            walls[key] = tiles.wall_cross_left;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, up) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross_right;
            // Corners
          } else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_top_left;
          } else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, left)) {
            walls[key] = tiles.wall_top_right;
          } else if (_.contains(nearbyWalls, up) && _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_bottom_left;
          } else if (_.contains(nearbyWalls, up) && _.contains(nearbyWalls, left)) {
            walls[key] = tiles.wall_bottom_right;
            // Horizontal / Vertical
          } else if (_.contains(nearbyWalls, up) || _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_vertical;
          } else if (_.contains(nearbyWalls, left) || _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_horizontal;
          }
        });

        // Smooth out "cross stacking" (optional, but looks ugly without)
        _.each(walls, function(tile, key) {
          if (_.contains(crosses, tile)) {
            var xy = key.split(','),

              x = +(xy[0]),
              y = +(xy[1]),

              left = (x - 1) + ',' + (y),
              up = (x) + ',' + (y - 1);

            // Turn cross pairs into horizontal/vertical
            if (tile === tiles.wall_cross_bottom && walls[up] === tiles.wall_cross_top) {
              walls[key] = tiles.wall_horizontal;
              walls[up] = tiles.wall_horizontal;
            } else if (tile === tiles.wall_cross_right && walls[left] === tiles.wall_cross_left) {
              walls[key] = tiles.wall_vertical;
              walls[left] = tiles.wall_vertical;
              // Decompose full crosses
            } else if (tile === tiles.wall_cross_right && walls[left] === tiles.wall_cross) {
              walls[key] = tiles.wall_vertical;
              walls[left] = tiles.wall_cross_right;
            } else if (tile === tiles.wall_cross_bottom && walls[up] === tiles.wall_cross) {
              walls[key] = tiles.wall_horizontal;
              walls[up] = tiles.wall_cross_bottom;
            } else if (tile === tiles.wall_cross && walls[left] === tiles.wall_cross_left) {
              walls[key] = tiles.wall_cross_left;
              walls[left] = tiles.wall_vertical;
            } else if (tile === tiles.wall_cross && walls[up] === tiles.wall_cross_top) {
              walls[key] = tiles.wall_cross_top;
              walls[up] = tiles.wall_horizontal;
            }
          }
        });
        this.walls = walls;
      }
    };
  }

  dungeon = _dungeon();

  // Export data
  return {
    TILE_SIZE: TILE_SIZE,
    dungeon: dungeon,
    tiles: tiles,
    creatures: creatures,
    items: items,
    _dungeon: _dungeon
  };
});