/*global Game */
/*jslint nomen: true*/

Game.Glyph = function (properties) {
    'use strict';
    // Instantiate properties to default if they weren't passed
    properties = properties || {};
    this._char = properties.character || ' ';
    this._foreground = properties.foreground || 'white';
    this._background = properties.background || 'black';
};

// Create standard getters for glyphs
Game.Glyph.prototype.getChar = function () {
    'use strict';
    return this._char;
};
Game.Glyph.prototype.getBackground = function () {
    'use strict';
    return this._background;
};
Game.Glyph.prototype.getForeground = function () {
    'use strict';
    return this._foreground;
};
