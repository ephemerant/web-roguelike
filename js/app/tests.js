define(['dungeon'], function(dungeon) {

  // From dictionary
  function expectType(variable, model, types) {
    it('should have variable "' + variable + '" of type "' + types[variable].name + '"', function() {
      expect(model[variable]).toEqual(jasmine.any(types[variable]));
    });
  }

  // From simple input
  function expectSimpleType(variable, type, desc) {
    it(desc || 'should be of type "' + type.name + '"', function() {
      expect(variable).toEqual(jasmine.any(type));
    });
  }

  // From simple input
  function expectSimpleMatch(variable, pattern) {
    it('should match pattern "' + pattern + '"', function() {
      expect(variable).toMatch(pattern);
    });
  }

  function expectValidDoor(door) {
    describe('Door at ' + door, function() {
      // Each door should be a string of 'x,y' pattern
      expectSimpleMatch(door, /^(\d+),(\d+)$/);

      var match = door.match(/^(\d+),(\d+)$/);

      var x = +match[1],
        y = +match[2];

      // Upon initialization, doors should be valid, non-occupied tiles
      it('should be a valid, non-occupied tile', function() {
        expect(model._isAvailable(x, y)).toBe(true);
      });
    });
  }

  function expectValidMonster(monster) {
    describe(monster.name + ' at ' + monster.x + ',' + monster.y, function() {

      expectSimpleType(monster, Object);

      var types = {
        frame: Number,
        hp: Number,
        name: String,
        sprite: String,
        str: Number,
        x: Number,
        y: Number
      };

      for (var variable in types) {
        expectType(variable, monster, types);
      }

      it('should be at a valid tile', function() {
        expect(model._validTile(monster.x, monster.y)).toBe(true);
      });

      it('should occupy its tile', function() {
        expect(model._isAvailable(monster.x, monster.y)).toBe(false);
      });
    });
  }

  function expectValidTile(key) {
    describe('Tile at ' + key, function() {
      // Each key should be a string of 'x,y' pattern
      expectSimpleMatch(key, /^(\d+),(\d+)$/);

      var match = key.match(/^(\d+),(\d+)$/);

      var x = +match[1],
        y = +match[2];

      expectSimpleType(model.tiles[key], Number, 'should have a numeric tilesheet index');

      it('should be a valid tile', function() {
        expect(model._validTile(x, y)).toBe(true);
      });
    });
  }

  function expectValidWall(key) {
    describe('Wall at ' + key, function() {
      // Each key should be a string of 'x,y' pattern
      expectSimpleMatch(key, /^(\d+),(\d+)$/);

      var match = key.match(/^(\d+),(\d+)$/);

      var x = +match[1],
        y = +match[2];

      expectSimpleType(model.walls[key], Number, 'should have a numeric tilesheet index');

      it('should be an invalid tile', function() {
        expect(model._validTile(x, y)).toBe(false);
      });
    });
  }

  var model = dungeon.dungeon;

  describe('Dungeon', function() {
    describe('Types', function() {
      var types = {
        TILE_SIZE: Number,
        dungeon: Object,
        tiles: Object,
        creatures: Object
      };
      for (var variable in types) {
        expectType(variable, dungeon, types);
      }
    });

    describe('Model', function() {
      describe('Types (Pre Initialization)', function() {
        var types = {
          width: Number,
          height: Number,
          level: Number,
          _init: Function,
          _validTile: Function,
          _isAvailable: Function,
          _generate: Function,
          _spawnPlayer: Function,
          _spawnStairs: Function,
          _spawnMonsters: Function,
          _placeDoors: Function,
          _placeWalls: Function
        };
        for (var variable in types) {
          expectType(variable, model, types);
        }
      });

      model._init();

      describe('Types (Post Initialization)', function() {
        var types = {
          doors: Array,
          monsters: Array,
          rooms: Array,
          digger: Object,
          player: Object,
          stairs: Object,
          tiles: Object,
          walls: Object
        };
        for (var variable in types) {
          expectType(variable, model, types);
        }
      });

      describe('Doors', function() {
        it('should have length > 0', function() {
          expect(model.doors.length).toBeGreaterThan(0);
        });
        model.doors.forEach(function(door) {
          expectValidDoor(door);
        });
      });

    });

    describe('Monsters', function() {
      it('should have length > 0', function() {
        expect(model.monsters.length).toBeGreaterThan(0);
      });

      model.monsters.forEach(function(monster) {
        expectValidMonster(monster);
      });
    });

    describe('Stairs', function() {
      it('should be at a valid tile', function() {
        expect(model._validTile(model.stairs.x, model.stairs.y)).toBe(true);
      });

      it('should occupy its tile', function() {
        expect(model._isAvailable(model.stairs.x, model.stairs.y)).toBe(false);
      });
    });

    describe('Player', function() {
      it('should be at a valid tile', function() {
        expect(model._validTile(model.player.x, model.player.y)).toBe(true);
      });

      it('should occupy its tile', function() {
        expect(model._isAvailable(model.player.x, model.player.y)).toBe(false);
      });
    });

    describe('Tiles', function() {
      for (var key in model.tiles) {
        expectValidTile(key);
      }
    });

    describe('Walls', function() {
      for (var key in model.walls) {
        expectValidWall(key);
      }
    });

  });
});