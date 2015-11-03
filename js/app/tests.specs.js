define(['dungeon'], function(dungeon) {

  // From dictionary
  function expectType(variable, model, types) {
    it('should have variable "' + variable + '" of type "' + types[variable].name + '"', function() {
      expect(model[variable]).toEqual(jasmine.any(types[variable]));
    });
  }

  // From simple input
  function expectSimpleType(variable, type) {
    it('should be of type ' + type.name + '"', function() {
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
      it('should be a valid, non-occupied tile', function () {
        expect(model._isAvailable(x, y)).toBe(true);
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

      console.log(model);

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
  });

  // describe('Dungeon Model: Monsters', function() {
  //   expect(model.monsters.length > 0);

  //   model.monsters.forEach(function(monster) {
  //     expect(typeof monster === Object);

  //     expect(typeof monster.frame === Number);
  //     expect(typeof monster.hp === Number);
  //     expect(typeof monster.max_hp === Number);
  //     expect(typeof monster.name === 'string');
  //     expect(typeof monster.sprite === 'string');
  //     expect(typeof monster.str === Number);
  //     expect(typeof monster.x === Number);
  //     expect(typeof monster.y === Number);

  //     expect(model._validTile(monster.x, monster.y), monster.name + ' is at a valid tile');
  //     expect(model._isAvailable(monster.x, monster.y) === false, monster.x + ',' + monster.y + ' is not available because a monster is in it');
  //   });
  // });

  // describe('Dungeon Model: Stairs', function() {
  //   expect(model._validTile(model.stairs.x, model.stairs.y), 'The stairs are at a valid tile');
  //   expect(model._isAvailable(model.stairs.x, model.stairs.y) === false, model.stairs.x + ',' + model.stairs.y + ' is not available because the stairs are in it');
  // });

  // describe('Dungeon Model: Player', function() {
  //   expect(model._validTile(model.player.x, model.player.y), 'The player is at a valid tile');
  //   expect(model._isAvailable(model.player.x, model.player.y) === false, model.player.x + ',' + model.player.y + ' is not available because the player is in it');
  // });

  // describe('Dungeon Model: Tiles', function() {
  //   for (var key in model.tiles) {
  //     expect(typeof key === 'string');
  //     var xy = key.split(',');
  //     expect(xy.length === 2);
  //     var x = +xy[0],
  //       y = +xy[1];
  //     expect(typeof x === Number);
  //     expect(typeof y === Number);
  //     // Make sure the tile has a valid tilesheet index
  //     expect(typeof model.tiles[key] === Number);

  //     expect(model._validTile(x, y), x + ',' + y + ' is a valid tile');
  //   }
  // });

  // describe('Dungeon Model: Walls', function() {
  //   for (var key in model.walls) {
  //     expect(typeof key === 'string');
  //     var xy = key.split(',');
  //     expect(xy.length === 2);
  //     var x = +xy[0],
  //       y = +xy[1];
  //     expect(typeof x === Number);
  //     expect(typeof y === Number);
  //     // Make sure the wall has a valid tilesheet index
  //     expect(typeof model.walls[key] === Number);

  //     expect(model._validTile(x, y) === false, x + ',' + y + ' is not a valid tile because it is a wall');
  //   }
  // });

  // QUnit.load();
  // QUnit.start();

});