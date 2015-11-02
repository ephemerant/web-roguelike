define(['dungeon', 'qunit'], function(dungeon, QUnit) {

  var model = dungeon.dungeon;

  model._init();

  console.log(model);

  function isArray(thing) {
    return Object.prototype.toString.call(thing) === '[object Array]';
  }

  QUnit.test("Dungeon Basics: Type Checking", function(assert) {
    assert.ok(typeof dungeon.TILE_SIZE === 'number', 'TILE_SIZE is a number');
    assert.ok(typeof model === 'object', 'model is a number');
    assert.ok(typeof dungeon.tiles === 'object', 'tiles is an object');
    assert.ok(typeof dungeon.creatures === 'object', 'creatures is an object');
  });

  QUnit.test("Dungeon Model: Pre Initialization - Type Checking", function(assert) {
    assert.ok(typeof model.width === 'number');
    assert.ok(typeof model.height === 'number');
    assert.ok(typeof model.level === 'number');

    assert.ok(typeof model._init === 'function');
    assert.ok(typeof model._validTile === 'function');
    assert.ok(typeof model._isAvailable === 'function');
    assert.ok(typeof model._generate === 'function');
    assert.ok(typeof model._spawnPlayer === 'function');
    assert.ok(typeof model._spawnStairs === 'function');
    assert.ok(typeof model._spawnMonsters === 'function');
    assert.ok(typeof model._placeDoors === 'function');
    assert.ok(typeof model._placeWalls === 'function');
  });

  QUnit.test("Dungeon Model: Post Initialization - Type Checking", function(assert) {
    assert.ok(isArray(model.doors), 'doors is an array');
    assert.ok(isArray(model.monsters), 'monsters is an array');
    assert.ok(isArray(model.rooms), 'rooms is an array');
    assert.ok(typeof model.digger === 'object');
    assert.ok(typeof model.player === 'object');
    assert.ok(typeof model.stairs === 'object');
    assert.ok(typeof model.tiles === 'object');
    assert.ok(typeof model.walls === 'object');
    assert.ok(typeof model.digger === 'object');
  });

  QUnit.test("Dungeon Model: Doors", function(assert) {
    assert.ok(model.doors.length > 0);

    model.doors.forEach(function(door) {
      // Each door should be a string of "x,y" pattern
      assert.ok(typeof door === 'string');
      var xy = door.split(',');
      assert.ok(xy.length === 2);
      var x = +xy[0],
        y = +xy[1];
      assert.ok(typeof x === 'number');
      assert.ok(typeof y === 'number');
      // Upon initialization, doors should be valid, non-occupied tiles
      assert.ok(model._isAvailable(x, y), door + ' is a a valid, non-occupied door tile');
    });
  });

  QUnit.test("Dungeon Model: Monsters", function(assert) {
    assert.ok(model.monsters.length > 0);

    model.monsters.forEach(function(monster) {
      assert.ok(typeof monster === 'object');

      assert.ok(typeof monster.frame === 'number');
      assert.ok(typeof monster.hp === 'number');
      assert.ok(typeof monster.max_hp === 'number');
      assert.ok(typeof monster.name === 'string');
      assert.ok(typeof monster.sprite === 'string');
      assert.ok(typeof monster.str === 'number');
      assert.ok(typeof monster.x === 'number');
      assert.ok(typeof monster.y === 'number');

      assert.ok(model._validTile(monster.x, monster.y), monster.name + ' is at a valid tile');
      assert.ok(model._isAvailable(monster.x, monster.y) === false, monster.x + ',' + monster.y + ' is not available because a monster is in it');
    });
  });

  QUnit.test("Dungeon Model: Stairs", function(assert) {
    assert.ok(model._validTile(model.stairs.x, model.stairs.y), 'The stairs are at a valid tile');
    assert.ok(model._isAvailable(model.stairs.x, model.stairs.y) === false, model.stairs.x + ',' + model.stairs.y + ' is not available because the stairs are in it');
  });

  QUnit.test("Dungeon Model: Player", function(assert) {
    assert.ok(model._validTile(model.player.x, model.player.y), 'The player is at a valid tile');
    assert.ok(model._isAvailable(model.player.x, model.player.y) === false, model.player.x + ',' + model.player.y + ' is not available because the player is in it');
  });

  QUnit.test("Dungeon Model: Tiles", function(assert) {
    for (var key in model.tiles) {
      assert.ok(typeof key === 'string');
      var xy = key.split(',');
      assert.ok(xy.length === 2);
      var x = +xy[0],
        y = +xy[1];
      assert.ok(typeof x === 'number');
      assert.ok(typeof y === 'number');
      // Make sure the tile has a valid tilesheet index
      assert.ok(typeof model.tiles[key] === 'number');

      assert.ok(model._validTile(x, y), x + ',' + y + ' is a valid tile');
    }
  });

  QUnit.test("Dungeon Model: Walls", function(assert) {
    for (var key in model.walls) {
      assert.ok(typeof key === 'string');
      var xy = key.split(',');
      assert.ok(xy.length === 2);
      var x = +xy[0],
        y = +xy[1];
      assert.ok(typeof x === 'number');
      assert.ok(typeof y === 'number');
      // Make sure the wall has a valid tilesheet index
      assert.ok(typeof model.walls[key] === 'number');

      assert.ok(model._validTile(x, y) === false, x + ',' + y + ' is not a valid tile because it is a wall');
    }
  });

  QUnit.load();
  QUnit.start();

});