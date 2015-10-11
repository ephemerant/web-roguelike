/*global Game */
/*jslint nomen: true*/

Game.Map = function (tiles) {
    'use strict';
    this._tiles = tiles;
    // cache the width and height based
    // on the length of the dimensions of
    // the tiles array
    this._width = tiles.length;
    this._height = tiles[0].length;
};

// Standard getters
Game.Map.prototype.getWidth = function () {
    'use strict';
    return this._width;
};
Game.Map.prototype.getHeight = function () {
    'use strict';
    return this._height;
};

// Gets the tile for a given coordinate set
Game.Map.prototype.getTile = function (x, y) {
    'use strict';
    // Make sure we are inside the bounds. If we aren't, return
    // null tile.
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
        return Game.Tile.nullTile;
    } else {
        return this._tiles[x][y] || Game.Tile.nullTile;
    }
};
