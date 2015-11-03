define(['ROT', 'lodash', 'creatures'], function(ROT, _, creatures) {

  var TILESHEET_WIDTH = 640;
  var TILE_SIZE = 32;
  var TILE_UNIT = TILESHEET_WIDTH / TILE_SIZE;

  // Wall group to use from Wall.png  
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
      wall_top_left: 0 + WALL_GROUP_UNIT,
      wall_bottom_left: 40 + WALL_GROUP_UNIT,
      // Cross pieces
      wall_cross_bottom: 44 + WALL_GROUP_UNIT,
      wall_cross_top: 4 + WALL_GROUP_UNIT,
      wall_cross_left: 23 + WALL_GROUP_UNIT,
      wall_cross_right: 25 + WALL_GROUP_UNIT,
      wall_cross: 24 + WALL_GROUP_UNIT
    };
  }

  // List of tiles and their corresponding position in the tile sheet
  var tiles = calculateTiles(TILE_UNIT * 3 * _.random(1, 8));

  // List of cross tiles, used for auto-joining
  var crosses = [tiles.wall_cross_bottom, tiles.wall_cross_top, tiles.wall_cross_left, tiles.wall_cross_right, tiles.wall_cross];

  // Dungeon factory
  function _dungeon() {
    return {
      width: 60,
      height: 40,

      level: 1,

      _init: function() {

        // Used to avoid conflicts
        var vm = this;

        tiles = calculateTiles(TILE_UNIT * 3 * _.random(1, 8));

        crosses = [tiles.wall_cross_bottom, tiles.wall_cross_top, tiles.wall_cross_left, tiles.wall_cross_right, tiles.wall_cross];

        ROT.RNG.setSeed(ROT.RNG.getUniform());

        console.log('Using RNG seed:', this._getSeed());

        vm.tiles = {};

        vm._generate();

        vm._placeDoors();

        vm._placeWalls();

        vm.rooms = vm.digger.getRooms();

        var playerRoom = vm.rooms[_.random(vm.rooms.length - 1)];

        function distance(a, b) {
          return Math.sqrt(Math.pow(a._x1 - b._x1, 2) + Math.pow(a._y1 - b._y1, 2));
        }

        // Sort based on distance from player's room
        vm.rooms.sort(function(a, b) {
          return distance(a, playerRoom) - distance(b, playerRoom);
        });

        vm._spawnPlayer(playerRoom._x1, playerRoom._y1);

        vm._spawnStairs();

        vm._spawnMonsters();
      },

      _getSeed: function() {
        return ROT.RNG.getSeed();
      },

      _validTile: function(x, y) {
        // True if (x, y) is present in tile
        return (this.tiles[x + ',' + y] !== undefined);
      },

      _isAvailable: function(x, y) {
        // True if unoccupied by the player, a monster, or stairs, and it's a valid tile
        var hasMonster = false;
        this.monsters.forEach(function(monster) {
          if (monster.x === x && monster.y === y)
            hasMonster = true;
        });
        return !hasMonster && !(this.player.x === x && this.player.y === y) && !(this.stairs.x === x && this.stairs.y === y) && this._validTile(x, y);
      },

      _generate: function() {
        var digger = new ROT.Map.Digger(this.width, this.height);
        var digCallback = function(x, y, value) {
          if (value) {
            return;
          }
          this.tiles[(x) + ',' + (y)] = tiles.floor;
        };

        digger.create(digCallback.bind(this));

        this.digger = digger;
      },

      _spawnPlayer: function(x, y) {
        this.player = this.player || {};

        this.player.x = x;
        this.player.y = y;
      },

      _spawnStairs: function() {
        // Put stairs in the farthest room away
        this.stairs = {
          x: this.rooms[this.rooms.length - 1]._x2,
          y: this.rooms[this.rooms.length - 1]._y2
        };
      },

      _spawnMonsters: function() {
        var vm = this;

        vm.monsters = [];

        // Spawn monsters
        vm.rooms.forEach(function(room) {
          var x = Math.round((room._x1 + room._x2) / 2);
          var y = Math.round((room._y1 + room._y2) / 2);
          if (vm._isAvailable(x, y)) {
            vm.monsters.push(creatures.snake(x, y));
          }
        });
      },

      // Analyze rooms and place doors
      _placeDoors: function() {
        var doors = [];
        _.each(this.digger.getRooms(), function(room, key) {
          _.each(room._doors, function(door, key) {
            var xy = key.split(',');
            var x = +xy[0],
              y = +xy[1];
            // Don't place doors next to each other
            if (_.contains(doors, (x + 1) + ',' + (y)) || _.contains(doors, (x) + ',' + (y + 1)) || _.contains(doors, (x - 1) + ',' + (y)) ||
              _.contains(doors, (x) + ',' + (y - 1))) {

            }
            // Avoid duplicates
            else if (!_.contains(doors, key)) {
              // 60% chance to spawn a door
              if (ROT.RNG.getPercentage() <= 60) {
                doors.push(key);
              }
            }
          });
        });
        this.doors = doors;
      },

      // Place and autojoin walls around tiles
      _placeWalls: function() {
        var walls = {};

        var myTiles = this.tiles;
        var doors = this.doors;

        // Place unjoined walls
        _.each(myTiles, function(tile, key) {

          var xy = key.split(',');

          var x = +(xy[0]),
            y = +(xy[1]);

          var left = (x - 1) + ',' + (y),
            right = (x + 1) + ',' + (y),
            up = (x) + ',' + (y - 1),
            down = (x) + ',' + (y + 1),
            top_right = (x + 1) + ',' + (y - 1),
            bottom_right = (x + 1) + ',' + (y + 1),
            bottom_left = (x - 1) + ',' + (y + 1),
            top_left = (x - 1) + ',' + (y - 1);

          var directions = [left, right, up, down, top_right, bottom_right, bottom_left, top_left];

          _.each(directions, function(direction) {
            if (myTiles[direction] === undefined && walls[direction] === undefined) {
              walls[direction] = true;
            }
          });
        });

        // Join walls
        _.each(walls, function(tile, key) {
          var xy = key.split(',');

          var x = +(xy[0]),
            y = +(xy[1]);

          var left = (x - 1) + ',' + (y),
            right = (x + 1) + ',' + (y),
            up = (x) + ',' + (y - 1),
            down = (x) + ',' + (y + 1);

          var directions = [left, right, up, down];

          var nearbyWalls = [];

          // Create list of surrounding walls based on direction
          _.each(directions, function(direction) {
            if (walls[direction] !== undefined || _.contains(doors, direction)) {
              nearbyWalls.push(direction);
            }
          });

          // Crosses
          if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, up) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, up)) {
            walls[key] = tiles.wall_cross_bottom;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross_top;
          } else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, right) && _.contains(nearbyWalls, up)) {
            walls[key] = tiles.wall_cross_left;
          } else if (_.contains(nearbyWalls, left) && _.contains(nearbyWalls, up) && _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_cross_right;
          }
          // Corners
          else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_top_left;
          } else if (_.contains(nearbyWalls, down) && _.contains(nearbyWalls, left)) {
            walls[key] = tiles.wall_top_right;
          } else if (_.contains(nearbyWalls, up) && _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_bottom_left;
          } else if (_.contains(nearbyWalls, up) && _.contains(nearbyWalls, left)) {
            walls[key] = tiles.wall_bottom_right;
          }
          // Horizontal / Vertical
          else if (_.contains(nearbyWalls, up) || _.contains(nearbyWalls, down)) {
            walls[key] = tiles.wall_vertical;
          } else if (_.contains(nearbyWalls, left) || _.contains(nearbyWalls, right)) {
            walls[key] = tiles.wall_horizontal;
          }
        });

        // Smooth out cross stacking (optional, but looks ugly without)
        _.each(walls, function(tile, key) {
          if (_.contains(crosses, tile)) {
            var xy = key.split(',');

            var x = +(xy[0]),
              y = +(xy[1]);

            var left = (x - 1) + ',' + (y),
              up = (x) + ',' + (y - 1);

            // Turn cross pairs into horizontal/vertical
            if (tile === tiles.wall_cross_bottom && walls[up] === tiles.wall_cross_top) {
              walls[key] = tiles.wall_horizontal;
              walls[up] = tiles.wall_horizontal;
            } else if (tile === tiles.wall_cross_right && walls[left] === tiles.wall_cross_left) {
              walls[key] = tiles.wall_vertical;
              walls[left] = tiles.wall_vertical;
            }
            // Decompose full crosses
            else if (tile === tiles.wall_cross_right && walls[left] === tiles.wall_cross) {
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

  // The main dungeon object
  var dungeon = _dungeon();

  // Export data
  return {
    TILE_SIZE: TILE_SIZE,
    dungeon: dungeon,
    tiles: tiles,
    creatures: creatures,
    _dungeon: _dungeon
  };
});