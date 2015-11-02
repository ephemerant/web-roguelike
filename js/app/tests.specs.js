define(['dungeon'], function(dungeon) {

  function isArray(thing) {
    return Object.prototype.toString.call(thing) === '[object Array]';
  }

  var model = dungeon.dungeon;

  describe("Dungeon", function() {
    describe("Type Checking", function() {
      it("Should have defined variables of valid types", function() {
        expect(typeof dungeon.TILE_SIZE).toEqual('number');
        expect(typeof model).toEqual('object');
        expect(typeof dungeon.tiles).toEqual('object');
        expect(typeof dungeon.creatures).toEqual('object');
      });
    });

    describe("Model", function() {
      describe("Type Checking - Pre Initialization", function() {
        it("Should have defined variables of valid types", function() {
          expect(typeof model.width).toEqual('number');
          expect(typeof model.height).toEqual('number');
          expect(typeof model.level).toEqual('number');

          expect(typeof model._init).toEqual('function');
          expect(typeof model._validTile).toEqual('function');
          expect(typeof model._isAvailable).toEqual('function');
          expect(typeof model._generate).toEqual('function');
          expect(typeof model._spawnPlayer).toEqual('function');
          expect(typeof model._spawnStairs).toEqual('function');
          expect(typeof model._spawnMonsters).toEqual('function');
          expect(typeof model._placeDoors).toEqual('function');
          expect(typeof model._placeWalls).toEqual('function');
        });
      });

      model._init();

      describe("Type Checking - Post Initialization", function() {
        it("Should have defined variables of valid types", function() {
          expect(isArray(model.doors)).toEqual(true);
          expect(isArray(model.monsters)).toEqual(true);
          expect(isArray(model.rooms)).toEqual(true);
          expect(typeof model.digger).toEqual('object');
          expect(typeof model.player).toEqual('object');
          expect(typeof model.stairs).toEqual('object');
          expect(typeof model.tiles).toEqual('object');
          expect(typeof model.walls).toEqual('object');
          expect(typeof model.digger).toEqual('object');
        });
      });

    });
  });

  // describe("Dungeon Model: Doors", function() {
  //   expect(model.doors.length > 0);

  //   model.doors.forEach(function(door) {
  //     // Each door should be a string of "x,y" pattern
  //     expect(typeof door === 'string');
  //     var xy = door.split(',');
  //     expect(xy.length === 2);
  //     var x = +xy[0],
  //       y = +xy[1];
  //     expect(typeof x === 'number');
  //     expect(typeof y === 'number');
  //     // Upon initialization, doors should be valid, non-occupied tiles
  //     expect(model._isAvailable(x, y), door + ' is a a valid, non-occupied door tile');
  //   });
  // });

  // describe("Dungeon Model: Monsters", function() {
  //   expect(model.monsters.length > 0);

  //   model.monsters.forEach(function(monster) {
  //     expect(typeof monster === 'object');

  //     expect(typeof monster.frame === 'number');
  //     expect(typeof monster.hp === 'number');
  //     expect(typeof monster.max_hp === 'number');
  //     expect(typeof monster.name === 'string');
  //     expect(typeof monster.sprite === 'string');
  //     expect(typeof monster.str === 'number');
  //     expect(typeof monster.x === 'number');
  //     expect(typeof monster.y === 'number');

  //     expect(model._validTile(monster.x, monster.y), monster.name + ' is at a valid tile');
  //     expect(model._isAvailable(monster.x, monster.y) === false, monster.x + ',' + monster.y + ' is not available because a monster is in it');
  //   });
  // });

  // describe("Dungeon Model: Stairs", function() {
  //   expect(model._validTile(model.stairs.x, model.stairs.y), 'The stairs are at a valid tile');
  //   expect(model._isAvailable(model.stairs.x, model.stairs.y) === false, model.stairs.x + ',' + model.stairs.y + ' is not available because the stairs are in it');
  // });

  // describe("Dungeon Model: Player", function() {
  //   expect(model._validTile(model.player.x, model.player.y), 'The player is at a valid tile');
  //   expect(model._isAvailable(model.player.x, model.player.y) === false, model.player.x + ',' + model.player.y + ' is not available because the player is in it');
  // });

  // describe("Dungeon Model: Tiles", function() {
  //   for (var key in model.tiles) {
  //     expect(typeof key === 'string');
  //     var xy = key.split(',');
  //     expect(xy.length === 2);
  //     var x = +xy[0],
  //       y = +xy[1];
  //     expect(typeof x === 'number');
  //     expect(typeof y === 'number');
  //     // Make sure the tile has a valid tilesheet index
  //     expect(typeof model.tiles[key] === 'number');

  //     expect(model._validTile(x, y), x + ',' + y + ' is a valid tile');
  //   }
  // });

  // describe("Dungeon Model: Walls", function() {
  //   for (var key in model.walls) {
  //     expect(typeof key === 'string');
  //     var xy = key.split(',');
  //     expect(xy.length === 2);
  //     var x = +xy[0],
  //       y = +xy[1];
  //     expect(typeof x === 'number');
  //     expect(typeof y === 'number');
  //     // Make sure the wall has a valid tilesheet index
  //     expect(typeof model.walls[key] === 'number');

  //     expect(model._validTile(x, y) === false, x + ',' + y + ' is not a valid tile because it is a wall');
  //   }
  // });

  // QUnit.load();
  // QUnit.start();

});