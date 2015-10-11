/*global Game */
/*jslint nomen: true*/

Game.Tile = function (glyph) {
    'use strict';
    this._glyph = glyph;
};

Game.Tile.prototype.getGlyph = function () {
    'use strict';
    return this._glyph;
};

Game.Tile.nullTile = new Game.Tile(new Game.Glyph());
Game.Tile.floorTile = new Game.Tile(new Game.Glyph('.'));
Game.Tile.wallTile = new Game.Tile(new Game.Glyph('#', 'goldenrod'));
