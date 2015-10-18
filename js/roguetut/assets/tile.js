/*global Game */
/*jslint nomen: true*/

Game.Tile = function (properties) {
    'use strict';
    properties = properties || {};
    // Call the Glyph constructor with our properties
    Game.Glyph.call(this, properties);
    // Set up the properties. We use false by default.
    this._isWalkable = properties.isWalkable || false;
    //this._isDiggable = properties.isDiggable || false;
};
// Make tiles inherit all the functionality from glyphs
Game.Tile.extend(Game.Glyph);

// Standard getters
Game.Tile.prototype.isWalkable = function () {
    'use strict';
    return this._isWalkable;
};
Game.Tile.prototype.isDiggable = function () {
    'use strict';
    return this._isDiggable;
};

Game.Tile.nullTile = new Game.Tile({});
Game.Tile.floorTile = new Game.Tile({
    character: '.',
    isWalkable: true
});
Game.Tile.wallTile = new Game.Tile({
    character: '#',
    foreground: 'goldenrod',
    isWalkable: false
});
